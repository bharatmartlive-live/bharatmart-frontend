import { HeroSection } from '../components/home/HeroSection';
import { ProductSection } from '../components/home/ProductSection';
import { useShop } from '../hooks/useShop';

export function HomePage() {
  const { products, coupons, loading, storeError } = useShop();
  const microgreenProducts = products.filter((product) => product.category === 'Microgreens');
  const digitalProducts = products.filter((product) => product.category === 'Digital Products');
  const physicalTrendingProducts = products.filter((product) => product.category === 'Trending Summer Products');
  const trendingProducts = [...physicalTrendingProducts, ...microgreenProducts].filter(
    (product, index, list) => list.findIndex((entry) => entry.id === product.id) === index
  );
  const hotDealProducts = products.filter((product) => product.category === 'Hot Deals' || Number(product.discount) >= 20);
  const recommendedProducts = products.filter((product) => product.category === 'Recommended for You');
  const hasCuratedCategories =
    trendingProducts.length || hotDealProducts.length || recommendedProducts.length || digitalProducts.length;

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
      {loading && !products.length ? (
        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-soft">
            <div className="flex flex-col items-center justify-center text-center">
              <span className="grid size-14 place-items-center rounded-full bg-orange-100">
                <span className="size-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </span>
              <h2 className="mt-5 text-2xl font-black text-ink">Loading products, please wait...</h2>
              <p className="mt-2 max-w-xl text-sm text-slate-600">
                We are connecting to live BharatMart inventory. Your deals will appear automatically.
              </p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50">
                  <div className="h-56 animate-pulse bg-gradient-to-br from-orange-100 via-slate-100 to-blue-100" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-10 animate-pulse rounded-2xl bg-orange-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <ProductSection
        title="Trending Physical + Microgreen Products"
        subtitle="A systematic mix of fast-moving dropshipping products like coolers and fresh plant-based microgreens."
        products={hasCuratedCategories ? trendingProducts : products.slice(0, 8)}
      />
      {(trendingProducts.length || digitalProducts.length) ? (
        <section className="mx-auto max-w-7xl px-4 py-4">
          <div className="grid gap-4 rounded-[30px] border border-slate-100 bg-white p-5 shadow-soft md:grid-cols-3">
            <div className="rounded-3xl bg-orange-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Physical Products</p>
              <h3 className="mt-2 text-xl font-black text-ink">Coolers, gadgets, home essentials</h3>
              <p className="mt-2 text-sm text-slate-600">COD-ready products for quick impulse purchases.</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Plant Based</p>
              <h3 className="mt-2 text-xl font-black text-ink">Microgreens and fresh wellness</h3>
              <p className="mt-2 text-sm text-slate-600">Clearly separated so customers understand freshness and category.</p>
            </div>
            <div className="rounded-3xl bg-blue-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Digital Products</p>
              <h3 className="mt-2 text-xl font-black text-ink">Guides, PDFs, courses</h3>
              <p className="mt-2 text-sm text-slate-600">Instant-access products organized away from physical stock.</p>
            </div>
          </div>
        </section>
      ) : null}
      <ProductSection
        title="Fresh Microgreens"
        subtitle="Plant-based products for health-focused buyers, separated from normal physical inventory."
        products={microgreenProducts}
      />
      <ProductSection
        title="Digital Products"
        subtitle="Sell downloadable guides, courses, plans, and other instant-access digital items from the same store."
        products={digitalProducts}
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
