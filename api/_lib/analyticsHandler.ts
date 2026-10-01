import { timingSafeEqual } from 'node:crypto';
import { normalizeVisit, summarizeVisits } from './visitMath.js';
import { AnalyticsStorageError, analyticsStorageReady, readVisits, saveVisit } from './visitStore.js';

type AnalyticsResult = {
  status: number;
  body?: unknown;
};

function keysMatch(provided: string, expected: string): boolean {
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function readAccess(key: string | undefined): 'ok' | 'missing-key' | 'denied' {
  const expected = process.env.ANALYTICS_READ_KEY?.trim();
  if (!expected) {
    if (process.env.VERCEL === '1') return 'missing-key';
    return 'ok';
  }
  if (!key || !keysMatch(key, expected)) return 'denied';
  return 'ok';
}

function originAllowed(origin: string | undefined): boolean {
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function storageFailure(error: unknown): AnalyticsResult | null {
  if (error instanceof AnalyticsStorageError || !analyticsStorageReady()) {
    return {
      status: 503,
      body: {
        error: 'storage',
        message:
          'Duomenys dar nesaugomi. Vercel projekte prijunkite Blob saugyklą, kad atsirastų BLOB_READ_WRITE_TOKEN.',
      },
    };
  }
  return null;
}

export async function handleAnalytics(input: {
  method: string | undefined;
  body: unknown;
  key: string | undefined;
  origin: string | undefined;
}): Promise<AnalyticsResult> {
  if (!originAllowed(input.origin)) return { status: 403, body: { error: 'forbidden' } };

  if (input.method === 'GET') {
    const access = readAccess(input.key);
    if (access === 'missing-key') {
      return {
        status: 503,
        body: {
          error: 'missing-key',
          message: 'Nustatykite ANALYTICS_READ_KEY Vercel aplinkos kintamuosiuose ir įveskite jį čia.',
        },
      };
    }
    if (access === 'denied') return { status: 401, body: { error: 'denied' } };

    try {
      const summary = summarizeVisits(await readVisits());
      return { status: 200, body: summary };
    } catch (error) {
      const failure = storageFailure(error);
      if (failure) return failure;
      const message = error instanceof Error ? error.message : 'Nežinoma klaida';
      return { status: 500, body: { error: 'server', message: message.slice(0, 300) } };
    }
  }

  if (input.method === 'POST') {
    const snapshot = normalizeVisit(input.body);
    if (!snapshot) return { status: 400, body: { error: 'invalid' } };
    try {
      await saveVisit(snapshot);
      return { status: 204 };
    } catch (error) {
      const failure = storageFailure(error);
      if (failure) return failure;
      const message = error instanceof Error ? error.message : 'Nežinoma klaida';
      return { status: 500, body: { error: 'server', message: message.slice(0, 300) } };
    }
  }

  return { status: 405, body: { error: 'method' } };
}
