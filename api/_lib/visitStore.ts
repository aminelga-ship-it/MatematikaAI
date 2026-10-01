import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  BlobNotFoundError,
  BlobPreconditionFailedError,
  get,
  put,
} from '@vercel/blob';
import {
  capSessions,
  mergeVisit,
  type VisitRecord,
  type VisitSnapshot,
} from '../../src/lib/visitAnalytics';

const FILE_PATH = path.join(process.cwd(), '.data', 'visit-analytics.json');
const BLOB_PATH = 'analytics/visit-analytics.json';

type StoreFile = {
  sessions: Record<string, VisitRecord>;
};

type Stored = {
  data: StoreFile;
  etag?: string;
};

export class AnalyticsStorageError extends Error {
  constructor() {
    super('Analytics storage is not configured');
    this.name = 'AnalyticsStorageError';
  }
}

const emptyStore = (): StoreFile => ({ sessions: {} });

let writeQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function useLocalFile(): boolean {
  return process.env.VERCEL !== '1';
}

export function analyticsStorageReady(): boolean {
  return useLocalFile() || blobConfigured();
}

function parseStore(raw: string): StoreFile {
  try {
    const parsed = JSON.parse(raw) as StoreFile;
    if (!parsed || typeof parsed !== 'object' || !parsed.sessions || typeof parsed.sessions !== 'object') {
      return emptyStore();
    }
    return { sessions: parsed.sessions };
  } catch {
    return emptyStore();
  }
}

async function readFileStore(): Promise<Stored> {
  try {
    return { data: parseStore(await readFile(FILE_PATH, 'utf8')) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { data: emptyStore() };
    throw error;
  }
}

async function writeFileStore(data: StoreFile): Promise<void> {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  await writeFile(FILE_PATH, JSON.stringify(data));
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    total += value.length;
  }
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

async function readBlobStore(): Promise<Stored> {
  try {
    const result = await get(BLOB_PATH, { access: 'private', useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return { data: emptyStore() };
    return {
      data: parseStore(await streamToText(result.stream)),
      etag: result.blob.etag,
    };
  } catch (error) {
    if (error instanceof BlobNotFoundError) return { data: emptyStore() };
    throw error;
  }
}

async function writeBlobStore(data: StoreFile, etag?: string): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(data), {
    access: 'private',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

async function readStore(): Promise<Stored> {
  if (useLocalFile()) return readFileStore();
  if (!blobConfigured()) throw new AnalyticsStorageError();
  return readBlobStore();
}

async function writeStore(data: StoreFile, etag?: string): Promise<void> {
  if (useLocalFile()) {
    await writeFileStore(data);
    return;
  }
  if (!blobConfigured()) throw new AnalyticsStorageError();
  await writeBlobStore(data, etag);
}

export async function saveVisit(snapshot: VisitSnapshot): Promise<void> {
  await enqueue(async () => {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const current = await readStore();
      const sessions = capSessions({
        ...current.data.sessions,
        [snapshot.id]: mergeVisit(current.data.sessions[snapshot.id], snapshot, Date.now()),
      });
      try {
        await writeStore({ sessions }, current.etag);
        return;
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError && attempt < 3) continue;
        throw error;
      }
    }
  });
}

export async function readVisits(): Promise<VisitRecord[]> {
  const current = await readStore();
  return Object.values(current.data.sessions);
}
