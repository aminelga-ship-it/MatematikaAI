import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isLockerCarrier, lockersByCity } from './_lib/lvLockers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const carrier = typeof req.query.carrier === 'string' ? req.query.carrier : '';
  if (!isLockerCarrier(carrier)) {
    return res.status(400).json({ error: 'Unknown carrier' });
  }

  try {
    const terminals = await lockersByCity(carrier);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json({ terminals });
  } catch {
    return res.status(500).json({ error: 'Neizdevās ielādēt pakomātus' });
  }
}
