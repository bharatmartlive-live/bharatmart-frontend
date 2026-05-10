import { createContext, useEffect, useMemo, useState } from 'react';
import { api, withMediaUrl } from '../lib/api';
import { trackAnalyticsEvent } from '../lib/analytics';
import {
  fallbackAnnouncements,
  fallbackCoupons,
  fallbackProducts
} from '../data/fallback';

export const ShopContext = createContext(null);

const CART_KEY = 'bharatmart-cart';
const PRODUCTS_CACHE_KEY = 'bharatmart-live-products';

const readCachedProducts = () => {
  try {
    const saved = localStorage.getItem(PRODUCTS_CACHE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const parseImages = (product) => ({
  ...product,
  imageUrls: parseJsonArray(product.image_urls).map(withMediaUrl),
  specifications: parseJsonArray(product.specifications),
  video_url: withMediaUrl(product.video_url || '')
});

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function requestWithRetry(request, retries = 4) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await wait(900 * 1.7 ** attempt);
      }
    }
  }

  throw lastError;
}

export function ShopProvider({ children }) {
  const [products, setProducts] = useState(readCachedProducts);
  const [announcements, setAnnouncements] = useState(fallbackAnnouncements);
  const [coupons, setCoupons] = useState(fallbackCoupons);
  const [storeError, setStoreError] = useState('');
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let mounted = true;

    async function loadStorefront() {
      setLoading(true);

      try {
        const productsRes = await requestWithRetry(() => api.get('/products'), 5);

        if (!mounted) return;

        const liveProducts = (productsRes.data.data || []).map(parseImages);
        setProducts(liveProducts);
        localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(liveProducts));
        setStoreError('');
      } catch (error) {
        if (!mounted) return;
        setStoreError('We could not load live products right now. Please wait a few seconds or refresh the page.');
        setProducts((current) => (current.length ? current : import.meta.env.PROD ? [] : fallbackProducts.map(parseImages)));
      }

      try {
        const contentRes = await requestWithRetry(() => api.get('/admin/storefront'), 2);

        if (!mounted) return;

        setAnnouncements(
          contentRes.data.data.announcements?.length
            ? contentRes.data.data.announcements.map((item) => item.text)
            : fallbackAnnouncements
        );
        setCoupons(contentRes.data.data.coupons?.length ? contentRes.data.data.coupons : fallbackCoupons);
      } catch (error) {
        if (!mounted) return;
        setAnnouncements(fallbackAnnouncements);
        setCoupons(fallbackCoupons);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStorefront();
    return () => {
      mounted = false;
    };
  }, [reloadAttempt]);

  useEffect(() => {
    if (products.length || loading || !storeError) return undefined;
    const timer = window.setTimeout(() => setReloadAttempt((attempt) => attempt + 1), 12000);
    return () => window.clearTimeout(timer);
  }, [loading, products.length, storeError]);

  useEffect(() => {
    const retryWhenCustomerReturns = () => {
      if (document.visibilityState === 'visible') {
        setReloadAttempt((attempt) => attempt + 1);
      }
    };
    const retryWhenOnline = () => setReloadAttempt((attempt) => attempt + 1);

    window.addEventListener('online', retryWhenOnline);
    document.addEventListener('visibilitychange', retryWhenCustomerReturns);

    return () => {
      window.removeEventListener('online', retryWhenOnline);
      document.removeEventListener('visibilitychange', retryWhenCustomerReturns);
    };
  }, []);

  useEffect(() => {
    if (!cartFeedback) return undefined;
    const timer = window.setTimeout(() => setCartFeedback(null), 2200);
    return () => window.clearTimeout(timer);
  }, [cartFeedback]);

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean),
    [cart, products]
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.price - (item.price * item.discount) / 100),
    0
  );

  const addToCart = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (product) {
      setCartFeedback({
        id: `${productId}-${Date.now()}`,
        title: product.title,
        image: product.imageUrls?.[0]
      });

      trackAnalyticsEvent({
        eventType: 'add_to_cart',
        productId: product.id
      });
    }

    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart((current) => current.filter((item) => item.productId !== productId));
      return;
    }

    setCart((current) =>
      current.map((item) => (item.productId === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const value = {
    products,
    announcements,
    coupons,
    cartItems,
    cartCount,
    cartSubtotal,
    cartFeedback,
    storeError,
    loading,
    addToCart,
    updateQuantity,
    clearCart
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
