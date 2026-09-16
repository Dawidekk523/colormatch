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

export const UNDERTONES = ['warm', 'cool', 'neutral'] as const;

/**
 * 32 hex characters of real randomness. A result is readable by anyone holding
 * its token, so the token has to be unguessable rather than merely unique.
 */
export function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Counts one action against a visitor's daily budget and says whether it is
 * allowed. `scope` keeps separate budgets apart, so saving a result cannot use
 * up the allowance for recording an analysis.
 */
export async function consumeDailyBudget(
  db: D1Database,
  request: Request,
  scope: string,
  limit: number,
): Promise<boolean> {
  const day = dayKey();
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const visitor = await sha256Hex(`${scope}|${ip}|${day}`);
  const used = await db
    .prepare('SELECT count FROM rate_limits WHERE visitor_hash = ? AND day = ?')
    .bind(visitor, day)
    .first<{ count: number }>();
  if ((used?.count ?? 0) >= limit) return false;
  await db
    .prepare(
      `INSERT INTO rate_limits (visitor_hash, day, count) VALUES (?, ?, 1)
       ON CONFLICT(visitor_hash, day) DO UPDATE SET count = count + 1`,
    )
    .bind(visitor, day)
    .run();
  return true;
}
