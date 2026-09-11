import { Facebook, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tutor } from '@/data/tutors';

type TutorModalProps = {
  tutor: Tutor;
  onClose: () => void;
};

export default function TutorModal({ tutor, onClose }: TutorModalProps) {
  const navigate = useNavigate();

  const handleInquiry = () => {
    onClose();
    navigate('/korepetitoriai/uzklausa');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-2xl h-[94dvh] sm:h-auto sm:max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors z-10"
          aria-label="Uždaryti"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto p-5 sm:p-8 pb-4">
          <div className="flex gap-4 pr-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden">
              <img src={tutor.photo} alt={tutor.name} className="h-full w-full object-cover object-top" />
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">{tutor.name}</h2>
              <p className="mt-1 text-lg font-semibold text-slate-900">Pamokos kaina {tutor.price}</p>
              <a
                href={tutor.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2.5 group"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
                  <Facebook className="w-4 h-4 fill-current" aria-hidden="true" />
                </span>
                <span className="text-sm sm:text-base text-slate-900 underline underline-offset-2 group-hover:text-slate-700">
                  {tutor.facebookLabel}
                </span>
              </a>
            </div>
          </div>

          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">{tutor.intro}</p>
          <ul className="mt-4 space-y-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            {tutor.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2.5">
                <span className="shrink-0" aria-hidden="true">✅</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 sm:p-6 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleInquiry}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white text-base font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors"
          >
            Siųsti užklausą
          </button>
        </div>
      </div>
    </div>
  );
}
