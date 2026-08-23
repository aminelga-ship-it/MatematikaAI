import { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { fetchLpExpressTerminals } from '@/lib/terminals';
import type { LpExpressTerminal } from '@/types/lpExpress';

type LpExpressWidgetProps = {
  value: LpExpressTerminal | null;
  onChange: (terminal: LpExpressTerminal | null) => void;
};

export default function LpExpressWidget({ value, onChange }: LpExpressWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [terminalsByCity, setTerminalsByCity] = useState<Record<string, LpExpressTerminal[]>>({});
  const [selectedCity, setSelectedCity] = useState(value?.city ?? '');

  const cities = useMemo(
    () => Object.keys(terminalsByCity).sort((a, b) => a.localeCompare(b, 'lt')),
    [terminalsByCity],
  );

  const terminalsInCity = useMemo(
    () => (selectedCity ? terminalsByCity[selectedCity] ?? [] : []),
    [selectedCity, terminalsByCity],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const terminals = await fetchLpExpressTerminals();
        if (cancelled) return;

        setTerminalsByCity(terminals);

        if (value?.city && terminals[value.city]) {
          setSelectedCity(value.city);
        } else {
          const firstCity = Object.keys(terminals).sort((a, b) => a.localeCompare(b, 'lt'))[0] ?? '';
          setSelectedCity(firstCity);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Nepavyko įkelti paštomatų');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onChange(null);
  };

  const handleTerminalChange = (terminalId: string) => {
    const terminal = terminalsInCity.find((item) => item.id === terminalId) ?? null;
    onChange(terminal);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl bg-slate-50 ring-1 ring-slate-200 px-4 py-10 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Kraunami paštomatai...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 px-4 py-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-700">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold">Pasirinkite LP Express paštomatą</h3>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Miestas</span>
          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-600">Paštomatas</span>
          <select
            value={value?.id ?? ''}
            onChange={(e) => handleTerminalChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Pasirinkite paštomatą</option>
            {terminalsInCity.map((terminal) => (
              <option key={terminal.id} value={terminal.id}>
                {terminal.address}
              </option>
            ))}
          </select>
        </label>
      </div>

      {value && (
        <div className="rounded-2xl bg-blue-50 ring-1 ring-blue-200 px-4 py-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">{value.city}</p>
          <p className="mt-1">{value.address}</p>
          {value.comment && <p className="mt-2 text-slate-600">{value.comment}</p>}
        </div>
      )}
    </div>
  );
}
