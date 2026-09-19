import { Link } from 'react-router-dom';
import {
  FileText,
  GraduationCap,
  Calculator,
  Users,
  Link2,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Pi,
  Sigma,
  FunctionSquare,
  PenTool,
} from 'lucide-react';
import { generatorLinks } from '@/data/generatorLinks';

type HomeProps = {
  onNavigate: (page: string) => void;
};

const generatorIcons = {
  tasks: FileText,
  exams: GraduationCap,
  screenPen: PenTool,
} as const;

const sections = [
  {
    icon: Calculator,
    title: 'Skaičiuotuvai',
    description: 'Geriausi mokytojų atrinkti ir egzaminuose leidžiami skaičiuotuvai.',
    accent: 'blue',
    badge: 'Įsigykite čia',
    action: 'calculators',
    href: '/skaiciuotuvai',
  },
  {
    icon: Users,
    title: 'Matematikos korepetitoriai',
    description: 'Susipažinkite su mūsų korepetitoriumi, jo siūlomomis paslaugomis ir kainomis.',
    accent: 'violet',
    badge: null,
    action: 'tutors',
    href: '/korepetitoriai',
  },
  {
    icon: Link2,
    title: 'Naudingos nuorodos',
    description: 'Formulių lapai, egzaminų pavyzdžiai, mokymosi priemonės ir kiti naudingi ištekliai.',
    accent: 'violet',
    badge: null,
    action: 'links',
    href: null,
  },
];

const accentMap: Record<string, { bg: string; text: string; ring: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-200',
    hover: 'group-hover:bg-blue-600 group-hover:text-white',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'ring-violet-200',
    hover: 'group-hover:bg-violet-500 group-hover:text-white',
  },
};

const floatingSymbols = [
  { Icon: Pi, className: 'top-[12%] left-[8%] text-blue-200', size: 64, delay: '0s' },
  { Icon: Sigma, className: 'top-[22%] right-[10%] text-emerald-200', size: 56, delay: '1.5s' },
  { Icon: FunctionSquare, className: 'bottom-[18%] left-[14%] text-violet-200', size: 52, delay: '0.8s' },
  { Icon: Pi, className: 'bottom-[12%] right-[16%] text-amber-200', size: 48, delay: '2.2s' },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center px-6 py-20">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.12),transparent_55%)]" />

        {/* Floating math symbols */}
        {floatingSymbols.map(({ Icon, className, size, delay }, i) => (
          <div
            key={i}
            className={`pointer-events-none absolute ${className} animate-pulse-slow`}
            style={{ animationDelay: delay }}
          >
            <Icon size={size} strokeWidth={1.2} />
          </div>
        ))}

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/80 backdrop-blur ring-1 ring-slate-200 shadow-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">
              Tavo matematikos pagalbininkas
            </span>
          </div>

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Matematika
            <span className="block mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 bg-clip-text text-transparent">
              mokiniams ir mokytojams
            </span>
          </h1>

          <p className="mt-8 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Viskas, ko reikia matematikos mokymuisi ir mokymui — užduotys,
            egzaminai, skaičiuotuvai ir korepetitoriai vienoje vietoje.
          </p>

          {/* Generator buttons */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {generatorLinks.map(({ id, title, comment, url, accent, glow, internal }) => {
              const Icon = generatorIcons[id as keyof typeof generatorIcons];
              const cardClassName =
                'group relative flex flex-col items-start gap-3 p-6 text-left rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm hover:-translate-y-1 hover:shadow-xl hover:ring-slate-300 transition-all duration-300 h-full';
              const cardContent = (
                <>
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg ${glow} transition-shadow duration-300`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{comment}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 group-hover:text-slate-800 transition-colors">
                    Atidaryti
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </>
              );

              if (internal) {
                return (
                  <Link key={id} to={url} className={cardClassName}>
                    {cardContent}
                  </Link>
                );
              }

              return (
                <a
                  key={id}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className={cardClassName}
                >
                  {cardContent}
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-slate-50 to-transparent" />
      </section>

      {/* Sections grid */}
      <section className="relative px-6 pb-24 -mt-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {sections.map((s) => {
              const a = accentMap[s.accent];
              const Icon = s.icon;
              const clickable = s.action !== null;
              const cardClassName = `group text-left p-7 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm transition-all duration-300 ${
                clickable
                  ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer'
                  : 'cursor-default'
              }`;
              const cardContent = (
                <>
                  <div
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl ${a.bg} ${a.text} ring-1 ${a.ring} transition-colors duration-300 ${a.hover}`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <h3 className="text-xl font-semibold text-slate-800">{s.title}</h3>
                    {s.badge && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                    {s.description}
                  </p>
                  {clickable && (
                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                      Atidaryti
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  )}
                </>
              );

              if (s.href) {
                return (
                  <Link key={s.title} to={s.href} className={cardClassName}>
                    {cardContent}
                  </Link>
                );
              }

              return (
                <button
                  key={s.title}
                  onClick={() => clickable && s.action && onNavigate(s.action)}
                  className={cardClassName}
                >
                  {cardContent}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
