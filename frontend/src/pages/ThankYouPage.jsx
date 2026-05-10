import { Link, useSearchParams } from 'react-router-dom';
import { storeCampaign } from '../data/storeCampaign';
import { getDisplayOrderNumber } from '../lib/customer';

export function ThankYouPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const payment = params.get('payment') || 'COD';
  const saved = Number(params.get('saved') || 0);
  const amount = Number(params.get('amount') || 0);
  const isOnlinePayment = payment === 'ONLINE';

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 text-center animate-page">
      <div className="rounded-[36px] bg-white p-8 shadow-soft md:p-12">
        <p
          className={`mx-auto inline-flex rounded-full px-4 py-2 text-sm font-black ${
            isOnlinePayment
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-orange-100 text-orange-700'
          }`}
        >
          {isOnlinePayment ? 'Online Payment Confirmed' : 'COD Order Confirmed'}
        </p>
        <h1 className="mt-6 text-4xl font-black text-ink md:text-5xl">
          Thank you for shopping with BharatMart.live
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Your order has been placed successfully. You can track it from your profile dashboard and
          watch delivery progress in real time.
        </p>
        {orderId ? (
          <p className="mt-4 text-sm font-bold text-orange-600">
            Order ID: {getDisplayOrderNumber(orderId)}
          </p>
        ) : null}

        <div className="mt-8 grid gap-4 rounded-[28px] bg-slate-50 p-5 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Payment Mode
            </p>
            <p className="mt-2 text-xl font-black text-ink">
              {isOnlinePayment ? 'Paid Online' : 'Cash on Delivery'}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Amount
            </p>
            <p className="mt-2 text-xl font-black text-ink">
              {amount ? `Rs ${Math.round(amount)}` : 'Shown in dashboard'}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
              Extra Saved
            </p>
            <p className="mt-2 text-xl font-black text-emerald-600">
              {isOnlinePayment ? `Rs ${Math.round(saved)}` : `${storeCampaign.couponCode} available`}
            </p>
          </div>
        </div>

        {isOnlinePayment ? (
          <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            Your secure online payment was received successfully. The extra{' '}
            {storeCampaign.onlinePaymentExtraDiscount}% prepaid discount has already been included in
            your order.
          </p>
        ) : (
          <p className="mt-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
            Want better savings next time? Use {storeCampaign.couponCode} and choose online payment
            to unlock an additional {storeCampaign.onlinePaymentExtraDiscount}% off.
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/login" className="rounded-full bg-ink px-6 py-3 font-bold text-white">
            View Dashboard
          </Link>
          <Link
            to="/"
            className="rounded-full border border-slate-200 px-6 py-3 font-bold text-slate-700"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}
