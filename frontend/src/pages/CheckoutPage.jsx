import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { storeCampaign } from '../data/storeCampaign';
import { useShop } from '../hooks/useShop';
import { api } from '../lib/api';
import { getStoredCustomer, setStoredCustomer } from '../lib/customer';
import { calculateCartPricing, getSalePrice, SHIPPING_CHARGE } from '../lib/pricing';
import { loadRazorpayCheckout } from '../lib/razorpay';

const initialForm = {
  customerName: '',
  email: '',
  phone: '',
  password: '',
  billingAddress: '',
  shippingAddress: '',
  sameAsBilling: true,
  monthlyOffers: false,
  note: '',
  paymentMethod: 'COD'
};

function buildOrderPayload({ customer, form, cartItems, appliedCoupon }) {
  const shippingAddress = form.sameAsBilling ? form.billingAddress : form.shippingAddress;

  return {
    userId: customer?.id || null,
    customerName: form.customerName,
    email: form.email,
    phone: form.phone,
    billingAddress: form.billingAddress,
    shippingAddress,
    note: form.note,
    monthlyOffers: form.monthlyOffers,
    couponCode: appliedCoupon?.code || '',
    paymentMethod: form.paymentMethod,
    items: cartItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: getSalePrice(item)
    }))
  };
}

