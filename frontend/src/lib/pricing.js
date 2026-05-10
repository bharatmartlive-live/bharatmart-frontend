import { storeCampaign } from '../data/storeCampaign';

export const SHIPPING_CHARGE = 49;

export function getSalePrice(product) {
  return Math.round(
    Number(product.price || 0) - (Number(product.price || 0) * Number(product.discount || 0)) / 100
  );
}

export function calculateCartPricing(cartItems, appliedCoupon, paymentMethod = 'COD') {
  const mrpTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const subtotalPrice = cartItems.reduce(
    (sum, item) => sum + getSalePrice(item) * Number(item.quantity || 0),
    0
  );
  const savings = mrpTotal - subtotalPrice;
  const couponDiscount = appliedCoupon
    ? Math.round((subtotalPrice * Number(appliedCoupon.discount || 0)) / 100)
    : 0;
  const afterCouponTotal = Math.max(0, subtotalPrice - couponDiscount);
  const onlineDiscount =
    paymentMethod === 'ONLINE'
      ? Math.round((afterCouponTotal * storeCampaign.onlinePaymentExtraDiscount) / 100)
      : 0;
  const totalPrice = Math.max(0, afterCouponTotal - onlineDiscount);

  return {
    mrpTotal,
    subtotalPrice,
    savings,
    couponDiscount,
    onlineDiscount,
    totalPrice
  };
}
