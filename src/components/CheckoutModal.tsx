import { useState } from 'react';
import { Loader2, ShoppingCart, X } from 'lucide-react';
import LpExpressWidget from '@/components/LpExpressWidget';
import { createCheckoutSession } from '@/lib/checkout';
import type { LpExpressTerminal } from '@/types/lpExpress';

type CheckoutModalProps = {
  calculatorId: string;
  calculatorName: string;
  onClose: () => void;
  onError: (message: string) => void;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;

export default function CheckoutModal({
  calculatorId,
  calculatorName,
  onClose,
  onError,
}: CheckoutModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [terminal, setTerminal] = useState<LpExpressTerminal | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!firstName.trim()) return 'Įveskite gavėjo vardą';
    if (!lastName.trim()) return 'Įveskite gavėjo pavardę';
    if (!phone.trim()) return 'Įveskite telefono numerį';
    if (!phonePattern.test(phone.trim())) return 'Įveskite teisingą telefono numerį';
    if (!email.trim()) return 'Įveskite el. paštą';
    if (!emailPattern.test(email.trim())) return 'Įveskite teisingą el. paštą';
    if (!terminal) return 'Pasirinkite LP Express paštomatą';
    return null;
  };

  const handlePay = async () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    if (!terminal) return;

    setValidationError(null);
    setLoading(true);

    try {
      const url = await createCheckoutSession({
        calculatorId,
        recipient: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        terminal,
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
          <p className="mt-1 text-sm font-medium text-emerald-700">Nemokamas siuntimas</p>

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

            <div className="pt-2 border-t border-slate-100">
              <LpExpressWidget value={terminal} onChange={setTerminal} />
            </div>
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
