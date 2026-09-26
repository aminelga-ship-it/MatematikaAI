import { useMemo, useState } from 'react';
import { Loader2, MessageCircle, ShoppingCart, X } from 'lucide-react';
import LpExpressWidget from '@/components/LpExpressWidget';
import { CONTACT_EMAIL } from '@/data/tutors';
import { createCheckoutSession } from '@/lib/checkout';
import {
  formatEur,
  orderSubtotalEur,
  orderTotalEur,
  shippingFeeEur,
} from '@/lib/orderPricing';
import type { LpExpressTerminal } from '@/types/lpExpress';
import { SHIPPING_METHOD_LABELS, SHIPPING_OPTIONS, type ShippingMethod } from '@/types/shipping';

type CheckoutModalProps = {
  calculatorId: string;
  calculatorName: string;
  onClose: () => void;
  onError: (message: string) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;

const DELIVERY_TIME: Record<string, string> = {
  'fx-991-es': 'Numatomas pristatymo laikas: 1–3 dienos priklausomai nuo siuntimo būdo.',
  'fx-991-ex': 'Numatomas pristatymo laikas: 1–3 dienos',
};

const DISCOUNT_THANK_YOU =
  'Ačiū, Jūsų užklausa gauta. Su Jumis susieksime netrukus ir aptarsime galimą nuolaidą.';

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
  return SHIPPING_METHOD_LABELS[shippingMethod];
}

export default function CheckoutModal({
  calculatorId,
  calculatorName,
  onClose,
  onError,
}: CheckoutModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('lp-express');
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
      return 'Įveskite teisingą vienetų skaičių (1–99)';
    }
    if (!firstName.trim()) return 'Įveskite gavėjo vardą';
    if (!lastName.trim()) return 'Įveskite gavėjo pavardę';
    if (!phone.trim()) return 'Įveskite telefono numerį';
    if (!phonePattern.test(phone.trim())) return 'Įveskite teisingą telefono numerį';
    if (!email.trim()) return 'Įveskite el. paštą';
    if (!emailPattern.test(email.trim())) return 'Įveskite teisingą el. paštą';
    if (shippingMethod === 'lp-express' && !terminal) return 'Pasirinkite LP Express paštomatą';
    if (shippingMethod === 'post') {
      if (!street.trim()) return 'Įveskite gavėjo adresą';
      if (!city.trim()) return 'Įveskite miestą';
      if (!postalCode.trim()) return 'Įveskite pašto kodą';
    }
    return null;
  };

  const buildCheckoutPayload = () => ({
    calculatorId,
    quantity,
    shippingMethod,
    recipient: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim(),
    },
    terminal: shippingMethod === 'lp-express' ? terminal ?? undefined : undefined,
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
      window.location.href = url;
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Nepavyko pradėti apmokėjimo');
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
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        throw new Error('FormSubmit failed');
      }

      setDiscountThankYou(true);
    } catch {
      onError('Nepavyko išsiųsti užklausos. Bandykite dar kartą arba susisiekite el. paštu.');
    } finally {
      setDiscountLoading(false);
    }
  };

  const shippingBadge = (optionId: ShippingMethod, basePriceEur: number) => {
    if (optionId === 'pickup-telsiai') {
      return 'Nemokamai';
    }
    const fee = shippingFeeEur(quantity, optionId);
    if (fee === 0) return 'Nemokamai';
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
            aria-label="Uždaryti"
          >
            <X className="w-5 h-5" />
          </button>
          <p className="text-slate-700 leading-relaxed pr-8">{DISCOUNT_THANK_YOU}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Uždaryti
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
          aria-label="Uždaryti"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900">Užsakymas</h2>
          <p className="mt-2 text-slate-500">{calculatorName}</p>
          <p className="mt-1 text-sm font-medium text-slate-600">
            {DELIVERY_TIME[calculatorId] ?? DELIVERY_TIME['fx-991-ex']}
          </p>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-medium text-slate-600">Vienetų skaičius</span>
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
              <span>Prekės ({quantity} vnt.)</span>
              <span className="font-medium tabular-nums">{formatEur(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Siuntimas</span>
              <span className="font-medium tabular-nums">
                {shippingFee === 0 ? 'Nemokamai' : formatEur(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-2 border-t border-slate-200 text-base font-semibold text-slate-900">
              <span>Bendra suma</span>
              <span className="tabular-nums">{formatEur(total)}</span>
            </div>
            {quantity >= 3 && quantity < 5 && shippingMethod !== 'pickup-telsiai' && (
              <p className="text-xs text-emerald-700 pt-1">Nuo 3 vnt. siuntimas nemokamas.</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-slate-600">Siuntimo būdas</p>
            {SHIPPING_OPTIONS.map((option) => {
              const selected = shippingMethod === option.id;
              const badge = shippingBadge(option.id, option.priceEur);
              const isFreeBadge = badge === 'Nemokamai';
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
                      onChange={() => setShippingMethod(option.id)}
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
                <span className="mb-2 block text-sm font-medium text-slate-600">Vardas</span>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClassName}
                  placeholder="Jonas"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">Pavardė</span>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClassName}
                  placeholder="Jonaitis"
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">Telefonas</span>
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClassName}
                placeholder="+37060000000"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-600">El. paštas</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="vardas@email.lt"
              />
            </label>

            {shippingMethod === 'lp-express' && (
              <div className="pt-2 border-t border-slate-100">
                <LpExpressWidget value={terminal} onChange={setTerminal} />
              </div>
            )}

            {shippingMethod === 'post' && (
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Adresas</span>
                  <input
                    type="text"
                    autoComplete="street-address"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={inputClassName}
                    placeholder="Gatvė, namo nr., butas"
                  />
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Miestas</span>
                    <input
                      type="text"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClassName}
                      placeholder="Vilnius"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">Pašto kodas</span>
                    <input
                      type="text"
                      autoComplete="postal-code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={inputClassName}
                      placeholder="01234"
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
              Atšaukti
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
                {discountLoading ? 'Siunčiama...' : 'Susisiekti dėl nuolaidos'}
              </button>
            )}
            <button
              onClick={handlePay}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingCart className="w-5 h-5" />}
              {loading ? 'Ruošiama...' : 'Apmokėti'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
