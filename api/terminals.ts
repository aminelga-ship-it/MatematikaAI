import type { VercelRequest, VercelResponse } from '@vercel/node';

type PostTerminal = {
  id: string;
  code: string;
  name: string;
  comment: string;
  addressText: string;
  addressDetails: {
    settlementName: string;
  };
};

type Terminal = {
  id: string;
  code: string;
  city: string;
  name: string;
  address: string;
  comment: string;
};

let cachedTerminals: Record<string, Terminal[]> | null = null;
let cacheExpiresAt = 0;

async function fetchTerminals(): Promise<Record<string, Terminal[]>> {
  if (cachedTerminals && Date.now() < cacheExpiresAt) {
    return cachedTerminals;
  }

  const response = await fetch('https://post.lt/post/codes/search/getPlaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'types[]=PostTerminal&municipality=0',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch terminals');
  }

  const data = (await response.json()) as PostTerminal[];
  const grouped: Record<string, Terminal[]> = {};

  for (const terminal of data) {
    const city = terminal.addressDetails.settlementName.trim();
    const entry: Terminal = {
      id: terminal.id,
      code: terminal.code,
      city,
      name: terminal.name.trim(),
      address: terminal.addressText.trim(),
      comment: terminal.comment?.trim() ?? '',
    };

    if (!grouped[city]) {
      grouped[city] = [];
    }
    grouped[city].push(entry);
  }

  for (const city of Object.keys(grouped)) {
    grouped[city].sort((a, b) => a.address.localeCompare(b.address, 'lt'));
  }

  cachedTerminals = grouped;
  cacheExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

  return grouped;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const terminals = await fetchTerminals();
    return res.status(200).json({ terminals });
  } catch {
    return res.status(500).json({ error: 'Failed to load terminals' });
  }
}
