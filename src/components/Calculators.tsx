import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, ShoppingCart, Info, ZoomIn, Truck } from 'lucide-react';
import CheckoutModal from '@/components/CheckoutModal';

type CalculatorImage = {
  src: string;
  alt: string;
};

type CalculatorModel = {
  id: string;
  name: string;
  price: string;
  coverImage: string;
  priceCompareUrl: string;
  summary: string;
  recommendation: string;
  modalImages: CalculatorImage[];
  features: {
    qrInstructions: boolean;
    qrTheory: boolean;
    screen: string;
    irrationalNumbers: boolean;
    integrals: boolean;
    equations: boolean;
    vectors: boolean;
    inequalities: boolean;
    speed: string;
    otherLabel: string | null;
    other: string | null;
  };
};

const models: CalculatorModel[] = [
  {
    id: 'fx-991-es',
    name: 'FX-991 ES 2nd edition',
    price: '24,99€',
    coverImage: '/images/ES.png',
    priceCompareUrl: 'https://www.kaina24.lt/p/skaiciuotuvas-casio-fx-991esplus-2-juodas/',
    summary:
      'Skaičiuotuvas iš esmės turi visas reikalingas funkcijas mokykloje, išskyrus nelygybių sprendimą. Pagrindinė žemesnės kainos priežastis yra šiek tiek silpnesnis procesorius (dėl to itin sudėtingus skaičiavimus atlieka su 5-10 sek. uždelsimu) ir prastesnis ekranas.',
    recommendation: 'Rekomenduojamas taupantiems, nes gaunate ~99% funkcijų už mažesnę kainą',
    modalImages: [
      { src: '/images/ES_meniu.png', alt: 'Meniu' },
      { src: '/images/ES_gidas.png', alt: 'Gidas' },
      { src: '/images/Teorija.png', alt: 'Teorija' },
    ],
    features: {
      qrInstructions: true,
      qrTheory: true,
      screen: 'Aiškus',
      irrationalNumbers: true,
      integrals: true,
      equations: true,
      vectors: true,
      inequalities: false,
      speed: 'Itin sudėtingose užduotyse yra 5-10 sek. uždelsimas',
      otherLabel: null,
      other: null,
    },
  },
  {
    id: 'fx-991-ex',
    name: 'FX-991 EX ClassWiz',
    price: '29,99€',
    coverImage: '/images/EX.png',
    priceCompareUrl:
      'https://www.kainos.lt/skaiciuotuvai/casio-calculator-fx-991cex-v1696547?gad_source=1&gad_campaignid=6443829327&gbraid=0AAAAADlYnfMaLZHINV2Bt-k1jU15_-FfZ&gclid=Cj0KCQjwkOvTBhDgARIsAKUNyRvrA7U-zkb3cGzGeU27GdMUzSVEfp5yPd2DPF56oszMUv_dZHi-rWEaAmv1EALw_wcB',
    summary: 'Tai yra pats geriausias ir galingiausias leidžiamas skaičiuotuvas mokykloje',
    recommendation: 'Rekomenduojamas tiems, kam sutaupyti 5 Eur nėra reikšminga',
    modalImages: [
      { src: '/images/EX_meniu.png', alt: 'Meniu' },
      { src: '/images/EX_gidas.png', alt: 'Gidas' },
      { src: '/images/Teorija.png', alt: 'Teorija' },
    ],
    features: {
      qrInstructions: true,
      qrTheory: true,
      screen: 'Modernus',
      irrationalNumbers: true,
      integrals: true,
      equations: true,
      vectors: true,
      inequalities: true,
      speed: 'Greitas',
      otherLabel: 'Kiti privalumai',
      other:
        'Gali nustatyti parabrolės viršūnės koordinates, proporcijų skaičiavimas, pilnesni meniu pavadinimai, didesnės raiškos ekranas',
    },
  },
];

const comparisonRows: { label: string; key: (m: CalculatorModel) => string | boolean }[] = [
  { label: 'QR kodas su instrukcijomis moksleiviams', key: (m) => m.features.qrInstructions },
  { label: 'QR kodas su 7–12 kl. teorija', key: (m) => m.features.qrTheory },
  { label: 'Ekranas', key: (m) => m.features.screen },
  { label: 'Iracionalūs skaičiai', key: (m) => m.features.irrationalNumbers },
  { label: 'Integralų skaičiavimas', key: (m) => m.features.integrals },
  { label: 'Lygčių sprendimas', key: (m) => m.features.equations },
  { label: 'Vektorinis skaičiavimas', key: (m) => m.features.vectors },
  { label: 'Nelygybių sprendimas', key: (m) => m.features.inequalities },
  { label: 'Greitis', key: (m) => m.features.speed },
];

function BooleanCell({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
      <Check className="w-4 h-4" strokeWidth={2.5} />
    </span>
  ) : (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50 text-red-500 ring-1 ring-red-200">
      <X className="w-4 h-4" strokeWidth={2.5} />
    </span>
  );
}

