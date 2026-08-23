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

export default function CheckoutModal({
  calculatorId,
  calculatorName,
  onClose,
  onError,
}: CheckoutModalProps) {
  const [terminal, setTerminal] = useState<LpExpressTerminal | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!terminal) {
      setValidationError('Pasirinkite LP Express paštomatą');
      return;
    }

    setValidationError(null);
    setLoading(true);

    try {
      const url = await createCheckoutSession(calculatorId, terminal);
      window.location.href = url;
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Nepavyko pradėti apmokėjimo');
      setLoading(false);
    }
  };

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

          <div className="mt-6">
            <LpExpressWidget value={terminal} onChange={setTerminal} />
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
