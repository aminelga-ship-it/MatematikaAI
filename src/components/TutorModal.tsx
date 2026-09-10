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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg max-h-[100dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors z-10"
          aria-label="Uždaryti"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-4 sm:p-5 pb-3 overflow-hidden">
          <div className="flex gap-3 pr-8">
            <div className="w-16 h-16 shrink-0 rounded-xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden">
              <img src={tutor.photo} alt={tutor.name} className="h-full w-full object-cover object-top" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{tutor.name}</h2>
              <p className="mt-0.5 text-sm font-semibold text-violet-600">{tutor.price}</p>
              <a
                href={tutor.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-flex items-center gap-2 group"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1877F2] text-white">
                  <Facebook className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                </span>
                <span className="text-xs text-slate-900 underline underline-offset-2 group-hover:text-slate-700">
                  {tutor.facebookLabel}
                </span>
              </a>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-snug">{tutor.intro}</p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600 leading-snug">
            {tutor.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-2">
                <span className="shrink-0" aria-hidden="true">✅</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleInquiry}
            className="w-full py-3 rounded-xl bg-violet-600 text-white text-sm font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors"
          >
            Siųsti užklausą
          </button>
        </div>
      </div>
    </div>
  );
}
