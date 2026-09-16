import { consumeDailyBudget, json, randomToken, SEASON_IDS, SOURCES, UNDERTONES } from '../../_shared';

interface Body {
  season?: unknown;
  undertone?: unknown;
  source?: unknown;
  confidence?: unknown;
  card?: unknown;
}

/**
 * The browser already holds the palette, so it sends the finished card with the
 * result and the server just keeps it. Freezing it here is the point: a card
 * someone bought should not change if the palettes are later revised. It is
 * only ever handed back to whoever holds the token, and only after payment.
 */
const MAX_CARD_BYTES = 8000;

function cardJson(value: unknown): string | null {
  if (!value || typeof value !== 'object') return null;
  const serialised = JSON.stringify(value);
  return serialised.length <= MAX_CARD_BYTES ? serialised : null;
}

const oneOf = (value: unknown, allowed: readonly string[]): value is string =>
  typeof value === 'string' && allowed.includes(value);

/**
 * Parks a finished analysis under an unguessable token so it can be reopened
 * later — from the success page, or from the link in the receipt email on a
 * different device. This is the only reason the product needs a server at all;
 * there are no accounts, and the row holds no email until an order is paid.
 *
 * The photo is not involved: only the outcome the browser already computed.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }

  if (!oneOf(body.season, SEASON_IDS)) return json({ error: 'Unknown season.' }, 400);
  if (!oneOf(body.undertone, UNDERTONES)) return json({ error: 'Unknown undertone.' }, 400);
  if (!oneOf(body.source, SOURCES)) return json({ error: 'Unknown source.' }, 400);

  const confidence =
    typeof body.confidence === 'number' && Number.isFinite(body.confidence)
      ? Math.min(1, Math.max(0, body.confidence))
      : 0;

  if (!env.DB) {
    // Without a database there is nothing to link a payment to, so say so
    // plainly instead of handing back a token that will never resolve.
    return json({ stored: false, reason: 'storage-not-configured' }, 503);
  }

  const limit = Number.parseInt(env.RESULT_DAILY_LIMIT ?? '20', 10) || 20;

  try {
    const allowed = await consumeDailyBudget(env.DB, request, 'result', limit);
    if (!allowed) return json({ stored: false, reason: 'daily-limit-reached' }, 429);

    const token = randomToken();
    await env.DB.prepare(
      'INSERT INTO results (token, season, undertone, source, confidence, palette_json) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(token, body.season, body.undertone, body.source, confidence, cardJson(body.card))
      .run();

    return json({ stored: true, token });
  } catch {
    return json({ stored: false, reason: 'storage-unavailable' }, 503);
  }
};
