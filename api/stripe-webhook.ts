import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buffer } from 'node:stream/consumers';
import { config as loadEnv } from 'dotenv';
import { buildOrderEmailData, sendOrderNotificationEmail } from './_lib/orderEmail';

loadEnv({ path: '.local.env' });

export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Optional Stripe webhook handler. Enable when STRIPE_WEBHOOK_SECRET is set.
 * Until then, order emails are sent via /api/confirm-order after Checkout redirect.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  if (!webhookSecret) {
    return res.status(503).json({
      error: 'Stripe webhook is not configured yet. Orders are confirmed via /api/confirm-order.',
    });
  }

  const stripe = new Stripe(secretKey);
  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.metadata?.orderEmailSent === 'true') {
      return res.status(200).json({ received: true, alreadySent: true });
    }

    try {
      const emailData = buildOrderEmailData(session);
      await sendOrderNotificationEmail(emailData);

      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          ...session.metadata,
          orderEmailSent: 'true',
        },
      });
    } catch (err) {
      console.error('Failed to send order email', err);
      return res.status(500).json({ error: 'Failed to send order email' });
    }
  }

  return res.status(200).json({ received: true });
}
