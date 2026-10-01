import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  isEkranoRasiklisSession,
  makeLicenseKey,
  sessionEmail,
  sessionPaid,
} from './_lib/ekranoLicense.js';

async function loadLocalEnvIfNeeded() {
  if (process.env.STRIPE_SECRET_KEY) return;
  try {
    const { config } = await import('dotenv');
    config({ path: '.local.env', quiet: true });
  } catch {
    // Production env is injected by Vercel.
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'Neteisinga mokėjimo sesija' });
  }

  await loadLocalEnvIfNeeded();

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!stripeResponse.ok) {
      return res.status(400).json({ error: 'Nepavyko patikrinti mokėjimo' });
    }
    const session = (await stripeResponse.json()) as {
      metadata?: Record<string, string> | null;
      payment_link?: string | { id?: string } | null;
      customer_email?: string | null;
      customer_details?: { email?: string | null } | null;
      payment_status?: string | null;
      status?: string | null;
    };
    if (!isEkranoRasiklisSession(session) || !sessionPaid(session)) {
      return res.status(404).json({ error: 'Mokėjimas nerastas' });
    }
    const email = sessionEmail(session);
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Mokėjime nėra el. pašto' });
    }
    return res.status(200).json({
      email,
      license: makeLicenseKey(email),
    });
  } catch {
    return res.status(400).json({ error: 'Nepavyko patikrinti mokėjimo' });
  }
}
