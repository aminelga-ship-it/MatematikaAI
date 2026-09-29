import type { VercelRequest, VercelResponse } from '@vercel/node';

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
const priceIdPattern = /^price_[A-Za-z0-9]+$/;
const shippingRatePattern = /^shr_[A-Za-z0-9]+$/;
const SHIPPING_METHODS: ShippingMethod[] = ['pickup-telsiai', 'lp-express', 'post'];

function isShippingMethod(value: string): value is ShippingMethod {
  return SHIPPING_METHODS.includes(value as ShippingMethod);
}

function shippingFeeApplies(quantity: number, shippingMethod: ShippingMethod): boolean {
  return shippingMethod !== 'pickup-telsiai' && quantity < 3;
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

function readQuantity(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed)) return 1;
  return parsed;
}

async function loadLocalEnvIfNeeded() {
  if (process.env.STRIPE_SECRET_KEY) return;
  try {
    const { config } = await import('dotenv');
    config({ path: '.local.env', quiet: true });
  } catch {
    // Vercel already injects env vars. A missing local file must not crash checkout.
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await loadLocalEnvIfNeeded();

    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secretKey) {
      return res.status(500).json({ error: 'Stripe is not configured' });
    }

    const body = (req.body ?? {}) as {
      calculatorId?: string;
      shippingMethod?: string;
      quantity?: number | string;
      terminal?: TerminalPayload;
      postalAddress?: PostalAddressPayload;
      recipient?: RecipientPayload;
    };

    const { calculatorId, shippingMethod, terminal, postalAddress, recipient } = body;
    const quantity = readQuantity(body.quantity);
    const priceId = calculatorId ? CALCULATOR_PRICES[calculatorId]?.trim() : undefined;

    if (!calculatorId || !priceId) {
      return res.status(400).json({ error: 'Invalid calculator' });
    }

    if (!priceIdPattern.test(priceId)) {
      return res.status(500).json({ error: 'Skaičiuotuvo kaina nėra sukonfigūruota' });
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

    const needsShippingRate = shippingFeeApplies(quantity, shippingMethod);
    const shippingRateId = (process.env.STRIPE_SHIPPING_RATE ?? process.env.STRIPE_PRICE_SHIPPING)?.trim();
    if (needsShippingRate && !shippingRateId) {
      return res.status(500).json({ error: 'Siuntimo tarifas nėra sukonfigūruotas' });
    }
    if (needsShippingRate && shippingRateId && !shippingRatePattern.test(shippingRateId)) {
      return res.status(500).json({
        error: 'Siuntimo tarifas sukonfigūruotas neteisingai. Reikia Stripe shipping rate (shr_...), ne kainos ID.',
      });
    }

    const originHeader = req.headers.origin;
    const origin = typeof originHeader === 'string' && originHeader.startsWith('http')
      ? originHeader
      : 'https://matematikaa1.vercel.app';
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

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('customer_email', email);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', String(quantity));
    params.append('success_url', `${origin}/skaiciuotuvai?success=true`);
    params.append('cancel_url', `${origin}/skaiciuotuvai?canceled=true`);
    params.append('payment_intent_data[description]', orderDescription.slice(0, 1000));

    for (const [key, value] of Object.entries(orderMetadata)) {
      if (!value) continue;
      params.append(`metadata[${key}]`, value);
      params.append(`payment_intent_data[metadata][${key}]`, value);
    }

    if (needsShippingRate && shippingRateId) {
      params.append('shipping_options[0][shipping_rate]', shippingRateId);
    }

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const stripeBody = (await stripeResponse.json()) as {
      url?: string;
      error?: { message?: string; param?: string };
    };

    if (!stripeResponse.ok || !stripeBody.url) {
      const param = stripeBody.error?.param ?? '';
      if (param.includes('shipping_rate')) {
        return res.status(500).json({ error: 'Siuntimo tarifas Stripe sistemoje netinka. Patikrinkite STRIPE_SHIPPING_RATE.' });
      }
      if (param.includes('price')) {
        return res.status(500).json({ error: 'Skaičiuotuvo kainos ID Stripe sistemoje netinka.' });
      }
      return res.status(500).json({ error: 'Nepavyko pradėti apmokėjimo' });
    }

    return res.status(200).json({ url: stripeBody.url });
  } catch {
    return res.status(500).json({ error: 'Nepavyko pradėti apmokėjimo' });
  }
}
