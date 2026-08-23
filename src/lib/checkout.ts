import type { CheckoutPayload } from '@/types/checkout';

export async function createCheckoutSession(payload: CheckoutPayload): Promise<string> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error ?? 'Nepavyko pradėti apmokėjimo');
  }

  return data.url;
}
