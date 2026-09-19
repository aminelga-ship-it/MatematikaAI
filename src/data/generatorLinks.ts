export type GeneratorLink = {
  id: string;
  title: string;
  comment: string;
  url: string;
  accent: string;
  glow: string;
  internal?: boolean;
};

export const generatorLinks: GeneratorLink[] = [
  {
    id: 'tasks',
    title: 'Užduočių generatorius',
    comment: 'Skirtas kasdieniam naudojimui',
    url: 'https://matematikos-generatorius.vercel.app/',
    accent: 'from-blue-600 to-blue-500',
    glow: 'group-hover:shadow-blue-500/30',
  },
  {
    id: 'exams',
    title: 'Egzaminų generatorius',
    comment: 'Skirtas kurti egzamines užduotis',
    url: 'https://egzamin-generatorius.vercel.app/',
    accent: 'from-violet-600 to-violet-500',
    glow: 'group-hover:shadow-violet-500/30',
  },
  {
    id: 'screenPen',
    title: 'Ekrano rašiklis',
    comment:
      'Windows programa pamokoms: piešimas ant ekrano, balta lenta ir kitos funkcijos.',
    url: '/ekrano-rasiklis',
    accent: 'from-sky-600 to-blue-600',
    glow: 'group-hover:shadow-sky-500/30',
    internal: true,
  },
];
