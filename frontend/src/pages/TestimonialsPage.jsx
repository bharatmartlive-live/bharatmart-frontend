import { MessageSquareQuote, Star } from 'lucide-react';
import { testimonials } from '../data/content';
import { storeCampaign } from '../data/storeCampaign';

const totalReviewVolume = storeCampaign.testimonialReviewVolume;
const averageRating = 4.8;

export function TestimonialsPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="overflow-hidden rounded-[36px] bg-gradient-to-br from-orange-50 via-white to-blue-50 p-8 shadow-soft sm:p-10">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">Customer Stories</p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black text-ink sm:text-5xl">
              What buyers are saying about BharatMart.live
            </h1>
            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              Read real purchase experiences from buyers across India. Strong product trust, clear
              offers, smooth delivery updates, and easier checkout are the themes customers mention
              most.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">
                Average Rating
              </p>
              <p className="mt-2 flex items-center gap-2 text-3xl font-black">
                <Star className="h-6 w-6 fill-current text-yellow-400" /> {averageRating}
              </p>
            </div>
            <div className="rounded-3xl bg-orange-50 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                Top Reviews
              </p>
              <p className="mt-2 text-3xl font-black text-ink">{testimonials.length}</p>
            </div>
            <div className="rounded-3xl bg-emerald-50 px-5 py-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">
                Last 2 Months
              </p>
              <p className="mt-2 text-3xl font-black text-ink">
                {totalReviewVolume.toLocaleString('en-IN')}+
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Featured Buyers
          </p>
          <p className="mt-3 text-2xl font-black text-ink">10 to 15 top visible stories</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            We surface only a small set of featured reviews here so the page stays easy to browse on
            both mobile and desktop.
          </p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Review Quality
          </p>
          <p className="mt-3 text-2xl font-black text-ink">High trust buyer language</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            The reviews focus on checkout trust, delivery clarity, and product value instead of
            generic filler text.
          </p>
        </div>
        <div className="rounded-[28px] bg-white p-6 shadow-soft">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            More Feedback
          </p>
          <p className="mt-3 text-2xl font-black text-ink">
            {totalReviewVolume.toLocaleString('en-IN')}+ more reviews in last 2 months
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Fresh customer feedback continues to grow across cooling products, microgreens, and
            digital items.
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((item) => (
          <article
            key={`${item.name}-${item.product}`}
            className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-4xl font-black text-orange-500">"</p>
              <div className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
                {Array.from({ length: item.rating || 5 }).map((_, index) => (
                  <Star key={index} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
            </div>
            <p className="mt-4 leading-7 text-slate-600">{item.text}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">{item.product}</span>
              <span>{item.date}</span>
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="font-black text-ink">{item.name}</p>
              <p className="text-sm text-slate-500">{item.city}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-[32px] border border-dashed border-orange-200 bg-orange-50 p-6 text-center shadow-soft sm:p-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm">
          <MessageSquareQuote className="h-4 w-4" /> {totalReviewVolume.toLocaleString('en-IN')}+
          more reviews in the last 2 months
        </p>
        <h2 className="mt-4 text-2xl font-black text-ink sm:text-3xl">
          More verified buyer feedback keeps coming in every week
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          These are some of the top visible testimonials. New product reviews continue to grow
          across coolers, summer gadgets, plant-based products, and digital items.
        </p>
      </div>
    </section>
  );
}
