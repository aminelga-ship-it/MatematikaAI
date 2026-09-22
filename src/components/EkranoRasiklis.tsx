import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, PenTool, Play } from 'lucide-react';

const BUY_URL = 'https://buy.stripe.com/aFa3cn9kg1fr2WMbum8k800';
const SETUP_URL =
  import.meta.env.VITE_EKRASIKLIS_SETUP_URL ||
  'https://github.com/aminelga-ship-it/ekrano-rasiklis/releases/latest/download/EkranoRasiklis-Setup.exe';
const VIDEO_URL = (import.meta.env.VITE_EKRASIKLIS_VIDEO_URL || '').trim();

const features = [
  'Du rėžimai: piešimas ant ekrano langų ir balta lenta',
  'Mokytojas ir mokinys gali rašyti ekrane tuo pačiu metu',
  'Vaizdo dalinimo sustabdymo ("Freeze") funkcija',
  'Standartinių grafikų, koordinačių plokštumų, figūrų įkėlimo funkcija',
  'Valdymas meniu ir karštaisiais klavišais',
  'Galimybė prisitaikyti programą pagal savo poreikius',
  '7 dienų bandomasis laikotarpis, vėliau vienkartinis 9,99 € mokestis',
  'Veikia tik Windows operacinėje sistemoje',
];

function FeatureCheck() {
  return (
    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
    </span>
  );
}

function FeatureTable({ items }: { items: string[] }) {
  return (
    <div className="rounded-xl ring-1 ring-slate-200 overflow-hidden divide-y divide-slate-200">
      {items.map((item, index) => (
        <div
          key={item}
          className={`flex items-center gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 ${
            index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
          }`}
        >
          <div className="shrink-0">
            <FeatureCheck />
          </div>
          <span className="min-w-0 flex-1 text-xs sm:text-sm leading-snug text-slate-600">{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function EkranoRasiklis() {
  return (
    <div className="px-4 py-3 sm:px-6 sm:py-5 min-h-[calc(100dvh-4rem)] flex flex-col">
      <div className="max-w-md mx-auto w-full flex flex-col flex-1 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-3 sm:mb-4 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Grįžti į pradžią
        </Link>

        <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                <PenTool className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">Ekrano rašiklis</h1>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">
                  Windows programa pamokoms – piešimas ant ekrano ir balta lenta.
                </p>
              </div>
            </div>

            <FeatureTable items={features} />

            <div className="mt-3 sm:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <a
                href={SETUP_URL}
                download="EkranoRasiklis-Setup.exe"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/15 hover:bg-blue-700 transition-colors"
              >
              <Download className="w-4 h-4" />
              Parsisiųsti
            </a>
              {VIDEO_URL ? (
                <a
                  href={VIDEO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Žiūrėti video
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg text-sm bg-slate-100 text-slate-400 font-semibold cursor-not-allowed"
                  aria-disabled="true"
                >
                  <Play className="w-4 h-4" />
                  Žiūrėti video
                </span>
              )}
            </div>
          
            <a
              href={BUY_URL}
              className="mt-2 block text-center text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-500"
            >
              Pirkti dabar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
