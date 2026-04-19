export const productTypeOptions = [
  {
    value: 'Trending Summer Products',
    label: 'Normal Physical Product',
    hint: 'Dropshipping, cooler, gadgets, home essentials'
  },
  {
    value: 'Microgreens',
    label: 'Plant Based / Microgreen Product',
    hint: 'Fresh microgreens, plant-based healthy products'
  },
  {
    value: 'Digital Products',
    label: 'Digital Product',
    hint: 'PDF, guide, course, downloadable product'
  },
  {
    value: 'Hot Deals',
    label: 'Hot Deals',
    hint: 'High discount physical products'
  },
  {
    value: 'Recommended for You',
    label: 'Recommended Product',
    hint: 'Basket builders and suggested products'
  }
];

export function getProductType(product) {
  const text = `${product?.category || ''} ${product?.title || ''}`.toLowerCase();

  if (text.includes('digital') || text.includes('pdf') || text.includes('course') || text.includes('download')) {
    return {
      label: 'Digital Product',
      badge: 'Instant access',
      tone: 'bg-blue-50 text-blue-700 border-blue-100'
    };
  }

  if (text.includes('microgreen') || text.includes('plant') || text.includes('organic')) {
    return {
      label: 'Plant Based',
      badge: 'Fresh microgreens',
      tone: 'bg-emerald-50 text-emerald-700 border-emerald-100'
    };
  }

  return {
    label: 'Physical Product',
    badge: 'COD Available',
    tone: 'bg-orange-50 text-orange-700 border-orange-100'
  };
}

export function getRecentOrderCount(product) {
  const seed = String(product?.id || product?.slug || product?.title || 'bharatmart')
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return 1000 + (seed % 850);
}
