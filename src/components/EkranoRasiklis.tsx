import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, PenTool, Play } from 'lucide-react';

const BUY_URL = 'https://buy.stripe.com/aFa3cn9kg1fr2WMbum8k800';
const SETUP_URL =
  import.meta.env.VITE_EKRASIKLIS_SETUP_URL ||
  'https://github.com/aminelga-ship-it/ekrano-rasiklis/raw/downloads/EkranoRasiklis-Setup.exe';
const VIDEO_URL = (import.meta.env.VITE_EKRASIKLIS_VIDEO_URL || '').trim();

const features = [
  'Du rėžimai: piešimas ant ekrano langų ir balta lenta',
  'Mokytojas ir mokinys gali rašyti ekrane tuo pačiu metu',
  'Vaizdo dalinimo sustabdymo ("Freeze") funkcija',
  'Standartinių grafikų, koordinačių plokštumų, figūrų įkėlimo funkcija',
  'Valdymas meniu ir karštaisiais klavišais',
  'Galimybė prisitaikyti programą pagal savo poreikius',
  '7 dienų bandomasis laikotarpis, vėliau vienkartinis 9,99 € mokestis',
  'Veikia tik Windows kompiuteryje',
];

function FeatureCheck() {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
      <Check className="w-4 h-4" strokeWidth={2.5} />
    </span>
  );
}

function FeatureTable({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl ring-1 ring-slate-200 overflow-hidden divide-y divide-slate-200">
      {items.map((item, index) => (
        <div
          key={item}
          className={`flex items-start justify-between gap-3 px-3 py-3 sm:px-4 sm:py-3 ${
            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
          }`}
        >
          <span className="min-w-0 flex-1 text-sm leading-snug text-slate-600">{item}</span>
          <div className="shrink-0 pt-0.5">
            <FeatureCheck />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EkranoRasiklis() {
  return (
    <div className="min-h-[80vh] px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-lg mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </Link>

        <div className="flex flex-col rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-7">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200 mb-5">
              <PenTool className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900">Ekrano rašiklis</h1>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Windows programa pamokoms: piešimas ant ekrano, balta lenta ir kitos funkcijos.
            </p>

            <div className="mt-5 rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-4">
              <h2 className="font-semibold text-slate-700 mb-2">Trumpai</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pieškite ant langų ir baltos lentos. Parsisiųskite ir išbandykite 7 dienas nemokamai.
              </p>
            </div>
          </div>

          <div className="px-5 pb-6 sm:px-7 sm:pb-7">
            <FeatureTable items={features} />

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={SETUP_URL}
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Parsisiųsti
              </a>
              {VIDEO_URL ? (
                <a
                  href={VIDEO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Žiūrėti video
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
                  aria-disabled="true"
                >
                  <Play className="w-5 h-5" />
                  Žiūrėti video
                </span>
              )}
            </div>

            <a
              href={BUY_URL}
              className="mt-4 block text-center text-sm text-slate-500 hover:text-slate-800 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-500"
            >
              Pirkti dabar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
