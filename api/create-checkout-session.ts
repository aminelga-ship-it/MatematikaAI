import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';

config({ path: '.local.env' });

const CALCULATOR_PRICES: Record<string, string | undefined> = {
  'fx-991-es': process.env.STRIPE_PRICE_ES,
  'fx-991-ex': process.env.STRIPE_PRICE_EX,
};

const CALCULATOR_NAMES: Record<string, string> = {
  'fx-991-es': 'FX-991 ES 2nd edition',
  'fx-991-ex': 'FX-991 EX ClassWiz',
};

type TerminalPayload = {
  id: string;
  code: string;
  city: string;
  name: string;
  address: string;
  comment?: string;
};

type RecipientPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const { calculatorId, terminal, recipient } = req.body as {
    calculatorId?: string;
    terminal?: TerminalPayload;
    recipient?: RecipientPayload;
  };

  const priceId = calculatorId ? CALCULATOR_PRICES[calculatorId] : undefined;

  if (!priceId || !calculatorId) {
    return res.status(400).json({ error: 'Invalid calculator' });
  }

  if (!recipient?.firstName?.trim() || !recipient?.lastName?.trim()) {
    return res.status(400).json({ error: 'Įveskite gavėjo vardą ir pavardę' });
  }

  if (!recipient.phone?.trim() || !phonePattern.test(recipient.phone.trim())) {
    return res.status(400).json({ error: 'Įveskite teisingą telefono numerį' });
  }

  if (!recipient.email?.trim() || !emailPattern.test(recipient.email.trim())) {
    return res.status(400).json({ error: 'Įveskite teisingą el. paštą' });
  }

  if (!terminal?.id || !terminal.city || !terminal.address) {
    return res.status(400).json({ error: 'Pasirinkite LP Express paštomatą' });
  }

  const origin = req.headers.origin ?? 'http://localhost:5173';
  const firstName = recipient.firstName.trim();
  const lastName = recipient.lastName.trim();
  const phone = recipient.phone.trim();
  const email = recipient.email.trim();

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/skaiciuotuvai?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/skaiciuotuvai?canceled=true`,
      metadata: {
        calculatorId,
        calculatorName: CALCULATOR_NAMES[calculatorId] ?? calculatorId,
        recipientFirstName: firstName,
        recipientLastName: lastName,
        recipientPhone: phone,
        recipientEmail: email,
        terminalId: terminal.id,
        terminalCode: terminal.code,
        terminalCity: terminal.city,
        terminalAddress: terminal.address.slice(0, 450),
        terminalName: terminal.name,
      },
    });

    return res.status(200).json({ url: session.url });
  } catch {
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
