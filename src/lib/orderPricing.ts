import type { ShippingMethod } from '@/types/shipping';

export const CALCULATOR_UNIT_PRICE_EUR: Record<string, number> = {
  'fx-991-es': 24.99,
  'fx-991-ex': 29.99,
};

/** Siuntimas: 1–2 vnt. – 2 € (LP / paštas); nuo 3 vnt. – nemokamai; atsiėmimas – visada 0 €. */
export function shippingFeeEur(quantity: number, shippingMethod: ShippingMethod): number {
  if (shippingMethod === 'pickup-telsiai') return 0;
  if (quantity >= 3) return 0;
  return 2;
}

export function orderSubtotalEur(calculatorId: string, quantity: number): number {
  const unit = CALCULATOR_UNIT_PRICE_EUR[calculatorId] ?? 0;
  return unit * quantity;
}

export function orderTotalEur(
  calculatorId: string,
  quantity: number,
  shippingMethod: ShippingMethod,
): number {
  return orderSubtotalEur(calculatorId, quantity) + shippingFeeEur(quantity, shippingMethod);
}

export function formatEur(amount: number): string {
  return `${amount.toFixed(2).replace('.', ',')} €`;
}
