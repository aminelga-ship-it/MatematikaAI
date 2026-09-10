import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { CONTACT_EMAIL, GRADE_OPTIONS, tutors } from '@/data/tutors';

const phonePattern = /^\+?[0-9\s\-()]{8,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const tutor = tutors[0];

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200';

export default function TutorInquiryForm() {
  const navigate = useNavigate();
  const [grade, setGrade] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!grade) {
      setErrorMessage('Pasirinkite klasę.');
      return;
    }

    if (!trimmedPhone || !phonePattern.test(trimmedPhone)) {
      setErrorMessage('Įveskite teisingą telefono numerį.');
      return;
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      setErrorMessage('Įveskite teisingą el. paštą.');
      return;
    }

    setIsSending(true);

    const emailBody = [
      `Pasirinktas korepetitorius: ${tutor.name}`,
      `Klasė: ${grade}`,
      `Vardas: ${trimmedName}`,
      `Tel. Nr.: ${trimmedPhone}`,
      `El. paštas: ${trimmedEmail || '—'}`,
    ].join('\n');

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
          Klasė: grade,
          Vardas: trimmedName,
          'Tel. Nr.': trimmedPhone,
          'El. paštas': trimmedEmail || '—',
        }),
      });

      if (!response.ok) {
        throw new Error('FormSubmit failed');
      }

      navigate('/korepetitoriai/uzklausa-gauta');
    } catch {
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
        `Korepetitorių užklausa: ${tutor.name}`,
      )}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailto;
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-md mx-auto">
        <Link
          to="/korepetitoriai"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Atgal
        </Link>

        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-5 sm:p-6">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 shrink-0 rounded-2xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden">
              <img src={tutor.photo} alt={tutor.name} className="h-full w-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">{tutor.name}</h1>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{tutor.shortDescription}</p>
              <p className="mt-2 text-sm font-semibold text-violet-600">
                Kaina: {tutor.price.charAt(0).toLowerCase() + tutor.price.slice(1)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Pasirinkite klasę</span>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
                className={inputClassName}
              >
                <option value="">Pasirinkite...</option>
                {GRADE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Jūsų vardas</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClassName}
                placeholder="Vardas"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Tel. nr.</span>
              <input
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClassName}
                placeholder="+370..."
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">El. paštas</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClassName}
                placeholder="vardas@email.lt (neprivaloma)"
              />
            </label>

            {errorMessage && <p className="text-sm font-medium text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSending}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSending ? 'Siunčiama...' : 'Siųsti formą'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
