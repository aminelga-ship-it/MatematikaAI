export type LockerCarrier = 'unisend' | 'omniva';

export type Locker = {
  id: string;
  code: string;
  city: string;
  name: string;
  address: string;
  comment: string;
};

type RawLocker = {
  owner?: string;
  name?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  location_note?: string;
  source_id?: string;
  is_active?: boolean;
  id?: string;
};

const SOURCE = 'https://www.pakomati.net/lockers.json';
const DAY_MS = 24 * 60 * 60 * 1000;

let cache: { expiresAt: number; byCarrier: Record<LockerCarrier, Record<string, Locker[]>> } | null = null;

export function isLockerCarrier(value: string | null): value is LockerCarrier {
  return value === 'unisend' || value === 'omniva';
}

export async function lockersByCity(carrier: LockerCarrier): Promise<Record<string, Locker[]>> {
  if (!cache || Date.now() >= cache.expiresAt) {
    cache = {
      expiresAt: Date.now() + DAY_MS,
      byCarrier: await loadLockers(),
    };
  }

  return cache.byCarrier[carrier];
}

async function loadLockers(): Promise<Record<LockerCarrier, Record<string, Locker[]>>> {
  const response = await fetch(SOURCE, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error('Failed to fetch lockers');
  }

  const data = (await response.json()) as { lockers?: RawLocker[] };
  const grouped: Record<LockerCarrier, Record<string, Locker[]>> = {
    unisend: {},
    omniva: {},
  };

  for (const locker of data.lockers ?? []) {
    if (locker.is_active === false) continue;
    if (locker.owner !== 'unisend' && locker.owner !== 'omniva') continue;

    const city = locker.city?.trim() ?? '';
    const street = locker.address?.trim() ?? '';
    if (!city || !street) continue;

    const postal = locker.postal_code?.trim() ?? '';
    const address = postal && !street.includes(postal) ? `${street}, ${postal}` : street;
    const name = locker.name?.trim() || address;
    const entry: Locker = {
      id: locker.id?.trim() || `${locker.owner}-${locker.source_id ?? address}`,
      code: locker.source_id?.trim() || postal,
      city,
      name,
      address,
      comment: locker.location_note?.trim() ?? '',
    };

    const list = grouped[locker.owner][city] ?? [];
    list.push(entry);
    grouped[locker.owner][city] = list;
  }

  for (const carrier of ['unisend', 'omniva'] as const) {
    for (const city of Object.keys(grouped[carrier])) {
      grouped[carrier][city].sort((a, b) => a.address.localeCompare(b.address, 'lv'));
    }
  }

  return grouped;
}
