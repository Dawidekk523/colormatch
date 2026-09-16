import { json } from '../../_shared';

interface Row {
  season: string;
  undertone: string;
  source: string;
  confidence: number;
  palette_json: string | null;
  paid_at: string | null;
}

/**
 * Reopens a parked result — from the success page, or from the link in the
 * receipt email on another device. The season itself is not a secret (the
 * visitor's own browser worked it out), so it comes back either way; what the
 * payment unlocks is the card, which is only served once `paid_at` is set.
 */
export const onRequestGet: PagesFunction<Env, 'token'> = async ({ params, env }) => {
  const token = String(params.token ?? '');
  if (!/^[0-9a-f]{32}$/.test(token)) return json({ found: false }, 404);

  if (!env.DB) return json({ found: false, reason: 'storage-not-configured' }, 503);

  let row: Row | null;
  try {
    row = await env.DB.prepare(
      'SELECT season, undertone, source, confidence, palette_json, paid_at FROM results WHERE token = ?',
    )
      .bind(token)
      .first<Row>();
  } catch {
    return json({ found: false, reason: 'storage-unavailable' }, 503);
  }

  if (!row) return json({ found: false }, 404);

  const paid = Boolean(row.paid_at);
  let card: unknown = null;
  if (paid && row.palette_json) {
    try {
      card = JSON.parse(row.palette_json);
    } catch {
      card = null;
    }
  }

  return json({
    found: true,
    paid,
    result: {
      season: row.season,
      undertone: row.undertone,
      source: row.source,
      confidence: row.confidence,
    },
    card,
  });
};
