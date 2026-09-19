import crypto from 'crypto';

export const PRODUCT_ID = 'ekrano-rasiklis-v1';

type StripeMetadata = Record<string, string>;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/\s+/g, '');
}

export function licenseSecret(): string {
  return process.env.EKRASIKLIS_LICENSE_SECRET || 'er-lic-v1-9f3c7a1e4b8d2f06c5a91e77b0d34c8e2a16f5b9';
}

export function makeLicenseKey(email: string): string {
  const normalized = normalizeEmail(email);
  const digest = crypto
    .createHmac('sha256', licenseSecret())
    .update(`${PRODUCT_ID}|${normalized}`)
    .digest('hex')
    .slice(0, 20)
    .toUpperCase();
  const chunks = digest.match(/.{1,4}/g) ?? [];
  return `ER1-${chunks.join('-')}`;
}

export function isEkranoRasiklisSession(session: {
  metadata?: StripeMetadata | null;
  payment_link?: string | { id?: string } | null;
}): boolean {
  const metadata = session.metadata ?? {};
  if (metadata.calculatorId) {
    return false;
  }
  if (metadata.product === 'ekrano-rasiklis') {
    return true;
  }
  const configured = process.env.STRIPE_EKRASIKLIS_PAYMENT_LINK_ID;
  const paymentLinkId =
    typeof session.payment_link === 'string' ? session.payment_link : session.payment_link?.id;
  if (configured && paymentLinkId === configured) {
    return true;
  }
  return Boolean(paymentLinkId);
}

export function sessionEmail(session: {
  customer_email?: string | null;
  customer_details?: { email?: string | null } | null;
}): string {
  return normalizeEmail(session.customer_details?.email || session.customer_email || '');
}

export function sessionPaid(session: {
  payment_status?: string | null;
  status?: string | null;
}): boolean {
  return session.payment_status === 'paid' || session.status === 'complete';
}

export async function sendLicenseEmail(email: string, license: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return;
  }
  const from = process.env.LICENSE_FROM_EMAIL || 'MatematikaAI <beth.t@example.com>';
  const downloadUrl =
    process.env.EKRASIKLIS_SETUP_URL ||
    'https://github.com/aminelga-ship-it/ekrano-rasiklis/raw/downloads/EkranoRasiklis-Setup.exe';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: 'Ekrano rašiklis — jūsų licencijos raktas',
      html: `
        <p>Ačiū už pirkimą.</p>
        <p>Jūsų licencija:</p>
        <p><strong>El. paštas:</strong> ${email}<br/>
        <strong>Raktas:</strong> ${license}</p>
        <p>Įveskite šiuos duomenis programoje po 7 dienų bandymo (arba iškart, jei norite atrakinti dabar).</p>
        <p>Parsisiųsti: <a href="${downloadUrl}">${downloadUrl}</a></p>
      `,
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend failed: ${text}`);
  }
}
