export type ShippingMethod = 'pickup-telsiai' | 'lp-express' | 'post';

export function shippingFeeEur(quantity: number, shippingMethod: ShippingMethod): number {
  if (shippingMethod === 'pickup-telsiai') return 0;
  if (quantity >= 3) return 0;
  return 2;
}

export function shouldApplyStripeShippingRate(
  quantity: number,
  shippingMethod: ShippingMethod,
): boolean {
  return shippingMethod !== 'pickup-telsiai' && shippingFeeEur(quantity, shippingMethod) > 0;
}
