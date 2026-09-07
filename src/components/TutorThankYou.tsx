import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function TutorThankYou() {
  return (
    <div className="min-h-[80vh] px-6 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Ačiū! Jūsų užklausa gauta
        </h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          Netrukus su jumis susisieksime dėl matematikos korepetitoriaus paslaugų.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/korepetitoriai"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors"
          >
            Grįžti į korepetitorių puslapį
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Grįžti į pradžią
          </Link>
        </div>
      </div>
    </div>
  );
}
