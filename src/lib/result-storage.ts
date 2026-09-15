import type { SeasonId, Undertone } from './seasons-data';

export interface StoredResult {
  season: SeasonId;
  undertone: Undertone;
  source: 'photo' | 'quiz';
  confidence: number;
}

const KEY = 'colormatch.result.v1';

const listeners = new Set<() => void>();
/**
 * The result is held in memory as well as in sessionStorage, so the app still
 * works in private windows where storage throws — it simply will not survive a
 * refresh there.
 */
let cached: string | null = null;
let loadedFromStorage = false;

function readStorage(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): StoredResult | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredResult>;
    if (!parsed || typeof parsed.season !== 'string') return null;
    if (!['spring', 'summer', 'autumn', 'winter'].includes(parsed.season)) return null;
    if (parsed.source !== 'photo' && parsed.source !== 'quiz') return null;
    return {
      season: parsed.season as SeasonId,
      undertone: (['warm', 'cool', 'neutral'] as const).includes(parsed.undertone as Undertone)
        ? (parsed.undertone as Undertone)
        : 'neutral',
      source: parsed.source,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
    };
  } catch {
    return null;
  }
}

const notify = () => listeners.forEach((listener) => listener());

export function subscribeResult(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Stable string snapshot, so React only re-renders when the result really changes. */
export function getResultSnapshot(): string | null {
  if (!loadedFromStorage) {
    cached = readStorage();
    loadedFromStorage = true;
  }
  return cached;
}

/** Nothing is known before hydration, which keeps the server and client markup identical. */
export const getServerResultSnapshot = (): string | null => null;

export function readResult(raw: string | null): StoredResult | null {
  return parse(raw);
}

/**
 * Only the outcome is kept, and only for the current tab. The photo itself is
 * never stored anywhere.
 */
export function saveResult(result: StoredResult): void {
  cached = JSON.stringify(result);
  loadedFromStorage = true;
  try {
    sessionStorage.setItem(KEY, cached);
  } catch {
    /* private mode — the in-memory copy still drives the screen */
  }
  notify();
}

export function clearResult(): void {
  cached = null;
  loadedFromStorage = true;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* nothing to clean up */
  }
  notify();
}

/** Test seam: forgets the in-memory copy so the next read goes back to storage. */
export function resetResultCache(): void {
  cached = null;
  loadedFromStorage = false;
}
