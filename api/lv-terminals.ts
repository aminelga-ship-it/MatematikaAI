import type { VercelRequest, VercelResponse } from '@vercel/node';
import lockers from '../src/data/lvLockers.json';
import { isLockerCarrier } from './_lib/lvLockers';

const file = lockers as {
  unisend: Record<string, unknown[]>;
  omniva: Record<string, unknown[]>;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const carrier = typeof req.query.carrier === 'string' ? req.query.carrier : '';
  if (!isLockerCarrier(carrier)) {
    return res.status(400).json({ error: 'Unknown carrier' });
  }

  return res.status(200).json({ terminals: file[carrier] });
}
