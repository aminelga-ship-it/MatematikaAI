export type Tutor = {
  id: string;
  name: string;
  price: string;
  photo: string;
  shortDescription: string;
  intro: string;
  highlights: string[];
  facebookUrl: string;
  facebookLabel: string;
};

export const tutors: Tutor[] = [
  {
    id: 'tutor-1',
    name: 'Artūras Minelga',
    price: 'Nuo 25 Eur',
    photo: '/images/arturas.jpg',
    shortDescription: 'Individualios matematikos pamokos 5–12 kl. mokiniams. 12 metų patirtis.',
    intro: 'Individualios matematikos pamokos 5-12 kl. moksleiviams:',
    highlights: [
      'professionaliai - 12 metų patirtis, pedagoginis išsilavinimas, darbas gimnazijoje.',
      'aiškiai - medžiaga pateikiama kaip paprastam žmogui, ne mokytojui.',
      'lanksčiai - nereikia pirkti jokių narysčių ar mokėti už mėnesį į priekį, taigi, niekuo nerizikuojate.',
      'kūrybiškai - gyvenimiški pavyzdžiai, naudojami inovatyvūs metodai.',
      'individualiai - pritaikomas mokymosi būdas ir skiriamas dėmesys tik Jums.',
    ],
    facebookUrl: 'https://www.facebook.com/matematikos.korepetitorius.arturas',
    facebookLabel: 'Matematikos korepetitorius Artūras',
  },
];

export const GRADE_OPTIONS = ['5 kl.', '6 kl.', '7 kl.', '8 kl.', '9 kl.', '10 kl.', '11 kl.', '12 kl.'] as const;

export const CONTACT_EMAIL = 'a.minelga@gmail.com';
