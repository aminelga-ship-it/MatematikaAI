import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import TutorModal from '@/components/TutorModal';
import { tutors } from '@/data/tutors';

export default function Tutors() {
  const [activeTutor, setActiveTutor] = useState<(typeof tutors)[number] | null>(null);

  return (
    <div className="min-h-[80vh] px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </Link>

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-200">
            <Users className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Matematikos korepetitoriai</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl mb-12">
          Susipažinkite su mūsų korepetitoriumi.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="group flex flex-col rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-xl hover:ring-violet-200 transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[5/4] overflow-hidden bg-slate-100">
                <img
                  src={tutor.photo}
                  alt={tutor.name}
                  className="block mx-auto h-[114%] w-auto max-w-none object-top"
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-lg font-bold text-slate-900">{tutor.name}</h2>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {tutor.shortDescription}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTutor(tutor)}
                  className="mt-5 w-full py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors"
                >
                  Daugiau informacijos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeTutor && <TutorModal tutor={activeTutor} onClose={() => setActiveTutor(null)} />}
    </div>
  );
}
