import type { Market } from '@/types/market';

export type CalculatorImage = {
  src: string;
  alt: string;
};

export type CalculatorModel = {
  id: string;
  name: string;
  price: string;
  coverImage: string;
  priceCompareUrl: string;
  summary: string;
  recommendation: string;
  recommended?: boolean;
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

export type ComparisonRow = {
  label: string;
  key: (model: CalculatorModel) => string | boolean;
};

export type CalculatorPageText = {
  back: string;
  successTitle: string;
  successBody: string;
  canceledTitle: string;
  canceledBody: string;
  errorTitle: string;
  title: string;
  subtitle: string;
  recommended: string;
  close: string;
  closePhoto: string;
  zoomHint: string;
  zoom: string;
  briefly: string;
  recommendation: string;
  moreInfo: string;
  comparePrices: string;
  comparePricesNote: string;
  order: string;
  shippingNote: string;
  price: string;
};

const ltModels: CalculatorModel[] = [
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
    recommended: true,
    coverImage: '/images/EX.png',
    priceCompareUrl:
      'https://www.kainos.lt/skaiciuotuvai/casio-calculator-fx-991cex-v1696547?gad_source=1&gad_campaignid=6443829327&gbraid=0AAAAADlYnfMaLZHINV2Bt-k1jU15_-FfZ&gclid=Cj0KCQjwkOvTBhDgARIsAKUNyRvrA7U-zkb3cGzGeU27GdMUzSVEfp5yPd2DPF56oszMUv_dZHi-rWEaAmv1EALw_wcB',
    summary: 'Tai yra pats geriausias ir galingiausias leidžiamas skaičiuotuvas mokykloje',
    recommendation: 'Rekomenduojamas tiems, kam sutaupyti 5 Eur nėra reikšminga',
    modalImages: [
      { src: '/images/EX_meniu.png', alt: 'Meniu' },
      { src: '/images/EX_gidas.png', alt: 'Gidas' },
      { src: '/images/Teorija.png', alt: 'Teorija' },
      { src: '/images/EX_deze.png', alt: 'Su dėžute' },
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

const lvModels: CalculatorModel[] = [
  {
    id: 'fx-991-es',
    name: 'FX-991 ES 2nd edition',
    price: '24,99€',
    coverImage: '/images/ES.png',
    priceCompareUrl: 'https://www.kurpirkt.lv/cena.php?q=casio+fx+991es',
    summary:
      'Kalkulatoram būtībā ir visas skolā vajadzīgās funkcijas, izņemot nevienādību risināšanu. Zemākas cenas galvenais iemesls ir nedaudz vājāks procesors (tāpēc ļoti sarežģītus aprēķinus tas veic ar 5–10 sekunžu aizturi) un vienkāršāks ekrāns.',
    recommendation: 'Ieteicams tiem, kas vēlas ietaupīt, jo saņemat aptuveni 99% funkciju par zemāku cenu',
    modalImages: [
      { src: '/images/ES_meniu.png', alt: 'Izvēlne' },
      { src: '/images/ES_gidas.png', alt: 'Gids' },
    ],
    features: {
      qrInstructions: true,
      qrTheory: false,
      screen: 'Skaidrs',
      irrationalNumbers: true,
      integrals: true,
      equations: true,
      vectors: true,
      inequalities: false,
      speed: 'Ļoti sarežģītos uzdevumos ir 5–10 sekunžu aizture',
      otherLabel: null,
      other: null,
    },
  },
  {
    id: 'fx-991-ex',
    name: 'FX-991 EX ClassWiz',
    price: '29,99€',
    recommended: true,
    coverImage: '/images/EX.png',
    priceCompareUrl: 'https://www.kurpirkt.lv/cena.php?q=casio+fx+991+x',
    summary: 'Jaudīgākais no šiem diviem kalkulatoriem — ar ātrāku darbību, labāku ekrānu un nevienādību risināšanu.',
    recommendation: 'Ieteicams tiem, kam ietaupīt 5 eiro nav būtiski',
    modalImages: [
      { src: '/images/EX_meniu.png', alt: 'Izvēlne' },
      { src: '/images/EX_gidas_lv.png', alt: 'Gids' },
      { src: '/images/EX_deze.png', alt: 'Ar kastīti' },
    ],
    features: {
      qrInstructions: true,
      qrTheory: false,
      screen: 'Mūsdienīgs',
      irrationalNumbers: true,
      integrals: true,
      equations: true,
      vectors: true,
      inequalities: true,
      speed: 'Ātrs',
      otherLabel: 'Citi ieguvumi',
      other:
        'Var noteikt parabolas virsotnes koordinātas, proporciju aprēķināšana, pilnīgāki izvēlnes nosaukumi, augstākas izšķirtspējas ekrāns',
    },
  },
];

const ltRows: ComparisonRow[] = [
  { label: 'QR kodas su instrukcijomis moksleiviams', key: (model) => model.features.qrInstructions },
  { label: 'QR kodas su 7–12 kl. teorija', key: (model) => model.features.qrTheory },
  { label: 'Ekranas', key: (model) => model.features.screen },
  { label: 'Iracionalūs skaičiai', key: (model) => model.features.irrationalNumbers },
  { label: 'Integralų skaičiavimas', key: (model) => model.features.integrals },
  { label: 'Lygčių sprendimas', key: (model) => model.features.equations },
  { label: 'Vektorinis skaičiavimas', key: (model) => model.features.vectors },
  { label: 'Nelygybių sprendimas', key: (model) => model.features.inequalities },
  { label: 'Greitis', key: (model) => model.features.speed },
];

const lvRows: ComparisonRow[] = [
  { label: 'QR kods ar instrukcijām skolēniem', key: (model) => model.features.qrInstructions },
  { label: 'Ekrāns', key: (model) => model.features.screen },
  { label: 'Iracionāli skaitļi', key: (model) => model.features.irrationalNumbers },
  { label: 'Integrāļu aprēķināšana', key: (model) => model.features.integrals },
  { label: 'Vienādojumu risināšana', key: (model) => model.features.equations },
  { label: 'Vektoru aprēķināšana', key: (model) => model.features.vectors },
  { label: 'Nevienādību risināšana', key: (model) => model.features.inequalities },
  { label: 'Ātrums', key: (model) => model.features.speed },
];

const pageText: Record<Market, CalculatorPageText> = {
  lt: {
    back: 'Grįžti į pradžią',
    successTitle: 'Apmokėjimas sėkmingas!',
    successBody: 'Ačiū už užsakymą. Netrukus susisieksime dėl pristatymo arba atsiėmimo.',
    canceledTitle: 'Apmokėjimas atšauktas',
    canceledBody: 'Galite bandyti dar kartą, kai būsite pasiruošę.',
    errorTitle: 'Klaida',
    title: 'Skaičiuotuvų palyginimas',
    subtitle: 'Palyginkite du populiariausius skaičiuotuvus ir pasirinkite tinkamiausią.',
    recommended: 'Rekomenduojamas',
    close: 'Uždaryti',
    closePhoto: 'Uždaryti nuotrauką',
    zoomHint: 'Spauskite nuotrauką, kad išdidintumėte',
    zoom: 'Didinti',
    briefly: 'Trumpai',
    recommendation: 'Rekomendacija',
    moreInfo: 'Spauskite, kad pamatytumėte daugiau informacijos',
    comparePrices: 'Patikrinti kainas kitur',
    comparePricesNote:
      '(įprastose parduotuvėse gaunate tik skaičiuotuvą be interaktyvaus gido ir 7-12 kl. teorijos)',
    order: 'Užsakyti',
    shippingNote: 'Nemokamas atsiėmimas Telšiuose; siuntimas +2 € (nuo 3 vnt. – nemokamai)',
    price: 'Kaina',
  },
  lv: {
    back: 'Atpakaļ uz sākumu',
    successTitle: 'Maksājums veiksmīgs!',
    successBody: 'Paldies par pasūtījumu. Drīz sazināsimies par piegādi.',
    canceledTitle: 'Maksājums atcelts',
    canceledBody: 'Varat mēģināt vēlreiz, kad būsiet gatavi.',
    errorTitle: 'Kļūda',
    title: 'Kalkulatoru salīdzinājums',
    subtitle: 'Salīdziniet divus populārākos kalkulatorus un izvēlieties piemērotāko.',
    recommended: 'Ieteicams',
    close: 'Aizvērt',
    closePhoto: 'Aizvērt fotoattēlu',
    zoomHint: 'Noklikšķiniet uz fotoattēla, lai to palielinātu',
    zoom: 'Palielināt',
    briefly: 'Īsumā',
    recommendation: 'Ieteikums',
    moreInfo: 'Noklikšķiniet, lai redzētu vairāk informācijas',
    comparePrices: 'Pārbaudīt cenas citur',
    comparePricesNote: '(parastajos veikalos saņemat tikai kalkulatoru bez interaktīvā gida)',
    order: 'Pasūtīt',
    shippingNote: 'Piegāde +2 € (no 3 gab. — bez maksas)',
    price: 'Cena',
  },
};

export function calculatorModels(market: Market): CalculatorModel[] {
  return market === 'lv' ? lvModels : ltModels;
}

export function comparisonRows(market: Market): ComparisonRow[] {
  return market === 'lv' ? lvRows : ltRows;
}

export function calculatorPageText(market: Market): CalculatorPageText {
  return pageText[market];
}

export function findOrderModel(catalog: CalculatorModel[], value: string | null): CalculatorModel | null {
  if (value === null) return null;
  const key = value.trim().toLowerCase();
  if (key === '' || key === '1' || key === 'rekomenduojamas') {
    return catalog.find((model) => model.recommended) ?? catalog[0] ?? null;
  }
  if (key === 'ex') return catalog.find((model) => model.id === 'fx-991-ex') ?? null;
  if (key === 'es') return catalog.find((model) => model.id === 'fx-991-es') ?? null;
  return catalog.find((model) => model.id === key) ?? null;
}
