import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { buildOrderEmailData, sendOrderNotificationEmail } from './_lib/orderEmail';

config({ path: '.local.env' });

/**
 * Confirms a paid Stripe Checkout session and sends order email via Resend.
 * Used until Stripe webhooks are configured; safe to keep after webhooks too
 * (idempotent via metadata.orderEmailSent).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const { sessionId } = req.body as { sessionId?: string };
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    if (session.metadata?.orderEmailSent === 'true') {
      return res.status(200).json({ ok: true, alreadySent: true });
    }

    const emailData = buildOrderEmailData(session);
    await sendOrderNotificationEmail(emailData);

    await stripe.checkout.sessions.update(sessionId, {
      metadata: {
        ...session.metadata,
        orderEmailSent: 'true',
      },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('confirm-order failed', err);
    return res.status(500).json({ error: 'Failed to confirm order' });
  }
}
