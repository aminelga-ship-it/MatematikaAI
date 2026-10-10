import { useMemo, useState } from 'react';
import { Loader2, MessageCircle, ShoppingCart, X } from 'lucide-react';
import LpExpressWidget from '@/components/LpExpressWidget';
import ParcelLockerWidget from '@/components/ParcelLockerWidget';
import { CONTACT_EMAIL } from '@/data/tutors';
import { createCheckoutSession } from '@/lib/checkout';
import { noteLeftForPayment } from '@/lib/visitTracking';
import {
  formatEur,
  orderSubtotalEur,
  orderTotalEur,
  shippingFeeEur,
} from '@/lib/orderPricing';
import type { LpExpressTerminal } from '@/types/lpExpress';
import type { Market } from '@/types/market';
import { LV_SHIPPING_OPTIONS, SHIPPING_METHOD_LABELS, SHIPPING_OPTIONS, type ShippingMethod } from '@/types/shipping';

type CheckoutModalProps = {
  market?: Market;
  calculatorId: string;
  calculatorName: string;
  onClose: () => void;
  onError: (message: string) => void;
};

type CheckoutText = {
  thankYou: string;
  close: string;
  title: string;
  deliveryTime: Record<string, string>;
  quantity: string;
  items: (quantity: number) => string;
  shipping: string;
  free: string;
  total: string;
  freeFromThree: string;
  method: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  firstNamePlaceholder: string;
  lastNamePlaceholder: string;
  phonePlaceholder: string;
  emailPlaceholder: string;
  street: string;
  streetPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  postal: string;
  postalPlaceholder: string;
  cancel: string;
  discount: string;
  discountSending: string;
  pay: string;
  preparing: string;
  badQuantity: string;
  needFirstName: string;
  needLastName: string;
  needPhone: string;
  badPhone: string;
  needEmail: string;
  badEmail: string;
  chooseLp: string;
  chooseUnisend: string;
  chooseOmniva: string;
  needStreet: string;
  needCity: string;
  needPostal: string;
  payFailed: string;
  discountFailed: string;
};

