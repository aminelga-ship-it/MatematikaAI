import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { VisitSummary } from '@/lib/visitAnalytics';

const KEY_STORAGE = 'mai_stats_key';

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `${seconds} sek.`;
  return `${minutes} min. ${seconds} sek.`;
}

function formatShare(part: number, total: number): string {
  if (total <= 0) return '0 %';
  return `${Math.round((part / total) * 100)} %`;
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500 leading-relaxed">{detail}</p>
    </div>
  );
}

export default function VisitStats() {
  const [summary, setSummary] = useState<VisitSummary | null>(null);
  const [keyInput, setKeyInput] = useState(() => sessionStorage.getItem(KEY_STORAGE) ?? '');
  const [needsKey, setNeedsKey] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(key: string) {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch('/api/analytics', {
        headers: key ? { 'x-analytics-key': key } : {},
      });
      const payload = (await response.json().catch(() => null)) as
        | (VisitSummary & { message?: string; error?: string })
        | null;

      if (response.status === 401) {
        setNeedsKey(true);
        setSummary(null);
        setMessage('Neteisingas raktas.');
        return;
      }

      if (!response.ok) {
        setSummary(null);
        setNeedsKey(payload?.error === 'missing-key');
        setMessage(payload?.message ?? 'Suvestinės nepavyko nuskaityti.');
        return;
      }

      setNeedsKey(false);
      setSummary(payload as VisitSummary);
      if (key) sessionStorage.setItem(KEY_STORAGE, key);
    } catch {
      setSummary(null);
      setMessage('Suvestinės nepavyko nuskaityti.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(keyInput);
    // The saved key is read once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const opens = summary?.calculatorOpens ?? 0;

  return (
    <div className="min-h-[80vh] px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </Link>

        <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Lankytojų suvestinė</h1>
        <p className="mt-3 text-slate-500 text-lg max-w-2xl">
          Skaičiuotuvų puslapio lankytojai. Apmokėjimo paspaudimus ir sėkmingus mokėjimus matote
          Stripe.
        </p>

        {needsKey && (
          <form
            className="mt-8 flex flex-col sm:flex-row gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void load(keyInput.trim());
            }}
          >
            <input
              type="password"
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              placeholder="Peržiūros raktas"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none ring-blue-500 focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Rodyti
            </button>
          </form>
        )}

        {message && <p className="mt-6 text-sm text-amber-700">{message}</p>}
        {loading && <p className="mt-8 text-slate-500">Kraunama...</p>}

        {summary && !loading && (
          <>
            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <StatCard
                label="Atidarė puslapį"
                value={String(summary.calculatorOpens)}
                detail="Kiek lankytojų atidarė skaičiuotuvų puslapį, įskaitant reklamą tiesiai į užsakymą."
              />
              <StatCard
                label="Išėjo per mažiau nei 3 sek."
                value={`${summary.quickExits} · ${formatShare(summary.quickExits, opens)}`}
                detail="Uždarė svetainę per pirmas 3 sekundes. Perėjimas į Stripe čia neįskaičiuojamas."
              />
              <StatCard
                label="Uždarė langą ir dar domėjosi"
                value={`${summary.closedModalAndBrowsed} · ${formatShare(summary.closedModalAndBrowsed, opens)}`}
                detail="Uždarė tik užsakymo langą ir paskui bent 5 sek. žiūrėjo palyginimą arba atidarė išsamesnę informaciją."
              />
              <StatCard
                label="Nuėjo į kitas skiltis"
                value={`${summary.otherSectionVisitors} · ${formatShare(summary.otherSectionVisitors, opens)}`}
                detail="Iš skaičiuotuvų puslapio nuėjo į pagrindinį, korepetitorius, ekrano rašiklį ar naudingas nuorodas."
              />
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Laikas svetainėje</p>
              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(summary.averageDurationMs)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Vidurkis</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatDuration(summary.medianDurationMs)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Mediana</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {summary.calculatorOpens === summary.quickExits
                      ? '—'
                      : formatDuration(summary.averageStayDurationMs)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Vidurkis be greitų išėjimų</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Skaičiuojamas laikas, kol svetainė buvo matoma. Laikas Stripe puslapyje neįeina.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Kitos skiltys</p>
              {summary.sections.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">Dar niekas nenuėjo į kitą skiltį.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {summary.sections.map((section) => (
                    <li key={section.label} className="flex items-center justify-between py-2 text-slate-700">
                      <span>{section.label}</span>
                      <span className="font-semibold">{section.count}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-sm text-slate-500">
                Tas pats lankytojas gali ir peržiūrėti skaičiuotuvą, ir nueiti į kitą skiltį, todėl
                skaičiai persidengia.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
