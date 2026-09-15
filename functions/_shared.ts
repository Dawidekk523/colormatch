export const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const SEASON_IDS = ['spring', 'summer', 'autumn', 'winter'] as const;
export const SOURCES = ['photo', 'quiz'] as const;

/** UTC day key, so a rate-limit bucket rolls over at a predictable time. */
export const dayKey = (now = new Date()): string => now.toISOString().slice(0, 10);

/** Hex SHA-256. Used so raw IP addresses are never written to the database. */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Length-safe, value-independent comparison for signatures. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function isEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 254;
}
