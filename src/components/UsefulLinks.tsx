import { ArrowLeft, ArrowUpRight, Link2 } from 'lucide-react';
import { usefulLinks } from '@/data/usefulLinks';

type UsefulLinksProps = {
  onBack: () => void;
};

export default function UsefulLinks({ onBack }: UsefulLinksProps) {
  return (
    <div className="min-h-[80vh] px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </button>

        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-200">
              <Link2 className="w-7 h-7" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Naudingos nuorodos</h1>
          </div>
          <p className="text-slate-500 text-lg max-w-2xl">
            Formulių lapai, egzaminai ir kiti naudingi matematikos ištekliai vienoje vietoje.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {usefulLinks.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start justify-between gap-5 p-6 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:ring-violet-200 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-200">
                  <Link2 className="w-6 h-6" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                  {link.title}
                </h2>
              </div>
              <ArrowUpRight className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-violet-600 transition-colors" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
