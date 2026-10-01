import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAnalytics } from './_lib/analyticsHandler';

async function loadLocalEnvIfNeeded() {
  if (process.env.VERCEL) return;
  if (process.env.ANALYTICS_READ_KEY || process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    const { config } = await import('dotenv');
    config({ path: '.local.env', quiet: true });
  } catch {
    // Local env file is optional.
  }
}

function headerValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function requestBody(body: unknown): unknown {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as unknown;
    } catch {
      return null;
    }
  }
  if (Buffer.isBuffer(body)) {
    try {
      return JSON.parse(body.toString('utf8')) as unknown;
    } catch {
      return null;
    }
  }
  return body;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await loadLocalEnvIfNeeded();
    const result = await handleAnalytics({
      method: req.method,
      body: requestBody(req.body),
      key: headerValue(req.headers['x-analytics-key']),
      origin: headerValue(req.headers.origin),
    });

    res.setHeader('Cache-Control', 'no-store');
    if (result.body === undefined) return res.status(result.status).end();
    return res.status(result.status).json(result.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nežinoma klaida';
    return res.status(500).json({ error: 'server', message: message.slice(0, 300) });
  }
}