function ComparisonTable({ model }: { model: CalculatorModel }) {
  const rows = [
    ...comparisonRows.map((row) => ({
      label: row.label,
      value: row.key(model),
    })),
    ...(model.features.otherLabel && model.features.other
      ? [{ label: model.features.otherLabel, value: model.features.other }]
      : []),
    { label: 'Kaina', value: model.price, isPrice: true },
  ];

  return (
    <div className="rounded-2xl ring-1 ring-slate-200 overflow-hidden divide-y divide-slate-200">
      {rows.map((row, i) => {
        const isBoolean = typeof row.value === 'boolean';
        const isPrice = 'isPrice' in row && row.isPrice;

        return (
          <div
            key={row.label}
            className={`flex items-start justify-between gap-3 px-3 py-3 sm:px-4 sm:py-3 ${
              i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
            }`}
          >
            <span
              className={`min-w-0 flex-1 text-sm leading-snug ${
                isPrice ? 'font-semibold text-slate-700' : 'text-slate-600'
              }`}
            >
              {row.label}
            </span>
            <div className="shrink-0 max-w-[48%] sm:max-w-[45%] text-right">
              {isBoolean ? (
                <BooleanCell value={row.value as boolean} />
              ) : (
                <span
                  className={`block text-sm leading-snug ${
                    isPrice ? 'font-bold text-lg sm:text-xl text-slate-900' : 'font-medium text-slate-800'
                  }`}
                >
                  {row.value as string}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ImageLightbox({ image, onClose }: { image: CalculatorImage; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Uždaryti nuotrauką"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={image.src}
        alt={image.alt}
        className="max-h-[90vh] max-w-[95vw] w-auto h-auto object-contain rounded-xl shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function Modal({ model, onClose }: { model: CalculatorModel; onClose: () => void }) {
  const [zoomedImage, setZoomedImage] = useState<CalculatorImage | null>(null);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 animate-scale-in"
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
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
                <Info className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{model.name}</h2>
                <p className="text-slate-500 mt-0.5">Spauskite nuotrauką, kad išdidintumėte</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {model.modalImages.map((image) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setZoomedImage(image)}
                  className="group flex flex-col text-left rounded-2xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden hover:ring-blue-300 hover:shadow-md transition-all"
                >
                  <div className="relative flex items-center justify-center min-h-[220px] max-h-[320px] p-3">
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="max-h-[280px] w-full object-contain"
                    />
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Didinti
                    </span>
                  </div>
                  <span className="px-3 pb-3 text-sm font-medium text-slate-600">{image.alt}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-2">Trumpai</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{model.summary}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-2">Rekomendacija</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{model.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {zoomedImage && <ImageLightbox image={zoomedImage} onClose={() => setZoomedImage(null)} />}
    </>
  );
}

export default function Calculators() {
  const [activeModel, setActiveModel] = useState<CalculatorModel | null>(null);
  const [checkoutModel, setCheckoutModel] = useState<CalculatorModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatus = searchParams.get('success')
    ? 'success'
    : searchParams.get('canceled')
      ? 'canceled'
      : null;

  useEffect(() => {
    if (!paymentStatus) return;
    const timer = setTimeout(() => setSearchParams({}, { replace: true }), 8000);
    return () => clearTimeout(timer);
  }, [paymentStatus, setSearchParams]);

  const handleOrder = (model: CalculatorModel) => {
    setError(null);
    setCheckoutModel(model);
  };

  return (
    <div className="min-h-[80vh] px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </Link>

        {paymentStatus === 'success' && (
          <div className="mb-8 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 px-5 py-4 text-emerald-800">
            <p className="font-semibold">Apmokėjimas sėkmingas!</p>
            <p className="mt-1 text-sm text-emerald-700">
              Ačiū už užsakymą. Netrukus susisieksime dėl pristatymo arba atsiėmimo.
            </p>
          </div>
        )}

        {paymentStatus === 'canceled' && (
          <div className="mb-8 rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-5 py-4 text-amber-800">
            <p className="font-semibold">Apmokėjimas atšauktas</p>
            <p className="mt-1 text-sm text-amber-700">
              Galite bandyti dar kartą, kai būsite pasiruošę.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 ring-1 ring-red-200 px-5 py-4 text-red-800">
            <p className="font-semibold">Klaida</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
            <Info className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">Skaičiuotuvų palyginimas</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl mb-3">
          Palyginkite du populiariausius skaičiuotuvus ir pasirinkite tinkamiausią.
        </p>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 mb-12">
          <Truck className="w-4 h-4" />
          Siuntimas nuo 0 € (atsiėmimas Telšiuose) arba +2 € (LP Express / paštas)
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {models.map((model) => (
            <div
              key={model.id}
              className="group flex flex-col rounded-3xl bg-white ring-1 ring-slate-200 shadow-sm hover:shadow-xl hover:ring-blue-200 transition-all duration-300 overflow-hidden"
            >
              <div className="p-4 sm:p-7">
                <button
                  onClick={() => setActiveModel(model)}
                  className="w-full text-left hover:bg-slate-50/50 transition-colors rounded-2xl"
                >
                  <div className="flex justify-center mb-6">
                    <div className="w-36 h-52 rounded-xl bg-slate-950/5 ring-1 ring-slate-200 overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={model.coverImage}
                        alt={model.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {model.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Spauskite, kad pamatytumėte daugiau informacijos
                  </p>
                </button>
                <p className="mt-2 text-sm text-slate-500">
                  <a
                    href={model.priceCompareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-blue-600 transition-colors"
                  >
                    Patikrinti kainas kitur
                  </a>{' '}
                  (įprastose parduotuvėse gaunate tik skaičiuotuvą be interaktyvaus gido ir 7-12 kl.
                  teorijos)
                </p>
              </div>

              <div className="px-4 pb-6 sm:px-7 sm:pb-7 flex flex-col flex-1">
                <ComparisonTable model={model} />

                <button
                  onClick={() => handleOrder(model)}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Užsakyti
                </button>
                <p className="mt-3 text-center text-sm text-slate-500">
                  Nemokamas atsiėmimas Telšiuose arba siuntimas +2 €
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModel && <Modal model={activeModel} onClose={() => setActiveModel(null)} />}

      {checkoutModel && (
        <CheckoutModal
          calculatorId={checkoutModel.id}
          calculatorName={checkoutModel.name}
          onClose={() => setCheckoutModel(null)}
          onError={(message) => {
            setError(message);
            setCheckoutModel(null);
          }}
        />
      )}
    </div>
  );
}
