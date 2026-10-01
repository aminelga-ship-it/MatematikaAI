import { SECTION_LABELS, type SectionLabel } from '@/lib/visitAnalytics';

const STORAGE_KEY = 'mai_visit_v1';
const LISTENER_FLAG = '__maiVisitTracking';
const BROWSE_AFTER_CLOSE_MS = 5000;
const HEARTBEAT_MS = 15000;

type PersistedVisit = {
  id: string;
  visibleMs: number;
  openedCalculator: boolean;
  modalOpened: boolean;
  modalClosed: boolean;
  closedModalAndBrowsed: boolean;
  browsePending: boolean;
  leftForPayment: boolean;
  otherSections: SectionLabel[];
};

let visibleSince: number | null = null;
let browseTimer: number | undefined;
let heartbeat: number | undefined;

function isStatsPath(pathname: string): boolean {
  return pathname === '/statistika' || pathname.startsWith('/statistika/');
}

function isCalculatorPath(pathname: string): boolean {
  return pathname === '/skaiciuotuvai' || pathname.startsWith('/skaiciuotuvai/');
}

function sectionForPath(pathname: string): SectionLabel | null {
  if (pathname === '/') return 'Pagrindinis';
  if (pathname === '/korepetitoriai' || pathname.startsWith('/korepetitoriai/')) return 'Korepetitoriai';
  if (pathname === '/ekrano-rasiklis' || pathname.startsWith('/ekrano-rasiklis/')) return 'Ekrano rašiklis';
  return null;
}

function emptyVisit(): PersistedVisit {
  return {
    id: crypto.randomUUID(),
    visibleMs: 0,
    openedCalculator: false,
    modalOpened: false,
    modalClosed: false,
    closedModalAndBrowsed: false,
    browsePending: false,
    leftForPayment: false,
    otherSections: [],
  };
}

function hasVisit(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

function load(): PersistedVisit {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const created = emptyVisit();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(created));
      return created;
    }
    const parsed = JSON.parse(raw) as PersistedVisit;
    if (!parsed || typeof parsed.id !== 'string') {
      const created = emptyVisit();
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(created));
      return created;
    }
    return {
      ...emptyVisit(),
      ...parsed,
      otherSections: Array.isArray(parsed.otherSections) ? parsed.otherSections : [],
    };
  } catch {
    const created = emptyVisit();
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(created));
    return created;
  }
}

function save(visit: PersistedVisit) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visit));
}

function elapsed(visit: PersistedVisit): number {
  const running = visibleSince === null ? 0 : Date.now() - visibleSince;
  return visit.visibleMs + running;
}

function pause(visit: PersistedVisit): PersistedVisit {
  if (visibleSince === null) return visit;
  const next = { ...visit, visibleMs: visit.visibleMs + (Date.now() - visibleSince) };
  visibleSince = null;
  return next;
}

function resume() {
  if (document.visibilityState !== 'visible' || isStatsPath(window.location.pathname)) return;
  if (visibleSince === null) visibleSince = Date.now();
}

function flush(beacon: boolean) {
  if (!hasVisit() || isStatsPath(window.location.pathname)) return;
  const visit = load();
  const body = JSON.stringify({
    id: visit.id,
    durationMs: Math.max(0, Math.round(elapsed(visit))),
    openedCalculator: visit.openedCalculator,
    closedModalAndBrowsed: visit.closedModalAndBrowsed,
    leftForPayment: visit.leftForPayment,
    otherSections: visit.otherSections,
  });

  if (beacon && typeof navigator.sendBeacon === 'function') {
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }));
    return;
  }

  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined);
}

function markBrowsed() {
  if (!hasVisit()) return;
  const visit = load();
  if (!visit.modalClosed || visit.closedModalAndBrowsed) return;
  save({ ...visit, closedModalAndBrowsed: true, browsePending: false });
  flush(false);
}

function armBrowseTimer() {
  if (browseTimer !== undefined) window.clearTimeout(browseTimer);
  browseTimer = window.setTimeout(() => {
    browseTimer = undefined;
    if (isCalculatorPath(window.location.pathname) && document.visibilityState === 'visible') {
      markBrowsed();
    }
  }, BROWSE_AFTER_CLOSE_MS);
}

function onHidden() {
  if (!hasVisit()) return;
  save(pause(load()));
  flush(true);
}

function onVisible() {
  resume();
  if (!hasVisit()) return;
  const visit = load();
  if (visit.browsePending && visit.modalClosed && !visit.closedModalAndBrowsed) armBrowseTimer();
}

function ensureListeners() {
  const marked = window as Window & { [LISTENER_FLAG]?: boolean };
  if (marked[LISTENER_FLAG]) return;
  marked[LISTENER_FLAG] = true;

  heartbeat = window.setInterval(() => {
    if (document.visibilityState === 'visible') flush(false);
  }, HEARTBEAT_MS);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHidden();
    else onVisible();
  });
  window.addEventListener('pagehide', onHidden);
}

export function startVisitTracking() {
  ensureListeners();
  if (isStatsPath(window.location.pathname)) return;
  resume();
  trackPath(window.location.pathname);
}

export function trackPath(pathname: string) {
  if (isStatsPath(pathname)) return;
  ensureListeners();
  const visit = load();
  if (isCalculatorPath(pathname)) {
    if (visit.openedCalculator) return;
    save({ ...visit, openedCalculator: true });
    flush(false);
    return;
  }

  const section = sectionForPath(pathname);
  if (!section || visit.otherSections.includes(section)) return;
  save({ ...visit, otherSections: [...visit.otherSections, section] });
  flush(false);
}

export function trackOtherSection(label: string) {
  if (!(SECTION_LABELS as readonly string[]).includes(label)) return;
  const section = label as SectionLabel;
  ensureListeners();
  const visit = load();
  if (visit.otherSections.includes(section)) return;
  save({ ...visit, otherSections: [...visit.otherSections, section] });
  flush(false);
}

export function noteCheckoutOpened() {
  ensureListeners();
  const visit = load();
  if (visit.modalOpened && visit.openedCalculator) return;
  save({ ...visit, modalOpened: true, openedCalculator: true });
  flush(false);
}

export function noteCheckoutClosed() {
  if (!hasVisit()) return;
  const visit = load();
  if (!visit.modalOpened || visit.modalClosed) return;
  save({ ...visit, modalClosed: true, browsePending: true });
  armBrowseTimer();
  flush(false);
}

export function noteCalculatorDetails() {
  markBrowsed();
}

export function noteLeftForPayment() {
  try {
    ensureListeners();
    const visit = pause(load());
    save({ ...visit, leftForPayment: true, openedCalculator: true });
    flush(true);
  } catch {
    // Jei sekimas nepavyksta, apmokėjimas vis tiek turi prasidėti.
  }
}