const checkoutText: Record<Market, CheckoutText> = {
  lt: {
    thankYou: 'Ačiū, Jūsų užklausa gauta. Su Jumis susieksime netrukus ir aptarsime galimą nuolaidą.',
    close: 'Uždaryti',
    title: 'Užsakymas',
    deliveryTime: {
      'fx-991-es': 'Numatomas pristatymo laikas: 1–3 dienos priklausomai nuo siuntimo būdo.',
      'fx-991-ex': 'Numatomas pristatymo laikas: 1–3 dienos',
    },
    quantity: 'Vienetų skaičius',
    items: (quantity) => `Prekės (${quantity} vnt.)`,
    shipping: 'Siuntimas',
    free: 'Nemokamai',
    total: 'Bendra suma',
    freeFromThree: 'Nuo 3 vnt. siuntimas nemokamas.',
    method: 'Siuntimo būdas',
    firstName: 'Vardas',
    lastName: 'Pavardė',
    phone: 'Telefonas',
    email: 'El. paštas',
    firstNamePlaceholder: 'Jonas',
    lastNamePlaceholder: 'Jonaitis',
    phonePlaceholder: '+37060000000',
    emailPlaceholder: 'vardas@email.lt',
    street: 'Adresas',
    streetPlaceholder: 'Gatvė, namo nr., butas',
    city: 'Miestas',
    cityPlaceholder: 'Vilnius',
    postal: 'Pašto kodas',
    postalPlaceholder: '01234',
    cancel: 'Atšaukti',
    discount: 'Susisiekti dėl nuolaidos',
    discountSending: 'Siunčiama...',
    pay: 'Apmokėti',
    preparing: 'Ruošiama...',
    badQuantity: 'Įveskite teisingą vienetų skaičių (1–99)',
    needFirstName: 'Įveskite gavėjo vardą',
    needLastName: 'Įveskite gavėjo pavardę',
    needPhone: 'Įveskite telefono numerį',
    badPhone: 'Įveskite teisingą telefono numerį',
    needEmail: 'Įveskite el. paštą',
    badEmail: 'Įveskite teisingą el. paštą',
    chooseLp: 'Pasirinkite LP Express paštomatą',
    chooseUnisend: 'Pasirinkite Unisend paštomatą',
    chooseOmniva: 'Pasirinkite Omniva paštomatą',
    needStreet: 'Įveskite gavėjo adresą',
    needCity: 'Įveskite miestą',
    needPostal: 'Įveskite pašto kodą',
    payFailed: 'Nepavyko pradėti apmokėjimo',
    discountFailed: 'Nepavyko išsiųsti užklausos. Bandykite dar kartą arba susisiekite el. paštu.',
  },
  lv: {
    thankYou: 'Paldies, jūsu pieprasījums ir saņemts. Drīz ar jums sazināsimies un pārrunāsim iespējamo atlaidi.',
    close: 'Aizvērt',
    title: 'Pasūtījums',
    deliveryTime: {
      'fx-991-es': 'Paredzamais piegādes laiks: 1–3 dienas atkarībā no piegādes veida.',
      'fx-991-ex': 'Paredzamais piegādes laiks: 1–3 dienas',
    },
    quantity: 'Vienību skaits',
    items: (quantity) => `Preces (${quantity} gab.)`,
    shipping: 'Piegāde',
    free: 'Bez maksas',
    total: 'Kopā',
    freeFromThree: 'No 3 gab. piegāde ir bez maksas.',
    method: 'Piegādes veids',
    firstName: 'Vārds',
    lastName: 'Uzvārds',
    phone: 'Tālrunis',
    email: 'E-pasts',
    firstNamePlaceholder: 'Jānis',
    lastNamePlaceholder: 'Bērziņš',
    phonePlaceholder: '+37120000000',
    emailPlaceholder: 'vards@epasts.lv',
    street: 'Adrese',
    streetPlaceholder: 'Iela, mājas nr., dzīvoklis',
    city: 'Pilsēta',
    cityPlaceholder: 'Rīga',
    postal: 'Pasta indekss',
    postalPlaceholder: 'LV-1010',
    cancel: 'Atcelt',
    discount: 'Sazināties par atlaidi',
    discountSending: 'Nosūta...',
    pay: 'Maksāt',
    preparing: 'Sagatavo...',
    badQuantity: 'Ievadiet pareizu vienību skaitu (1–99)',
    needFirstName: 'Ievadiet saņēmēja vārdu',
    needLastName: 'Ievadiet saņēmēja uzvārdu',
    needPhone: 'Ievadiet tālruņa numuru',
    badPhone: 'Ievadiet pareizu tālruņa numuru',
    needEmail: 'Ievadiet e-pastu',
    badEmail: 'Ievadiet pareizu e-pastu',
    chooseLp: 'Izvēlieties LP Express pakomātu',
    chooseUnisend: 'Izvēlieties Unisend pakomātu',
    chooseOmniva: 'Izvēlieties Omniva pakomātu',
    needStreet: 'Ievadiet saņēmēja adresi',
    needCity: 'Ievadiet pilsētu',
    needPostal: 'Ievadiet pasta indeksu',
    payFailed: 'Neizdevās sākt maksājumu',
    discountFailed: 'Neizdevās nosūtīt pieprasījumu. Mēģiniet vēlreiz vai sazinieties pa e-pastu.',
  },
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;

function buildDeliverySummary(
  shippingMethod: ShippingMethod,
  terminal: LpExpressTerminal | null,
  street: string,
  city: string,
  postalCode: string,
): string {
  if (shippingMethod === 'pickup-telsiai') {
    return 'Atsiėmimas Telšiuose';
  }
  if (shippingMethod === 'post') {
    return `Paštas: ${street}, ${postalCode} ${city}`;
  }
  if (shippingMethod === 'lp-express' && terminal) {
    return `LP Express ${terminal.city} (${terminal.code}), ${terminal.address}`;
  }
  if ((shippingMethod === 'unisend' || shippingMethod === 'omniva') && terminal) {
    const brand = shippingMethod === 'unisend' ? 'Unisend' : 'Omniva';
    const place = terminal.name ? `${terminal.name}, ${terminal.address}` : terminal.address;
    return `${brand} ${terminal.city} (${terminal.code}), ${place}`;
  }
  return SHIPPING_METHOD_LABELS[shippingMethod];
}

export default function CheckoutModal({
  market = 'lt',
  calculatorId,
  calculatorName,
  onClose,
  onError,
}: CheckoutModalProps) {
  const text = checkoutText[market];
  const shippingOptions = market === 'lv' ? LV_SHIPPING_OPTIONS : SHIPPING_OPTIONS;
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>(market === 'lv' ? 'unisend' : 'lp-express');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [terminal, setTerminal] = useState<LpExpressTerminal | null>(null);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountThankYou, setDiscountThankYou] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => orderSubtotalEur(calculatorId, quantity),
    [calculatorId, quantity],
  );
  const shippingFee = useMemo(
    () => shippingFeeEur(quantity, shippingMethod),
    [quantity, shippingMethod],
  );
  const total = useMemo(
    () => orderTotalEur(calculatorId, quantity, shippingMethod),
    [calculatorId, quantity, shippingMethod],
  );

  const showDiscountButton = quantity >= 5;

  const normalizeQuantity = (value: number) => {
    if (!Number.isFinite(value)) return 1;
    return Math.min(99, Math.max(1, Math.floor(value)));
  };

  const validate = (): string | null => {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return text.badQuantity;
    }
    if (!firstName.trim()) return text.needFirstName;
    if (!lastName.trim()) return text.needLastName;
    if (!phone.trim()) return text.needPhone;
    if (!phonePattern.test(phone.trim())) return text.badPhone;
    if (!email.trim()) return text.needEmail;
    if (!emailPattern.test(email.trim())) return text.badEmail;
    if (shippingMethod === 'lp-express' && !terminal) return text.chooseLp;
    if (shippingMethod === 'unisend' && !terminal) return text.chooseUnisend;
    if (shippingMethod === 'omniva' && !terminal) return text.chooseOmniva;
    if (shippingMethod === 'post') {
      if (!street.trim()) return text.needStreet;
      if (!city.trim()) return text.needCity;
      if (!postalCode.trim()) return text.needPostal;
    }
    return null;
  };

  const buildCheckoutPayload = () => ({
    calculatorId,
    quantity,
    shippingMethod,
    ...(market === 'lv' ? { locale: 'lv' as const } : {}),
    recipient: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
    },
    terminal:
      shippingMethod === 'lp-express' || shippingMethod === 'unisend' || shippingMethod === 'omniva'
        ? terminal ?? undefined
        : undefined,
    postalAddress:
      shippingMethod === 'post'
        ? {
            street: street.trim(),
            city: city.trim(),
            postalCode: postalCode.trim(),
          }
        : undefined,
  });

  const handlePay = async () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const url = await createCheckoutSession(buildCheckoutPayload());
      noteLeftForPayment();
      window.location.href = url;
    } catch (err) {
      onError(err instanceof Error ? err.message : text.payFailed);
      setLoading(false);
    }
  };

  const handleDiscountInquiry = async () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setDiscountLoading(true);

    const deliverySummary = buildDeliverySummary(
      shippingMethod,
      terminal,
      street.trim(),
      city.trim(),
      postalCode.trim(),
    );
    const recipientName = `${firstName.trim()} ${lastName.trim()}`;

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(
          market === 'lv'
            ? {
                _subject: `Latvija: skaičiuotuvų nuolaidos užklausa: ${calculatorName}`,
                Šalis: 'Latvija',
                Skaičiuotuvas: calculatorName,
                'Vienetų skaičius': String(quantity),
                'Siuntimo būdas': SHIPPING_METHOD_LABELS[shippingMethod],
                Pristatymas: deliverySummary,
                Vardas: recipientName,
                'Tel. Nr.': phone.trim(),
                'El. paštas': email.trim(),
                'Prekių suma (be nuolaidos)': formatEur(subtotal),
                Siuntimas: shippingFee === 0 ? 'Nemokamai' : formatEur(shippingFee),
                'Bendra suma (be nuolaidos)': formatEur(total),
                Pastaba: 'Latvijos klientas prašo susisiekti dėl galimos nuolaidos (5 vnt. ar daugiau).',
              }
            : {
                _subject: `Skaičiuotuvų užklausa dėl nuolaidos: ${calculatorName}`,
                Skaičiuotuvas: calculatorName,
                'Vienetų skaičius': String(quantity),
                'Siuntimo būdas': SHIPPING_METHOD_LABELS[shippingMethod],
                Pristatymas: deliverySummary,
                Vardas: recipientName,
                'Tel. Nr.': phone.trim(),
                'El. paštas': email.trim(),
                'Prekių suma (be nuolaidos)': formatEur(subtotal),
                Siuntimas: shippingFee === 0 ? 'Nemokamai' : formatEur(shippingFee),
                'Bendra suma (be nuolaidos)': formatEur(total),
                Pastaba: 'Klientas prašo susisiekti dėl galimos nuolaidos (5 vnt. ar daugiau).',
              },
        ),
      });

      if (!response.ok) {
        throw new Error('FormSubmit failed');
      }

      setDiscountThankYou(true);
    } catch {
      onError(text.discountFailed);
    } finally {
      setDiscountLoading(false);
    }
  };

  const shippingBadge = (optionId: ShippingMethod, basePriceEur: number) => {
    if (optionId === 'pickup-telsiai') {
      return text.free;
    }
    const fee = shippingFeeEur(quantity, optionId);
    if (fee === 0) return text.free;
    return `+${basePriceEur} €`;
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

  const busy = loading || discountLoading;

  if (discountThankYou) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 p-8 animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            aria-label={text.close}
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-slate-700 leading-relaxed pr-8">{text.thankYou}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {text.close}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors z-10"
          aria-label={text.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900">{text.title}</h2>
          <p className="mt-2 text-slate-500">{calculatorName}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {text.deliveryTime[calculatorId] ?? text.deliveryTime['fx-991-ex']}
          </p>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-600">{text.quantity}</span>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))}
              className={`${inputClassName} max-w-[8rem]`}
            />
          </label>

          <div className="mt-4 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between gap-4">
              <span>{text.items(quantity)}</span>
              <span className="font-medium tabular-nums">{formatEur(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>{text.shipping}</span>
              <span className="font-medium tabular-nums">
                {shippingFee === 0 ? text.free : formatEur(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-slate-200 text-base font-semibold text-slate-900">
              <span>{text.total}</span>
              <span className="tabular-nums">{formatEur(total)}</span>
            </div>
            {quantity >= 3 && quantity < 5 && shippingMethod !== 'pickup-telsiai' && (
              <p className="text-xs text-emerald-700 pt-1">{text.freeFromThree}</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-slate-600">{text.method}</p>
            {shippingOptions.map((option) => {
              const selected = shippingMethod === option.id;
              const badge = shippingBadge(option.id, option.priceEur);
              const isFreeBadge = badge === text.free;
              return (
                <label
                  key={option.id}
                  className={`block cursor-pointer rounded-2xl border p-4 transition-colors ${
                    selected
                      ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={option.id}
                      checked={selected}
                      onChange={() => {
                        setShippingMethod(option.id);
                        if (market === 'lv') setTerminal(null);
                      }}
                      className="mt-1"
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">{option.label}</span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isFreeBadge
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {badge}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{option.description}</p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">{text.firstName}</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClassName}
                  placeholder={text.firstNamePlaceholder}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">{text.lastName}</span>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClassName}
                  placeholder={text.lastNamePlaceholder}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">{text.phone}</span>
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
                placeholder={text.phonePlaceholder}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">{text.email}</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder={text.emailPlaceholder}
              />
            </label>

            {shippingMethod === 'lp-express' && (
              <div className="pt-2 border-t border-slate-100">
                <LpExpressWidget value={terminal} onChange={setTerminal} />
              </div>
            )}

            {(shippingMethod === 'unisend' || shippingMethod === 'omniva') && (
              <div className="pt-2 border-t border-slate-100">
                <ParcelLockerWidget
                  key={shippingMethod}
                  carrier={shippingMethod}
                  value={terminal}
                  onChange={setTerminal}
                />
              </div>
            )}

            {shippingMethod === 'post' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">{text.street}</span>
                  <input
                    type="text"
                    autoComplete="street-address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={inputClassName}
                    placeholder={text.streetPlaceholder}
                  />
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">{text.city}</span>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClassName}
                      placeholder={text.cityPlaceholder}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">{text.postal}</span>
                    <input
                      type="text"
                      autoComplete="postal-code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={inputClassName}
                      placeholder={text.postalPlaceholder}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {validationError && <p className="mt-4 text-sm text-red-600">{validationError}</p>}

          <div className="mt-8 flex flex-col-reverse sm:flex-row sm:flex-wrap gap-3 sm:justify-end">
            <button
              onClick={onClose}
              disabled={busy}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
            >
              {text.cancel}
            </button>
            {showDiscountButton && (
              <button
                type="button"
                onClick={handleDiscountInquiry}
                disabled={busy}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors disabled:opacity-60"
              >
                {discountLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MessageCircle className="w-5 h-5" />
                )}
                {discountLoading ? text.discountSending : text.discount}
              </button>
            )}
            <button
              onClick={handlePay}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              {loading ? text.preparing : text.pay}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
