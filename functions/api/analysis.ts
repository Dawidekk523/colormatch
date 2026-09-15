import { dayKey, json, SEASON_IDS, sha256Hex, SOURCES } from '../_shared';

interface Body {
  season?: unknown;
  source?: unknown;
}

/**
 * Stores one anonymous row per analysis: which season came out and whether it
 * came from a photo or the quiz. No image, no text, no identifier that points
 * back at a person — the IP is only ever seen as a salted daily hash used to
 * cap how many rows one visitor can add.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }

  const season = body.season;
  const source = body.source;
  if (typeof season !== 'string' || !(SEASON_IDS as readonly string[]).includes(season)) {
    return json({ error: 'Unknown season.' }, 400);
  }
  if (typeof source !== 'string' || !(SOURCES as readonly string[]).includes(source)) {
    return json({ error: 'Unknown source.' }, 400);
  }

  if (!env.DB) {
    // The site is designed to work with no database attached at all.
    return json({ recorded: false, reason: 'storage-not-configured' });
  }

  const day = dayKey();
  const visitor = await sha256Hex(`${request.headers.get('cf-connecting-ip') ?? 'unknown'}|${day}`);
  const limit = Number.parseInt(env.ANALYSIS_DAILY_LIMIT ?? '50', 10) || 50;

  try {
    const used = await env.DB.prepare('SELECT count FROM rate_limits WHERE visitor_hash = ? AND day = ?')
      .bind(visitor, day)
      .first<{ count: number }>();

    if ((used?.count ?? 0) >= limit) {
      return json({ recorded: false, reason: 'daily-limit-reached' }, 429);
    }

    await env.DB.batch([
      env.DB.prepare('INSERT INTO analyses (season, source, day) VALUES (?, ?, ?)').bind(season, source, day),
      env.DB.prepare(
        `INSERT INTO rate_limits (visitor_hash, day, count) VALUES (?, ?, 1)
         ON CONFLICT(visitor_hash, day) DO UPDATE SET count = count + 1`,
      ).bind(visitor, day),
    ]);
  } catch {
    // Counting is never allowed to break the thing the visitor came for.
    return json({ recorded: false, reason: 'storage-unavailable' });
  }

  return json({ recorded: true });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return json({ totals: [] });
  try {
    const { results } = await env.DB.prepare(
      'SELECT season, COUNT(*) AS total FROM analyses GROUP BY season ORDER BY season',
    ).all();
    return json({ totals: results ?? [] });
  } catch {
    return json({ totals: [] });
  }
};
