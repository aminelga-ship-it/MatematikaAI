import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { shouldApplyStripeShippingRate } from './_lib/orderPricing';

config({ path: '.local.env' });

const CALCULATOR_PRICES: Record<string, string | undefined> = {
  'fx-991-es': process.env.STRIPE_PRICE_ES,
  'fx-991-ex': process.env.STRIPE_PRICE_EX,
};

const CALCULATOR_NAMES: Record<string, string> = {
  'fx-991-es': 'FX-991 ES 2nd edition',
  'fx-991-ex': 'FX-991 EX ClassWiz',
};

const SHIPPING_METHOD_LABELS: Record<string, string> = {
  'pickup-telsiai': 'Atsiėmimas Telšiuose',
  'lp-express': 'LP Express paštomatas',
  post: 'Paštas',
};

type ShippingMethod = 'pickup-telsiai' | 'lp-express' | 'post';

type TerminalPayload = {
  id: string;
  code: string;
  city: string;
  name: string;
  address: string;
  comment?: string;
};

type PostalAddressPayload = {
  street: string;
  city: string;
  postalCode: string;
};

type RecipientPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;
const SHIPPING_METHODS: ShippingMethod[] = ['pickup-telsiai', 'lp-express', 'post'];

function isShippingMethod(value: string): value is ShippingMethod {
  return SHIPPING_METHODS.includes(value as ShippingMethod);
}

function buildDeliverySummary(
  shippingMethod: ShippingMethod,
  terminal?: TerminalPayload,
  postalAddress?: PostalAddressPayload,
): string {
  if (shippingMethod === 'pickup-telsiai') {
    return 'Atsiėmimas Telšiuose';
  }
  if (shippingMethod === 'post' && postalAddress) {
    return `Paštas: ${postalAddress.street}, ${postalAddress.postalCode} ${postalAddress.city}`;
  }
  if (shippingMethod === 'lp-express' && terminal) {
    return `LP Express ${terminal.city} (${terminal.code}), ${terminal.address}`;
  }
  return SHIPPING_METHOD_LABELS[shippingMethod] ?? shippingMethod;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: 'Stripe is not configured' });
  }

  const { calculatorId, shippingMethod, terminal, postalAddress, recipient, quantity: rawQuantity } =
    req.body as {
      calculatorId?: string;
      shippingMethod?: string;
      quantity?: number;
      terminal?: TerminalPayload;
      postalAddress?: PostalAddressPayload;
      recipient?: RecipientPayload;
    };

  const quantity =
    typeof rawQuantity === 'number' && Number.isInteger(rawQuantity) ? rawQuantity : 1;

  const priceId = calculatorId ? CALCULATOR_PRICES[calculatorId] : undefined;

  if (!priceId || !calculatorId) {
    return res.status(400).json({ error: 'Invalid calculator' });
  }

  if (quantity < 1 || quantity > 99) {
    return res.status(400).json({ error: 'Netinkamas vienetų skaičius' });
  }

  if (!shippingMethod || !isShippingMethod(shippingMethod)) {
    return res.status(400).json({ error: 'Pasirinkite siuntimo būdą' });
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

  if (shippingMethod === 'lp-express' && (!terminal?.id || !terminal.city || !terminal.address)) {
    return res.status(400).json({ error: 'Pasirinkite LP Express paštomatą' });
  }

  if (shippingMethod === 'post') {
    if (!postalAddress?.street?.trim() || !postalAddress.city?.trim() || !postalAddress.postalCode?.trim()) {
      return res.status(400).json({ error: 'Įveskite pilną pašto adresą' });
    }
  }

  const shippingRateId = process.env.STRIPE_SHIPPING_RATE ?? process.env.STRIPE_PRICE_SHIPPING;
  const needsShippingRate = shouldApplyStripeShippingRate(quantity, shippingMethod);
  if (needsShippingRate && !shippingRateId) {
    return res.status(500).json({ error: 'Siuntimo tarifas nėra sukonfigūruotas' });
  }

  const origin = req.headers.origin ?? 'http://localhost:5173';
  const firstName = recipient.firstName.trim();
  const lastName = recipient.lastName.trim();
  const phone = recipient.phone.trim();
  const email = recipient.email.trim();
  const calculatorName = CALCULATOR_NAMES[calculatorId] ?? calculatorId;
  const shippingLabel = SHIPPING_METHOD_LABELS[shippingMethod] ?? shippingMethod;
  const recipientName = `${firstName} ${lastName}`;
  const deliverySummary = buildDeliverySummary(shippingMethod, terminal, postalAddress);

  const orderMetadata: Record<string, string> = {
    calculatorId,
    calculatorName,
    quantity: String(quantity),
    shippingMethod,
    shippingLabel,
    recipientFirstName: firstName,
    recipientLastName: lastName,
    recipientPhone: phone,
    recipientEmail: email,
    deliverySummary: deliverySummary.slice(0, 500),
  };

  if (shippingMethod === 'lp-express' && terminal) {
    orderMetadata.terminalId = terminal.id;
    orderMetadata.terminalCode = terminal.code;
    orderMetadata.terminalCity = terminal.city;
    orderMetadata.terminalAddress = terminal.address.slice(0, 450);
    orderMetadata.terminalName = terminal.name;
  }

  if (shippingMethod === 'post' && postalAddress) {
    orderMetadata.postalStreet = postalAddress.street.trim().slice(0, 450);
    orderMetadata.postalCity = postalAddress.city.trim();
    orderMetadata.postalCode = postalAddress.postalCode.trim();
  }

  const orderDescription = [
    calculatorName,
    `${quantity} vnt.`,
    shippingLabel,
    `Gavėjas: ${recipientName}, ${phone}, ${email}`,
    deliverySummary,
  ].join(' | ');

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    customer_email: email,
    line_items: [{ price: priceId, quantity }],
    success_url: `${origin}/skaiciuotuvai?success=true`,
    cancel_url: `${origin}/skaiciuotuvai?canceled=true`,
    metadata: orderMetadata,
    payment_intent_data: {
      description: orderDescription.slice(0, 1000),
      metadata: orderMetadata,
    },
  };

  if (needsShippingRate && shippingRateId) {
    sessionParams.shipping_options = [{ shipping_rate: shippingRateId }];
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ url: session.url });
  } catch {
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
