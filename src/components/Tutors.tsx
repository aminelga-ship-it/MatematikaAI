import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Send, Users } from 'lucide-react';

type Tutor = {
  id: string;
  name: string;
  price: string;
  photo: string;
  shortDescription: string;
  fullDescription: string;
};

const CONTACT_EMAIL = 'a.minelga@gmail.com';

const tutors: Tutor[] = [
  {
    id: 'tutor-1',
    name: 'Artūras Minelga',
    price: '25 Eur/1 a.v.',
    photo: '/images/arturas.jpg',
    shortDescription:
      'Individualios matematikos pamokos 5–12 kl. mokiniams. 12 metų patirtis.',
    fullDescription: `Individualios matematikos pamokos 5-12 kl. moksleiviams:
✅ professionaliai - 11 metų patirtis, pedagoginis išsilavinimas, darbas gimnazijoje.
✅ aiškiai - medžiaga pateikiama kaip paprastam žmogui, ne mokytojui.
✅ lanksčiai - nereikia pirkti jokių narysčių ar mokėti už mėnesį į priekį, taigi, niekuo nerizikuojate. Galima dirbti ir sekmadieniais, o pamokų laiką esant reikalui keisti.
✅ kūrybiškai - gyvenimiški pavyzdžiai, naudojami inovatyvūs metodai.
✅ individualiai - pritaikomas mokymosi būdas ir skiriamas dėmesys tik Jums.`,
  },
];

function buildEmailBody({
  tutorName,
  message,
  facebook,
  phone,
}: {
  tutorName: string;
  message: string;
  facebook: string;
  phone: string;
}) {
  return [
    `Pasirinktas korepetitorius: ${tutorName}`,
    '',
    'Kliento žinutė:',
    message,
    '',
    'Kontaktai:',
    `Facebook profilio nuoroda: ${facebook.trim() || '—'}`,
    `Tel. Nr.: ${phone.trim() || '—'}`,
  ].join('\n');
}

function TutorModal({ tutor, onClose }: { tutor: Tutor; onClose: () => void }) {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [facebook, setFacebook] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const trimmedMessage = message.trim();
    const trimmedFacebook = facebook.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedMessage) {
      setErrorMessage('Įrašykite žinutę.');
      return;
    }

    if (!trimmedFacebook && !trimmedPhone) {
      setErrorMessage('Įveskite Facebook profilio nuorodą arba telefono numerį (galima abu).');
      return;
    }

    setIsSending(true);

    const emailBody = buildEmailBody({
      tutorName: tutor.name,
      message: trimmedMessage,
      facebook: trimmedFacebook,
      phone: trimmedPhone,
    });

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${CONTACT_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `Korepetitorių užklausa: ${tutor.name}`,
          Korepetitorius: tutor.name,
          Žinutė: trimmedMessage,
          'Facebook profilis': trimmedFacebook || '—',
          'Tel. Nr.': trimmedPhone || '—',
        }),
      });

      if (!response.ok) {
        throw new Error('FormSubmit failed');
      }

      setMessage('');
      setFacebook('');
      setPhone('');
      onClose();
      navigate('/korepetitoriai/uzklausa-gauta');
    } catch {
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Korepetitorių užklausa: ${tutor.name}`,
      )}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailto;
      setStatusMessage('Atidarytas el. pašto langas — patvirtinkite siuntimą.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-scale-in"
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
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="w-32 h-32 shrink-0 rounded-2xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden">
              <img
                src={tutor.photo}
                alt={tutor.name}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{tutor.name}</h2>
              <p className="mt-1 text-lg font-semibold text-violet-600">{tutor.price}</p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{tutor.fullDescription}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-3">Susisiekite su korepetitoriumi</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Parašykite savo klausimą ar užklausą čia..."
              rows={4}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors resize-none"
            />

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Facebook profilio nuoroda</span>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Tel. Nr.</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+370..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-colors"
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Reikia bent vieno kontakto — Facebook nuorodos arba telefono numerio (galima abu).
            </p>

            {errorMessage && <p className="mt-3 text-sm font-medium text-red-600">{errorMessage}</p>}
            {statusMessage && <p className="mt-3 text-sm font-medium text-emerald-600">{statusMessage}</p>}

            <button
              type="submit"
              disabled={isSending}
              className="mt-3 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Siunčiama...' : 'Siųsti užklausą'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Tutors() {
  const [activeTutor, setActiveTutor] = useState<Tutor | null>(null);

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
          Susipažinkite su mūsų korepetitoriumi ir pasirinkite tinkamiausią pagalbininką.
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
                <p className="mt-1 text-base font-semibold text-violet-600">{tutor.price}</p>
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
