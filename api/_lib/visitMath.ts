export const QUICK_EXIT_MS = 3000;
export const MAX_DURATION_MS = 4 * 60 * 60 * 1000;
export const MAX_SESSIONS = 5000;

export const SECTION_LABELS = [
  'Pagrindinis',
  'Korepetitoriai',
  'Ekrano rašiklis',
  'Naudingos nuorodos',
] as const;

export type SectionLabel = (typeof SECTION_LABELS)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type VisitSnapshot = {
  id: string;
  durationMs: number;
  openedCalculator: boolean;
  closedModalAndBrowsed: boolean;
  leftForPayment: boolean;
  otherSections: SectionLabel[];
};

export type VisitRecord = VisitSnapshot & {
  updatedAt: number;
};

export type VisitSummary = {
  calculatorOpens: number;
  quickExits: number;
  closedModalAndBrowsed: number;
  otherSectionVisitors: number;
  sections: { label: SectionLabel; count: number }[];
  averageDurationMs: number;
  medianDurationMs: number;
  averageStayDurationMs: number;
};

export function isQuickExit(visit: VisitSnapshot): boolean {
  return (
    visit.openedCalculator &&
    visit.durationMs < QUICK_EXIT_MS &&
    !visit.leftForPayment &&
    !visit.closedModalAndBrowsed
  );
}

function isSectionLabel(value: string): value is SectionLabel {
  return (SECTION_LABELS as readonly string[]).includes(value);
}

export function normalizeVisit(input: unknown): VisitSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const body = input as Record<string, unknown>;
  if (typeof body.id !== 'string' || !UUID_PATTERN.test(body.id)) return null;
  if (typeof body.durationMs !== 'number' || !Number.isFinite(body.durationMs)) return null;
  const durationMs = Math.round(body.durationMs);
  if (durationMs < 0 || durationMs > MAX_DURATION_MS) return null;
  if (!Array.isArray(body.otherSections) || body.otherSections.length > SECTION_LABELS.length) {
    return null;
  }

  const otherSections: SectionLabel[] = [];
  for (const section of body.otherSections) {
    if (typeof section !== 'string' || !isSectionLabel(section)) return null;
    if (!otherSections.includes(section)) otherSections.push(section);
  }

  return {
    id: body.id.toLowerCase(),
    durationMs,
    openedCalculator: body.openedCalculator === true,
    closedModalAndBrowsed: body.closedModalAndBrowsed === true,
    leftForPayment: body.leftForPayment === true,
    otherSections,
  };
}

export function mergeVisit(
  previous: VisitRecord | undefined,
  incoming: VisitSnapshot,
  now: number,
): VisitRecord {
  if (!previous) return { ...incoming, updatedAt: now };
  const otherSections = [...previous.otherSections];
  for (const section of incoming.otherSections) {
    if (!otherSections.includes(section)) otherSections.push(section);
  }
  return {
    id: previous.id,
    durationMs: Math.max(previous.durationMs, incoming.durationMs),
    openedCalculator: previous.openedCalculator || incoming.openedCalculator,
    closedModalAndBrowsed: previous.closedModalAndBrowsed || incoming.closedModalAndBrowsed,
    leftForPayment: previous.leftForPayment || incoming.leftForPayment,
    otherSections,
    updatedAt: now,
  };
}

export function capSessions(sessions: Record<string, VisitRecord>): Record<string, VisitRecord> {
  const records = Object.values(sessions);
  if (records.length <= MAX_SESSIONS) return sessions;
  records.sort((a, b) => a.updatedAt - b.updatedAt);
  return Object.fromEntries(records.slice(records.length - MAX_SESSIONS).map((record) => [record.id, record]));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2;
  return sorted[middle];
}

export function summarizeVisits(records: VisitRecord[]): VisitSummary {
  const calculator = records.filter((record) => record.openedCalculator);
  const stayed = calculator.filter((record) => !isQuickExit(record));
  const durations = calculator.map((record) => record.durationMs);
  const stayDurations = stayed.map((record) => record.durationMs);
  const sectionCounts = new Map<SectionLabel, number>();

  for (const record of calculator) {
    for (const section of record.otherSections) {
      sectionCounts.set(section, (sectionCounts.get(section) ?? 0) + 1);
    }
  }

  const sections = [...sectionCounts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'lt'));

  return {
    calculatorOpens: calculator.length,
    quickExits: calculator.filter((record) => isQuickExit(record)).length,
    closedModalAndBrowsed: calculator.filter((record) => record.closedModalAndBrowsed).length,
    otherSectionVisitors: calculator.filter((record) => record.otherSections.length > 0).length,
    sections,
    averageDurationMs: average(durations),
    medianDurationMs: median(durations),
    averageStayDurationMs: average(stayDurations),
  };
}
