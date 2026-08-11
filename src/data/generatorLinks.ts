export type GeneratorLink = {
  id: string;
  title: string;
  comment: string;
  url: string;
  accent: string;
  glow: string;
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
];
