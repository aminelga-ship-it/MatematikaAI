export type ShippingMethod = 'pickup-telsiai' | 'lp-express' | 'post';

export type PostalAddress = {
  street: string;
  city: string;
  postalCode: string;
};

export const SHIPPING_OPTIONS: {
  id: ShippingMethod;
  label: string;
  priceEur: number;
  description: string;
}[] = [
  {
    id: 'pickup-telsiai',
    label: 'Atsiimti Telšiuose',
    priceEur: 0,
    description:
      'Su Jumis susisieksime netrukus dėl atsiėmimo, kai rinkinys bus paruoštas.',
  },
  {
    id: 'lp-express',
    label: 'Siųsti LP Express paštomatu',
    priceEur: 2,
    description: 'Pristatymas į pasirinktą LP Express paštomatą.',
  },
  {
    id: 'post',
    label: 'Siųsti paštu',
    priceEur: 2,
    description:
      'Gaunate į laiškų dėžutę (jei tilps) arba turėsite atsiimti siuntą pašto skyriuje pagal gautą pranešimą laiškų dėžutėje.',
  },
];

export const SHIPPING_METHOD_LABELS: Record<ShippingMethod, string> = {
  'pickup-telsiai': 'Atsiėmimas Telšiuose',
  'lp-express': 'LP Express paštomatas',
  post: 'Paštas',
};
