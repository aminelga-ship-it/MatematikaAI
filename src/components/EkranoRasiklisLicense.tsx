import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Copy, Loader2 } from 'lucide-react';

type LicensePayload = {
  email: string;
  license: string;
};

export default function EkranoRasiklisLicense() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id') || '';
  const [data, setData] = useState<LicensePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('Trūksta mokėjimo sesijos.');
      return;
    }
    let cancelled = false;
    fetch(`/api/ekrano-license?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (response) => {
        const body = (await response.json()) as LicensePayload & { error?: string };
        if (!response.ok) {
          throw new Error(body.error || 'Nepavyko gauti rakto');
        }
        return body;
      })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const copy = async () => {
    if (!data) {
      return;
    }
    await navigator.clipboard.writeText(data.license);
    setCopied(true);
  };

  return (
    <div className="px-6 py-10">
      <div className="max-w-xl mx-auto">
        <Link
          to="/ekrano-rasiklis"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į produktą
        </Link>

        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900">Mokėjimas gautas</h1>
          <p className="mt-2 text-slate-600">
            Įveskite el. paštą ir raktą programoje „Ekrano rašiklis“.
          </p>

          {error && <p className="mt-6 text-sm text-red-600">{error}</p>}
          {!error && !data && (
            <div className="mt-6 flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ruošiamas raktas…
            </div>
          )}
          {data && (
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">El. paštas</p>
                <p className="mt-1 font-medium text-slate-900">{data.email}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">Licencijos raktas</p>
                <p className="mt-1 font-mono text-lg font-semibold text-slate-900">{data.license}</p>
                <button
                  type="button"
                  onClick={copy}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Nukopijuota' : 'Kopijuoti raktą'}
                </button>
                <p className="mt-4 text-sm font-semibold text-amber-800">
                  Būtinai nufotografuokite ar kitaip išsisaugokite kodą.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
