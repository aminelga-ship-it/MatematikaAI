import type { CheckoutPayload } from '@/types/checkout';

export async function createCheckoutSession(payload: CheckoutPayload): Promise<string> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  let data: { url?: string; error?: string } = {};
  try {
    data = text ? (JSON.parse(text) as { url?: string; error?: string }) : {};
  } catch {
    throw new Error(
      payload.locale === 'lv'
        ? 'Neizdevās sākt maksājumu. Mēģiniet vēlreiz.'
        : 'Nepavyko pradėti apmokėjimo. Bandykite dar kartą.',
    );
  }

  if (!response.ok || !data.url) {
    throw new Error(
      data.error ??
        (payload.locale === 'lv' ? 'Neizdevās sākt maksājumu' : 'Nepavyko pradėti apmokėjimo'),
    );
  }

  return data.url;
}
