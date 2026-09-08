import { useState } from 'react';
import { Loader2, ShoppingCart, X } from 'lucide-react';
import LpExpressWidget from '@/components/LpExpressWidget';
import { createCheckoutSession } from '@/lib/checkout';
import type { LpExpressTerminal } from '@/types/lpExpress';
import { SHIPPING_OPTIONS, type ShippingMethod } from '@/types/shipping';

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
  'fx-991-ex': 'Numatomas pristatymo laikas: 7–10 dienų',
};

export default function CheckoutModal({
  calculatorId,
  calculatorName,
  onClose,
  onError,
}: CheckoutModalProps) {
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
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (): string | null => {
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

  const handlePay = async () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const url = await createCheckoutSession({
        calculatorId,
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
      window.location.href = url;
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Nepavyko pradėti apmokėjimo');
      setLoading(false);
    }
  };

  const inputClassName =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200';

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

          <div className="mt-6 space-y-3">
            <p className="text-sm font-medium text-slate-600">Siuntimo būdas</p>
            {SHIPPING_OPTIONS.map((option) => {
              const selected = shippingMethod === option.id;
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
                            option.priceEur === 0
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {option.priceEur === 0 ? 'Nemokamai' : `+${option.priceEur} €`}
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

          {validationError && (
            <p className="mt-4 text-sm text-red-600">{validationError}</p>
          )}

          <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-60"
            >
              Atšaukti
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
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
