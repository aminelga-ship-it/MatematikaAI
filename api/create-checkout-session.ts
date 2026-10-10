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
  unisend: 'Unisend pakomāts',
  omniva: 'Omniva pakomāts',
};

type ShippingMethod = 'pickup-telsiai' | 'lp-express' | 'post' | 'unisend' | 'omniva';
type CheckoutLocale = 'lt' | 'lv';

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
const LT_SHIPPING_METHODS: ShippingMethod[] = ['pickup-telsiai', 'lp-express', 'post'];
const LV_SHIPPING_METHODS: ShippingMethod[] = ['unisend', 'omniva'];
const SHIPPING_METHODS: ShippingMethod[] = [...LT_SHIPPING_METHODS, ...LV_SHIPPING_METHODS];

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
  if ((shippingMethod === 'unisend' || shippingMethod === 'omniva') && terminal) {
    const brand = shippingMethod === 'unisend' ? 'Unisend' : 'Omniva';
    const place = terminal.name ? `${terminal.name}, ${terminal.address}` : terminal.address;
    return `${brand} ${terminal.city} (${terminal.code}), ${place}`;
  }
  return SHIPPING_METHOD_LABELS[shippingMethod] ?? shippingMethod;
}

function readLocale(value: unknown): CheckoutLocale {
  return value === 'lv' ? 'lv' : 'lt';
}

function checkoutError(locale: CheckoutLocale, lithuanian: string, latvian: string): string {
  return locale === 'lv' ? latvian : lithuanian;
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
      locale?: string;
    };

    const locale = readLocale(body.locale);
    const { calculatorId, shippingMethod, terminal, postalAddress, recipient } = body;
    const quantity = readQuantity(body.quantity);
    const priceId = calculatorId ? CALCULATOR_PRICES[calculatorId]?.trim() : undefined;

    if (!calculatorId || !priceId) {
      return res.status(400).json({ error: checkoutError(locale, 'Invalid calculator', 'Nederīgs kalkulators') });
    }

    if (!priceIdPattern.test(priceId)) {
      return res.status(500).json({
        error: checkoutError(locale, 'Skaičiuotuvo kaina nėra sukonfigūruota', 'Kalkulatora cena nav konfigurēta'),
      });
    }

    if (quantity < 1 || quantity > 99) {
      return res.status(400).json({
        error: checkoutError(locale, 'Netinkamas vienetų skaičius', 'Nederīgs vienību skaits'),
      });
    }

    const allowedMethods = locale === 'lv' ? LV_SHIPPING_METHODS : LT_SHIPPING_METHODS;
    if (!shippingMethod || !isShippingMethod(shippingMethod) || !allowedMethods.includes(shippingMethod)) {
      return res.status(400).json({
        error: checkoutError(locale, 'Pasirinkite siuntimo būdą', 'Izvēlieties piegādes veidu'),
      });
    }

    if (!recipient?.firstName?.trim() || !recipient?.lastName?.trim()) {
      return res.status(400).json({
        error: checkoutError(locale, 'Įveskite gavėjo vardą ir pavardę', 'Ievadiet saņēmēja vārdu un uzvārdu'),
      });
    }

    if (!recipient.phone?.trim() || !phonePattern.test(recipient.phone.trim())) {
      return res.status(400).json({
        error: checkoutError(locale, 'Įveskite teisingą telefono numerį', 'Ievadiet pareizu tālruņa numuru'),
      });
    }

    if (!recipient.email?.trim() || !emailPattern.test(recipient.email.trim())) {
      return res.status(400).json({
        error: checkoutError(locale, 'Įveskite teisingą el. paštą', 'Ievadiet pareizu e-pastu'),
      });
    }

    if (shippingMethod === 'lp-express' && (!terminal?.id || !terminal.city || !terminal.address)) {
      return res.status(400).json({ error: 'Pasirinkite LP Express paštomatą' });
    }

    if ((shippingMethod === 'unisend' || shippingMethod === 'omniva') && (!terminal?.id || !terminal.city || !terminal.address)) {
      return res.status(400).json({ error: 'Izvēlieties pakomātu' });
    }

    if (shippingMethod === 'post') {
      if (!postalAddress?.street?.trim() || !postalAddress.city?.trim() || !postalAddress.postalCode?.trim()) {
        return res.status(400).json({ error: 'Įveskite pilną pašto adresą' });
      }
    }

    const needsShippingRate = shippingFeeApplies(quantity, shippingMethod);
    const shippingRateId = (process.env.STRIPE_SHIPPING_RATE ?? process.env.STRIPE_PRICE_SHIPPING)?.trim();
    if (locale === 'lt' && needsShippingRate && !shippingRateId) {
      return res.status(500).json({ error: 'Siuntimo tarifas nėra sukonfigūruotas' });
    }
    if (locale === 'lt' && needsShippingRate && shippingRateId && !shippingRatePattern.test(shippingRateId)) {
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

    if (locale === 'lv') {
      orderMetadata.market = 'lv';
    }

    if ((shippingMethod === 'lp-express' || shippingMethod === 'unisend' || shippingMethod === 'omniva') && terminal) {
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
      locale === 'lv' ? 'Latvija' : '',
      calculatorName,
      `${quantity} vnt.`,
      shippingLabel,
      `Gavėjas: ${recipientName}, ${phone}, ${email}`,
      deliverySummary,
    ]
      .filter(Boolean)
      .join(' | ');

    const returnPath = locale === 'lv' ? '/lv/kalkulatori' : '/skaiciuotuvai';
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('customer_email', email);
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', String(quantity));
    if (locale === 'lv') {
      params.append('locale', 'lv');
    }
    params.append('success_url', `${origin}${returnPath}?success=true`);
    params.append('cancel_url', `${origin}${returnPath}?canceled=true`);
    params.append('payment_intent_data[description]', orderDescription.slice(0, 1000));

    for (const [key, value] of Object.entries(orderMetadata)) {
      if (!value) continue;
      params.append(`metadata[${key}]`, value);
      params.append(`payment_intent_data[metadata][${key}]`, value);
    }

    if (locale === 'lv' && needsShippingRate) {
      params.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
      params.append('shipping_options[0][shipping_rate_data][display_name]', 'Piegāde');
      params.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '200');
      params.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'eur');
    } else if (needsShippingRate && shippingRateId) {
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
        return res.status(500).json({
          error: checkoutError(
            locale,
            'Siuntimo tarifas Stripe sistemoje netinka. Patikrinkite STRIPE_SHIPPING_RATE.',
            'Piegādes tarifs Stripe sistēmā neder.',
          ),
        });
      }
      if (param.includes('price')) {
        return res.status(500).json({
          error: checkoutError(
            locale,
            'Skaičiuotuvo kainos ID Stripe sistemoje netinka.',
            'Kalkulatora cenas ID Stripe sistēmā neder.',
          ),
        });
      }
      return res.status(500).json({
        error: checkoutError(locale, 'Nepavyko pradėti apmokėjimo', 'Neizdevās sākt maksājumu'),
      });
    }

    return res.status(200).json({ url: stripeBody.url });
  } catch {
    return res.status(500).json({ error: 'Nepavyko pradėti apmokėjimo' });
  }
}
