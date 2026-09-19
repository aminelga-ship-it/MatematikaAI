import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Download, PenTool, Shield } from 'lucide-react';

const BUY_URL = 'https://buy.stripe.com/aFa3cn9kg1fr2WMbum8k800';
const SETUP_URL =
  import.meta.env.VITE_EKRASIKLIS_SETUP_URL ||
  'https://github.com/aminelga-ship-it/ekrano-rasiklis/raw/downloads/EkranoRasiklis-Setup.exe';

const features = [
  'Du rėžimai: piešimas ant ekrano langų ir balta lenta',
  'Mokytojas ir mokinys gali rašyti ekrane tuo pačiu metu',
  'Vaizdo dalinimo sustabdymo ("Freeze") funkcija', 
  'standartinių grafikų, koordinačių plokštumų, figūrų įkėlimo funkcija',
  'Valdymas meniu ir karštaisiais klavišais',
  'Galimybė prisitaikyti programą pagal savo poreikius',
  '7 dienų bandomasis laikotarpis, vėliau vienkartinis 9,99 € mokestis',
  'Veikia tik Windows kompiuteryje',
];

export default function EkranoRasiklis() {
  return (
    <div className="px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </Link>

        <div className="rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-slate-500">WINDOWS PROGRAMA</p>
              <h1 className="text-3xl font-bold text-slate-900">Ekrano rašiklis</h1>
            </div>
          </div>

          <p className="mt-6 text-slate-600 leading-relaxed">
            Pieškite ant langų ir baltos lentos. Parsisiųskite ir išbandykite.
          </p>

          <ul className="mt-6 space-y-2">
            {features.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href={SETUP_URL}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
            >
              <Download className="w-4 h-4" />
              Parsisiųsti
            </a>
            <a
              href={BUY_URL}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              <Shield className="w-4 h-4" />
              Pirkti 9,99 €
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
