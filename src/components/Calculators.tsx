import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, X, ShoppingCart, Info, ZoomIn } from 'lucide-react';
import CheckoutModal from '@/components/CheckoutModal';
import {
  calculatorModels,
  calculatorPageText,
  comparisonRows,
  findOrderModel,
  type CalculatorImage,
  type CalculatorModel,
  type CalculatorPageText,
  type ComparisonRow,
} from '@/data/calculatorCatalog';
import { noteCalculatorDetails, noteCheckoutClosed, noteCheckoutOpened } from '@/lib/visitTracking';
import type { Market } from '@/types/market';

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

function ComparisonTable({
  model,
  rows: featureRows,
  priceLabel,
}: {
  model: CalculatorModel;
  rows: ComparisonRow[];
  priceLabel: string;
}) {
  const rows = [
    ...featureRows.map((row) => ({
      label: row.label,
      value: row.key(model),
    })),
    ...(model.features.otherLabel && model.features.other
      ? [{ label: model.features.otherLabel, value: model.features.other }]
      : []),
    { label: priceLabel, value: model.price, isPrice: true },
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

function RecommendedBadge({ label }: { label: string }) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2"
      role="img"
      aria-label={label}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-1.5 text-xs font-bold tracking-wide text-white shadow-sm whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}

function ImageLightbox({
  image,
  closeLabel,
  onClose,
}: {
  image: CalculatorImage;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-slate-950/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        aria-label={closeLabel}
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

function Modal({
  model,
  text,
  onClose,
}: {
  model: CalculatorModel;
  text: CalculatorPageText;
  onClose: () => void;
}) {
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
            aria-label={text.close}
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
                <p className="text-slate-500 mt-0.5">{text.zoomHint}</p>
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
                      {text.zoom}
                    </span>
                  </div>
                  <span className="px-3 pb-3 text-sm font-medium text-slate-600">{image.alt}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-2">{text.briefly}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{model.summary}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-2">{text.recommendation}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{model.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {zoomedImage && (
        <ImageLightbox image={zoomedImage} closeLabel={text.closePhoto} onClose={() => setZoomedImage(null)} />
      )}
    </>
  );
}

export default function Calculators({ market = 'lt' }: { market?: Market }) {
  const text = calculatorPageText(market);
  const models = calculatorModels(market);
  const featureRows = comparisonRows(market);
  const [activeModel, setActiveModel] = useState<CalculatorModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const checkoutModel = findOrderModel(models, searchParams.get('uzsakyti'));

  useEffect(() => {
    if (market !== 'lv') return;
    const previous = document.documentElement.lang;
    document.documentElement.lang = 'lv';
    return () => {
      document.documentElement.lang = previous;
    };
  }, [market]);
  const paymentStatus = searchParams.get('success')
    ? 'success'
    : searchParams.get('canceled')
      ? 'canceled'
      : null;

  useEffect(() => {
    if (checkoutModel) noteCheckoutOpened();
    else noteCheckoutClosed();
  }, [checkoutModel]);

  useEffect(() => {
    if (!paymentStatus) return;
    const timer = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('success');
          next.delete('canceled');
          return next;
        },
        { replace: true },
      );
    }, 8000);
    return () => clearTimeout(timer);
  }, [paymentStatus, setSearchParams]);

  const handleOrder = (model: CalculatorModel) => {
    setError(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('success');
      next.delete('canceled');
      next.set('uzsakyti', model.id);
      return next;
    });
  };

  const closeCheckout = () => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('uzsakyti');
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className="min-h-[80vh] px-4 py-10 sm:px-6 sm:py-16">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          {text.back}
        </Link>

        {paymentStatus === 'success' && (
          <div className="mb-8 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 px-5 py-4 text-emerald-800">
            <p className="font-semibold">{text.successTitle}</p>
            <p className="mt-1 text-sm text-emerald-700">{text.successBody}</p>
          </div>
        )}

        {paymentStatus === 'canceled' && (
          <div className="mb-8 rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-5 py-4 text-amber-800">
            <p className="font-semibold">{text.canceledTitle}</p>
            <p className="mt-1 text-sm text-amber-700">{text.canceledBody}</p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-2xl bg-red-50 ring-1 ring-red-200 px-5 py-4 text-red-800">
            <p className="font-semibold">{text.errorTitle}</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-200">
            <Info className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-slate-900">{text.title}</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl mb-3">{text.subtitle}</p>

        <div className="grid md:grid-cols-2 gap-6 pt-3">
          {models.map((model) => (
            <div
              key={model.id}
              className={`group relative flex flex-col rounded-3xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${
                model.recommended
                  ? 'mt-2 ring-2 ring-blue-500 hover:ring-blue-600'
                  : 'ring-1 ring-slate-200 hover:ring-blue-200 overflow-hidden'
              }`}
            >
              {model.recommended && <RecommendedBadge label={text.recommended} />}
              <div className={`p-4 sm:p-7 ${model.recommended ? 'overflow-hidden rounded-3xl' : ''}`}>
                <button
                  onClick={() => {
                    noteCalculatorDetails();
                    setActiveModel(model);
                  }}
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
                  <p className="mt-2 text-sm text-slate-500">{text.moreInfo}</p>
                </button>
                <p className="mt-2 text-sm text-slate-500">
                  <a
                    href={model.priceCompareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-2 hover:text-blue-600 transition-colors"
                  >
                    {text.comparePrices}
                  </a>{' '}
                  {text.comparePricesNote}
                </p>
              </div>

              <div className="px-4 pb-6 sm:px-7 sm:pb-7 flex flex-col flex-1">
                <ComparisonTable model={model} rows={featureRows} priceLabel={text.price} />

                <button
                  onClick={() => handleOrder(model)}
                  className="mt-6 inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {text.order}
                </button>
                <p className="mt-3 text-center text-sm text-slate-500">{text.shippingNote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeModel && <Modal model={activeModel} text={text} onClose={() => setActiveModel(null)} />}

      {checkoutModel && (
        <CheckoutModal
          market={market}
          calculatorId={checkoutModel.id}
          calculatorName={checkoutModel.name}
          onClose={closeCheckout}
          onError={(message) => {
            setError(message);
            closeCheckout();
          }}
        />
      )}
    </div>
  );
}
