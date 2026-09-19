import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config as loadEnv } from 'dotenv';
import {
  isEkranoRasiklisSession,
  makeLicenseKey,
  sessionEmail,
  sessionPaid,
} from './_lib/ekranoLicense';

loadEnv({ path: '.local.env' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = typeof req.query.session_id === 'string' ? req.query.session_id : '';
  if (!sessionId.startsWith('cs_')) {
    return res.status(400).json({ error: 'Neteisinga mokėjimo sesija' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
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
