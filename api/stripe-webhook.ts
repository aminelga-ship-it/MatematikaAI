import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config as loadEnv } from 'dotenv';
import {
  isEkranoRasiklisSession,
  makeLicenseKey,
  sendLicenseEmail,
  sessionEmail,
  sessionPaid,
} from './_lib/ekranoLicense';

loadEnv({ path: '.local.env' });

export const config = {
  api: {
    bodyParser: false,
  },
};

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return res.status(500).json({ error: 'Stripe webhook is not configured' });
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  let event: Stripe.Event;
  try {
    const body = await rawBody(req);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return res.status(200).json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (!isEkranoRasiklisSession(session) || !sessionPaid(session)) {
    return res.status(200).json({ received: true });
  }

  const email = sessionEmail(session);
  if (!email || !email.includes('@')) {
    return res.status(200).json({ received: true, skipped: 'no-email' });
  }

  const license = makeLicenseKey(email);
  try {
    await sendLicenseEmail(email, license);
  } catch {
    return res.status(500).json({ error: 'Failed to send license email' });
  }

  return res.status(200).json({ received: true, emailed: Boolean(process.env.RESEND_API_KEY) });
}