export function CheckoutPage() {
  const { cartItems, clearCart, coupons } = useShop();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(() => getStoredCustomer());
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponStatus, setCouponStatus] = useState('');
  const [placing, setPlacing] = useState(false);

  const pricing = calculateCartPricing(cartItems, appliedCoupon, form.paymentMethod);
  const finalShippingAddress = form.sameAsBilling ? form.billingAddress : form.shippingAddress;

  useEffect(() => {
    if (customer) {
      setForm((current) => ({
        ...current,
        customerName: current.customerName || customer.name,
        email: current.email || customer.email
      }));
    }
  }, [customer]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const applyCoupon = () => {
    const normalizedCode = couponCode.trim().toUpperCase();
    const matchedCoupon = coupons.find(
      (coupon) => String(coupon.code).toUpperCase() === normalizedCode && coupon.active !== false
    );

    if (!normalizedCode) {
      setCouponStatus('Please enter a coupon code.');
      setAppliedCoupon(null);
      return;
    }

    if (!matchedCoupon) {
      setCouponStatus('Coupon not found or currently inactive.');
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matchedCoupon);
    setCouponCode(matchedCoupon.code);
    setCouponStatus(
      `${matchedCoupon.code} applied. You saved Rs ${Math.round(
        (pricing.subtotalPrice * Number(matchedCoupon.discount || 0)) / 100
      )}.`
    );
  };

  const ensureCustomerAccount = async () => {
    if (customer) return customer;

    if (!form.password || form.password.length < 6) {
      throw new Error('Create an account to place order. Password must be at least 6 characters.');
    }

    await api.post('/users/register', {
      name: form.customerName,
      email: form.email,
      password: form.password
    });

    const { data } = await api.post('/users/login', {
      email: form.email,
      password: form.password
    });

    setStoredCustomer(data.user, data.token);
    setCustomer(data.user);
    return data.user;
  };

  const resetCheckoutAfterSuccess = () => {
    clearCart();
    setForm(initialForm);
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponStatus('');
    window.dispatchEvent(new Event('bharatmart-customer-change'));
  };

  const placeCodOrder = async (payload) => {
    const { data } = await api.post('/orders', payload);
    resetCheckoutAfterSuccess();
    navigate(
      `/thank-you?orderId=${data.orderId}&payment=COD&amount=${Math.round(
        data.totals?.totalPrice || pricing.totalPrice
      )}`
    );
  };

  const placeOnlineOrder = async (payload) => {
    setStatus('Preparing secure Razorpay checkout...');

    const scriptLoaded = await loadRazorpayCheckout();
    if (!scriptLoaded || !window.Razorpay) {
      throw new Error('Razorpay checkout could not load. Please check your internet and try again.');
    }

    const { data } = await api.post('/orders/create-razorpay-order', payload);
    const paymentSummary = data.data.summary;

    const razorpay = new window.Razorpay({
      key: data.data.keyId,
      amount: data.data.amount,
      currency: data.data.currency,
      order_id: data.data.orderId,
      name: 'BharatMart.live',
      description: `Pay online and get extra ${storeCampaign.onlinePaymentExtraDiscount}% off`,
      image: logo,
      prefill: {
        name: payload.customerName,
        email: payload.email,
        contact: payload.phone
      },
      notes: {
        billing_address: payload.billingAddress,
        shipping_address: payload.shippingAddress
      },
      theme: {
        color: '#f97316'
      },
      modal: {
        ondismiss: () => {
          setPlacing(false);
          setStatus('Payment window closed. You can try again or switch to Cash on Delivery.');
        }
      },
      handler: async (response) => {
        try {
          const verification = await api.post('/orders/verify-razorpay-payment', {
            ...payload,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          resetCheckoutAfterSuccess();
          navigate(
            `/thank-you?orderId=${verification.data.orderId}&payment=ONLINE&saved=${Math.round(
              verification.data.totals?.onlineDiscount || paymentSummary.onlineDiscount || 0
            )}&amount=${Math.round(
              verification.data.totals?.totalPrice || paymentSummary.totalPrice || pricing.totalPrice
            )}`
          );
        } catch (error) {
          setStatus(
            error.response?.data?.message ||
              'Payment was made but order verification failed. Please contact support with your payment reference.'
          );
        } finally {
          setPlacing(false);
        }
      }
    });

    razorpay.on('payment.failed', (event) => {
      setPlacing(false);
      setStatus(event.error?.description || 'Payment failed. Please try again or choose Cash on Delivery.');
    });

    razorpay.open();
  };

  const placeOrder = async (event) => {
    event.preventDefault();
    setStatus('');

    if (!cartItems.length) {
      setStatus('Your cart is empty. Please add at least one product to cart before placing an order.');
      return;
    }

    if (!finalShippingAddress) {
      setStatus('Please complete your billing and shipping details before placing the order.');
      return;
    }

    setPlacing(true);

    try {
      const activeCustomer = await ensureCustomerAccount();
      const payload = buildOrderPayload({
        customer: activeCustomer,
        form,
        cartItems,
        appliedCoupon
      });

      if (form.paymentMethod === 'ONLINE') {
        await placeOnlineOrder(payload);
        return;
      }

      await placeCodOrder(payload);
    } catch (error) {
      setStatus(error.response?.data?.message || error.message || 'Unable to place order right now. Please try again.');
      setPlacing(false);
    }
  };

  if (!cartItems.length) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-16 text-center animate-page">
        <div className="rounded-[36px] bg-white p-8 shadow-soft md:p-12">
          <p className="mx-auto inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-black text-orange-700">
            Cart is empty
          </p>
          <h1 className="mt-5 text-4xl font-black text-ink">Add products before checkout</h1>
          <p className="mt-3 text-slate-600">
            To place an order, please add at least one product to your cart. Your selected products
            will appear here with images, discounts, and delivery summary.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-bold text-white transition active:scale-95 hover:bg-orange-500"
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-3 py-8 sm:px-4 sm:py-10">
      <div className="mb-8 overflow-hidden rounded-[32px] bg-gradient-to-r from-blue-50 via-white to-orange-50 p-6 shadow-soft">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-orange-600">Secure Checkout</p>
        <h1 className="mt-2 text-3xl font-black text-ink sm:text-4xl">
          Billing, Account & Payment
        </h1>
        <p className="mt-3 max-w-3xl text-slate-600">
          Review selected products, apply live coupons, and choose between Cash on Delivery or
          secure online payment. Online checkout gets an extra {storeCampaign.onlinePaymentExtraDiscount}%
          off automatically.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
        <form onSubmit={placeOrder} className="space-y-6 rounded-[32px] bg-white p-5 shadow-soft sm:p-8">
          <section>
            <h2 className="text-2xl font-black text-ink">Contact Information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input
                required
                placeholder="Full name"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.customerName}
                onChange={(event) => updateForm('customerName', event.target.value)}
              />
              <input
                required
                placeholder="Phone number"
                className="rounded-2xl border border-slate-200 px-4 py-3"
                value={form.phone}
                onChange={(event) => updateForm('phone', event.target.value)}
              />
              <input
                required
                type="email"
                placeholder="Email address"
                className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
              />
            </div>
          </section>

          {!customer ? (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
              <h2 className="text-2xl font-black text-ink">Create Account at Checkout</h2>
              <p className="mt-2 text-sm text-slate-600">
                Required for order tracking, payment confirmations, and your dashboard history.
              </p>
              <input
                required
                type="password"
                placeholder="Create password (min 6 characters)"
                className="mt-4 w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3"
                value={form.password}
                onChange={(event) => updateForm('password', event.target.value)}
              />
            </section>
          ) : (
            <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5 text-sm font-bold text-emerald-700">
              Logged in as {customer.name}. Your orders and payment updates will appear in your
              profile dashboard.
            </section>
          )}

          <section className="rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
            <h2 className="text-2xl font-black text-ink">Billing Address</h2>
            <textarea
              required
              placeholder="House / flat, street, city, state, PIN code"
              className="mt-4 min-h-28 w-full rounded-2xl border border-blue-100 bg-white px-4 py-3"
              value={form.billingAddress}
              onChange={(event) => updateForm('billingAddress', event.target.value)}
            />
          </section>

          <section className="rounded-3xl border border-orange-100 bg-orange-50/70 p-5">
            <label className="flex items-start gap-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.sameAsBilling}
                onChange={(event) => updateForm('sameAsBilling', event.target.checked)}
                className="mt-1 h-4 w-4 accent-orange-500"
              />
              Shipping address is same as billing address
            </label>
            {!form.sameAsBilling ? (
              <textarea
                required
                placeholder="Shipping address"
                className="mt-4 min-h-28 w-full rounded-2xl border border-orange-100 bg-white px-4 py-3"
                value={form.shippingAddress}
                onChange={(event) => updateForm('shippingAddress', event.target.value)}
              />
            ) : null}
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink">Payment Method</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose secure online payment for an extra {storeCampaign.onlinePaymentExtraDiscount}% off.
                </p>
              </div>
              <div className="rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                Offer ends {storeCampaign.saleEndsLabel}
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ['ONLINE', 'Pay Online', 'Cards, UPI, wallet, and netbanking via Razorpay', true],
                ['COD', 'Cash on Delivery', 'Pay when the order reaches your doorstep', false]
              ].map(([value, label, note, highlight]) => (
                <label
                  key={value}
                  className={`rounded-2xl border p-4 ${
                    form.paymentMethod === value ? 'border-orange-400 bg-orange-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={value}
                    checked={form.paymentMethod === value}
                    onChange={(event) => updateForm('paymentMethod', event.target.value)}
                    className="accent-orange-500"
                  />
                  <span className="ml-2 font-black text-ink">{label}</span>
                  <p className={`mt-2 text-xs font-bold ${highlight ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {note}
                  </p>
                  {highlight ? (
                    <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">
                      Extra {storeCampaign.onlinePaymentExtraDiscount}% off
                    </p>
                  ) : null}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 p-5">
            <label className="flex items-start gap-3 text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={form.monthlyOffers}
                onChange={(event) => updateForm('monthlyOffers', event.target.checked)}
                className="mt-1 h-4 w-4 accent-emerald-500"
              />
              Send me monthly offers, coupons, restock alerts, and surprise drops on email.
            </label>
            <textarea
              placeholder="Add order note, delivery instruction, or preferred call time"
              className="mt-4 min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3"
              value={form.note}
              onChange={(event) => updateForm('note', event.target.value)}
            />
          </section>

          <button
            disabled={placing}
            className="w-full rounded-full bg-ink px-6 py-4 font-bold text-white transition active:scale-95 hover:bg-orange-500 disabled:opacity-60"
          >
            {placing
              ? form.paymentMethod === 'ONLINE'
                ? 'Opening Secure Payment...'
                : 'Placing COD Order...'
              : form.paymentMethod === 'ONLINE'
                ? 'Pay Securely with Razorpay'
                : 'Place COD Order'}
          </button>
          {status ? (
            <p className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {status}
            </p>
          ) : null}
        </form>

        <aside className="h-fit rounded-[32px] bg-white p-5 shadow-soft sm:p-6 lg:sticky lg:top-36">
          <h2 className="text-2xl font-black text-ink">Order Summary</h2>
          <div className="mt-5 space-y-4">
            {cartItems.map((item) => {
              const salePrice = getSalePrice(item);
              return (
                <div key={item.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3">
                  <img
                    src={item.imageUrls?.[0]}
                    alt={item.title}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold text-ink">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-black text-ink">Rs {salePrice * item.quantity}</span>
                      <span className="text-slate-400 line-through">
                        Rs {Math.round(item.price * item.quantity)}
                      </span>
                      <span className="font-bold text-emerald-600">{item.discount}% off</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <span>MRP Total</span>
              <span className="line-through text-slate-400">Rs {Math.round(pricing.mrpTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Discounted Price</span>
              <span className="font-bold text-ink">Rs {Math.round(pricing.subtotalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span>You Save</span>
              <span className="font-bold text-emerald-600">Rs {Math.round(pricing.savings)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                <span className="text-slate-400 line-through">Rs {SHIPPING_CHARGE}</span>{' '}
                <span className="font-bold text-emerald-600">Free</span>
              </span>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">
                    Apply Coupon
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Use {storeCampaign.couponCode} for {storeCampaign.couponDiscount}% off on all products.
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-orange-600 shadow-sm">
                  Ends {storeCampaign.saleEndsLabel}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={couponCode}
                  onChange={(event) => {
                    setCouponCode(event.target.value.toUpperCase());
                    if (appliedCoupon) setAppliedCoupon(null);
                  }}
                  placeholder="Enter coupon"
                  className="min-w-0 flex-1 rounded-xl border border-orange-100 bg-white px-3 py-2 font-bold uppercase text-ink"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="rounded-xl bg-ink px-4 py-2 font-black text-white"
                >
                  Apply
                </button>
              </div>
              {couponStatus ? <p className="mt-2 text-xs font-bold text-orange-700">{couponStatus}</p> : null}
            </div>
            {appliedCoupon ? (
              <div className="flex justify-between">
                <span>Coupon Discount ({appliedCoupon.code})</span>
                <span className="font-bold text-emerald-600">- Rs {pricing.couponDiscount}</span>
              </div>
            ) : null}
            {form.paymentMethod === 'ONLINE' ? (
              <div className="flex justify-between">
                <span>Online Payment Bonus ({storeCampaign.onlinePaymentExtraDiscount}%)</span>
                <span className="font-bold text-emerald-600">- Rs {pricing.onlineDiscount}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black text-ink">
              <span>Total</span>
              <span>Rs {Math.round(pricing.totalPrice)}</span>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-orange-50 p-4 text-xs text-slate-700">
            <p className="font-black text-orange-700">Customer Details</p>
            <p className="mt-2">
              {form.customerName || 'Name pending'} - {form.phone || 'Phone pending'}
            </p>
            <p className="mt-1">{form.email || 'Email pending'}</p>
            <p className="mt-1 line-clamp-3">Ship to: {finalShippingAddress || 'Address pending'}</p>
          </div>

          <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">
            {form.paymentMethod === 'ONLINE'
              ? `Secure Razorpay checkout is active. You are saving an extra ${storeCampaign.onlinePaymentExtraDiscount}% on this order.`
              : 'COD Available on every product. You pay only when the order reaches your doorstep.'}
          </p>
        </aside>
      </div>
    </section>
  );
}
