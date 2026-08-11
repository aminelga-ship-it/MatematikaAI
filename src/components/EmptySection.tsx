import { ArrowLeft, Calculator, Link2 } from 'lucide-react';

type EmptySectionProps = {
  title: string;
  description: string;
  kind: 'calculators' | 'links';
  onBack: () => void;
};

const sectionDetails = {
  calculators: {
    icon: Calculator,
    iconBackground: 'bg-blue-50',
    iconColor: 'text-blue-600',
    iconRing: 'ring-blue-200',
    emptyTitle: 'Skaičiuotuvai dar neparengti',
    emptyDescription: 'Netrukus čia atsiras naudingi matematikos skaičiuotuvai.',
  },
  links: {
    icon: Link2,
    iconBackground: 'bg-violet-50',
    iconColor: 'text-violet-600',
    iconRing: 'ring-violet-200',
    emptyTitle: 'Naudingos nuorodos dar neparengtos',
    emptyDescription: 'Netrukus čia atsiras formulių lapai, egzaminai ir kiti ištekliai.',
  },
};

export default function EmptySection({ title, description, kind, onBack }: EmptySectionProps) {
  const details = sectionDetails[kind];
  const Icon = details.icon;

  return (
    <div className="min-h-[80vh] px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Grįžti į pradžią
        </button>

        <div className="flex items-center gap-4 mb-3">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${details.iconBackground} ${details.iconColor} ring-1 ${details.iconRing}`}>
            <Icon className="w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">{title}</h1>
        </div>
        <p className="text-slate-500 text-lg max-w-2xl">{description}</p>

        <div className="mt-16 flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white ring-1 ring-slate-200 shadow-sm">
            <Icon className="w-9 h-9 text-slate-300" />
          </div>
          <p className="mt-6 text-lg font-medium text-slate-400">{details.emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-400">{details.emptyDescription}</p>
        </div>
      </div>
    </div>
  );
}
