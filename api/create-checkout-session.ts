import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';

config({ path: '.local.env' });

const CALCULATOR_PRICES: Record<string, string | undefined> = {
  'fx-991-es': process.env.STRIPE_PRICE_ES,
  'fx-991-ex': process.env.STRIPE_PRICE_EX,
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const { calculatorId } = req.body as { calculatorId?: string };
  const priceId = calculatorId ? CALCULATOR_PRICES[calculatorId] : undefined;

  if (!priceId) {
    return res.status(400).json({ error: 'Invalid calculator' });
  }

  const origin = req.headers.origin ?? 'http://localhost:5173';

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/skaiciuotuvai?success=true`,
      cancel_url: `${origin}/skaiciuotuvai?canceled=true`,
      metadata: { calculatorId },
    });

    return res.status(200).json({ url: session.url });
  } catch {
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
