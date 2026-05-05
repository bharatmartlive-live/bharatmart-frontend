import { Eye, MessageSquareQuote, PlayCircle, ShoppingCart, ShieldCheck, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAverageRating,
  getProductFaqs,
  getProductReviews,
  getReviewVolume,
  getVisibleReviewCount
} from '../data/productExperience';
import { useLiveViewers } from '../hooks/useLiveViewers';
import { useShop } from '../hooks/useShop';
import { getProductType, getRecentOrderCount } from '../lib/productTypes';

function getYouTubeEmbedUrl(url = '') {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&/]+)/);
  const watchMatch = url.match(/[?&]v=([^?&]+)/);
  const shortMatch = url.match(/youtu\.be\/([^?&/]+)/);
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/);
  const videoId = shortsMatch?.[1] || watchMatch?.[1] || shortMatch?.[1] || embedMatch?.[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
}

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { products, addToCart } = useShop();
  const product = products.find((item) => item.slug === slug || String(item.id) === slug);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeMedia, setActiveMedia] = useState('image');
  const viewers = useLiveViewers('product');

  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">Product not found.</div>;
  }

  const discountedPrice = product.price - (product.price * product.discount) / 100;
  const media = product.imageUrls || [];
  const lowStock = Number(product.stock) <= 5;
  const specifications = product.specifications || [];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(product.video_url);
  const productType = getProductType(product);
  const recentOrders = getRecentOrderCount(product);
  const reviews = getProductReviews(product);
  const averageRating = getAverageRating(product);
  const reviewVolume = getReviewVolume(product);
  const visibleReviewCount = getVisibleReviewCount(product);
  const faqs = getProductFaqs(product);

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 animate-page sm:px-4 sm:py-8">
      <div className="mb-4 text-sm text-slate-500">Home / Products / {product.title}</div>

      <div className="grid gap-7 lg:grid-cols-[1.05fr,0.95fr] lg:gap-10">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-soft sm:rounded">
            <span className="absolute left-4 top-4 z-10 rounded bg-red-500 px-3 py-1 text-xs font-black text-white">
              {product.discount}% OFF
            </span>
            {activeMedia === 'video' && youtubeEmbedUrl ? (
              <iframe
                key={youtubeEmbedUrl}
                src={`${youtubeEmbedUrl}?autoplay=1&rel=0`}
                title={`${product.title} video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-[320px] w-full bg-black sm:h-[440px]"
              />
            ) : activeMedia === 'video' && product.video_url ? (
              <video key={product.video_url} controls playsInline preload="metadata" className="h-[320px] w-full bg-black object-contain sm:h-[440px]">
                <source src={product.video_url} type="video/mp4" />
                Your browser does not support video playback.
              </video>
            ) : (
              <img
                src={media[activeIndex]}
                alt={product.title}
                className="h-[320px] w-full object-contain p-4 transition duration-500 hover:scale-[1.02] sm:h-[440px] sm:p-6"
              />
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {media.map((src, index) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setActiveIndex(index);
                  setActiveMedia('image');
                }}
                className={`shrink-0 overflow-hidden rounded-lg border p-1 transition active:scale-95 hover:-translate-y-0.5 ${
                  activeMedia === 'image' && activeIndex === index ? 'border-orange-500' : 'border-slate-200'
                }`}
              >
                <img src={src} alt="" className="h-16 w-16 object-cover" />
              </button>
            ))}
            {product.video_url ? (
              <button
                type="button"
                onClick={() => setActiveMedia('video')}
                className={`relative flex h-[74px] w-[74px] shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-slate-950 text-white transition active:scale-95 hover:-translate-y-0.5 ${
                  activeMedia === 'video' ? 'border-orange-500' : 'border-slate-200'
                }`}
              >
                <PlayCircle className="h-8 w-8" />
                <span className="absolute bottom-1 text-[10px] font-bold">Video</span>
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
            <Eye className="h-4 w-4" /> {viewers.toLocaleString('en-IN')} people viewing now
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`rounded-full border px-4 py-2 text-xs font-black ${productType.tone}`}>
              {productType.label}
            </span>
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black text-white">
              {recentOrders.toLocaleString('en-IN')}+ orders in last 5 days
            </span>
          </div>
          <h1 className="mt-5 text-2xl font-black leading-tight text-ink sm:text-3xl md:text-4xl">{product.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
              <Star className="h-4 w-4 fill-current" /> {averageRating} average rating
            </p>
            <p className="text-sm font-bold text-slate-500">
              {reviewVolume.toLocaleString('en-IN')}+ reviews by customers in last 1 month
            </p>
          </div>

          <div className="mt-5 rounded bg-orange-50 p-5">
            <div className="flex flex-wrap items-end gap-3">
              <p className="text-3xl font-black text-ink sm:text-4xl">Rs {Math.round(discountedPrice)}</p>
              <p className="pb-1 text-lg text-slate-400 line-through">Rs {product.price}</p>
              <p className="pb-1 text-sm font-bold text-emerald-600">{product.discount}% off</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
              Only {product.stock} pcs left! Buy fast
            </p>
            <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-bold text-yellow-700">
              Flat 15% OFF - Limited Time Offer
            </p>
            {lowStock ? (
              <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
                Low stock alert: if sold out, expected restock is around 14 days.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="inline-flex items-center justify-center gap-2 rounded bg-orange-500 px-6 py-3 text-sm font-bold text-white transition active:scale-95 hover:bg-orange-600"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="rounded border border-orange-500 px-6 py-3 text-sm font-bold text-orange-600 transition active:scale-95 hover:bg-orange-50"
            >
              Buy Now
            </button>
          </div>

          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            Cash on Delivery Available - Pay safely at your doorstep
          </div>

          <div className="mt-5 rounded border border-slate-200 bg-white p-5">
            <h2 className="font-black text-ink">Product Description</h2>
            {specifications.length ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
                {specifications.map((item, index) => (
                  <div
                    key={`${item.label}-${index}`}
                    className={`grid grid-cols-[0.85fr,1.15fr] text-sm ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}
                  >
                    <div className="px-3 py-3 font-medium text-slate-500 sm:px-4">{item.label}</div>
                    <div className="px-3 py-3 font-semibold text-slate-900 sm:px-4">{item.value}</div>
                  </div>
                ))}
              </div>
            ) : null}
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              <li>{product.description}</li>
              <li>Space-saving portable design for everyday home, office, and travel use.</li>
            </ul>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ['Best Price', 'Save with summer coupons'],
              ['Trusted Seller', 'Verified BharatMart store'],
              ['Fast Shipping', 'Trackable order updates'],
              ['Secure Payment', 'COD and prepaid available']
            ].map(([title, text]) => (
              <div key={title} className="rounded-lg bg-slate-50 p-4 text-sm transition hover:-translate-y-0.5 hover:shadow-soft">
                <p className="flex items-center gap-2 font-bold text-ink"><ShieldCheck className="h-4 w-4 text-emerald-500" /> {title}</p>
                <p className="mt-1 text-slate-500"><Truck className="mr-1 inline h-4 w-4" />{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-[34px] border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-600">Customer Reviews</p>
            <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">Real Indian buyer reviews / Asli customer feedback</h2>
            <p className="mt-2 text-sm text-slate-600">
              {visibleReviewCount} reviews shown below. {reviewVolume.toLocaleString('en-IN')}+ more customers reviewed this product in the last 1 month.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Average Rating</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-black">
                <Star className="h-5 w-5 fill-current text-yellow-400" /> {averageRating}
              </p>
            </div>
            <div className="rounded-2xl bg-orange-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Visible Reviews</p>
              <p className="mt-1 text-2xl font-black text-ink">{visibleReviewCount}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Last 1 Month</p>
              <p className="mt-1 text-2xl font-black text-ink">{reviewVolume.toLocaleString('en-IN')}+</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-orange-100 text-sm font-black text-orange-700">
                  {review.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-black text-ink">{review.name}</p>
                      <p className="text-xs text-slate-500">{review.city} | {review.date}</p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-amber-600 shadow-sm">
                      {Array.from({ length: review.rating }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">{review.body}</p>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    <MessageSquareQuote className="h-3.5 w-3.5" /> Verified purchase
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-orange-50 p-5 text-center">
          <p className="text-lg font-black text-ink">{reviewVolume.toLocaleString('en-IN')}+ aur customer reviews available</p>
          <p className="mt-2 text-sm text-slate-600">Top reviews yahan dikhaye gaye hain taki buyer jaldi aur confidently decision le sake.</p>
        </div>
      </div>

      <div className="mt-10 rounded-[34px] border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-600">Product FAQ</p>
        <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">Kharidne se pehle log kya poochte hain</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <article key={question} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <h3 className="font-black text-ink">{question}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
