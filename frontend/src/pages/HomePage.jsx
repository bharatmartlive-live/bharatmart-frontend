import { HeroSection } from '../components/home/HeroSection';
import { ProductSection } from '../components/home/ProductSection';
import { useShop } from '../hooks/useShop';

export function HomePage() {
  const { products, coupons, loading, storeError } = useShop();
  const trendingProducts = products.filter((product) => product.category === 'Trending Summer Products');
  const hotDealProducts = products.filter((product) => product.category === 'Hot Deals' || Number(product.discount) >= 20);
  const recommendedProducts = products.filter((product) => product.category === 'Recommended for You');
  const hasCuratedCategories = trendingProducts.length || hotDealProducts.length || recommendedProducts.length;

  return (
    <>
      <HeroSection />
      {storeError ? (
        <section className="mx-auto max-w-7xl px-4 pt-6">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800 shadow-soft">
            {storeError}
          </div>
        </section>
      ) : null}
      <section className="mx-auto max-w-7xl px-4 py-4">
        <div className="grid gap-4 rounded-[28px] bg-white p-6 shadow-soft md:grid-cols-2 xl:grid-cols-4">
          {coupons.map((coupon) => (
            <div key={coupon.id ?? coupon.code} className="rounded-3xl bg-cream p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Coupon</p>
              <p className="mt-2 text-2xl font-black text-ink">{coupon.code}</p>
              <p className="mt-1 text-sm text-slate-600">Save {coupon.discount}% on eligible items</p>
            </div>
          ))}
        </div>
      </section>
      <ProductSection
        title="Trending Summer Products"
        subtitle="High-intent picks shoppers are grabbing right now for peak heat, travel, and everyday comfort."
        products={hasCuratedCategories ? trendingProducts : products.slice(0, 8)}
      />
      <div id="hot-deals">
        <ProductSection
          title="Hot Deals"
          subtitle="Conversion-focused offers with sharper discounts, stronger urgency, and high click-through potential."
          products={hasCuratedCategories ? hotDealProducts : products.filter((product) => Number(product.discount) > 0)}
        />
      </div>
      <ProductSection
        title="Recommended for You"
        subtitle="Personalized-feel merchandising blocks that surface premium accessories and basket builders."
        products={hasCuratedCategories ? recommendedProducts : products.slice(8, 16)}
      />
      {!loading && !products.length && !storeError ? (
        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="rounded-[28px] bg-white p-8 text-center shadow-soft">
            <h2 className="text-2xl font-black text-ink">No live products found</h2>
            <p className="mt-2 text-sm text-slate-600">Add products from the admin dashboard and they will appear here.</p>
          </div>
        </section>
      ) : null}
    </>
  );
}
