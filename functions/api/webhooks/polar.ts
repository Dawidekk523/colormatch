import { isEmail, json } from '../../_shared';
import { sendEmail, sender } from '../../mail';
import { verifyStandardWebhook } from '../../standard-webhooks';

interface PolarEvent {
  type?: unknown;
  data?: Record<string, unknown>;
}

const PAID_EVENTS = new Set(['order.paid', 'order.created', 'checkout.updated']);

const str = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);

const record = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

/** The token can arrive on the order or on the checkout that produced it. */
function tokenOf(data: Record<string, unknown>): string | null {
  const candidates = [
    record(data.metadata)?.token,
    record(record(data.checkout)?.metadata)?.token,
    record(record(data.subscription)?.metadata)?.token,
  ];
  for (const candidate of candidates) {
    const value = str(candidate);
    if (value && /^[0-9a-f]{32}$/.test(value)) return value;
  }
  return null;
}

function emailOf(data: Record<string, unknown>): string | null {
  const candidates = [
    record(data.customer)?.email,
    data.customer_email,
    record(data.user)?.email,
    record(record(data.checkout)?.customer)?.email,
  ];
  for (const candidate of candidates) {
    if (isEmail(candidate)) return candidate;
  }
  return null;
}

/** `checkout.updated` fires on every step; only a confirmed one counts. */
function isPaid(type: string, data: Record<string, unknown>): boolean {
  if (type === 'order.paid') return true;
  if (type === 'checkout.updated') return str(data.status) === 'succeeded';
  if (type === 'order.created') return str(data.status) === 'paid';
  return false;
}

interface ResultRow {
  token: string;
  season: string;
  paid_at: string | null;
}

/** By token when the metadata survived the trip, by checkout id when it did not. */
async function findResult(
  db: D1Database,
  token: string | null,
  checkoutId: string | null,
): Promise<ResultRow | null> {
  const [sql, value] = token
    ? ['SELECT token, season, paid_at FROM results WHERE token = ?', token]
    : checkoutId
      ? ['SELECT token, season, paid_at FROM results WHERE checkout_id = ?', checkoutId]
      : [null, null];
  if (!sql || !value) return null;
  try {
    return await db.prepare(sql).bind(value).first<ResultRow>();
  } catch {
    return null;
  }
}

/**
 * Polar delivers order and subscription events here. The endpoint verifies the
 * signature before it looks at the body, and it refuses everything when no
 * secret is configured rather than accepting unsigned traffic.
 *
 * A paid event is what turns a parked result into a bought one: it carries the
 * result token in the checkout metadata and the buyer's email from the receipt,
 * which together are the whole account system this product has.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const raw = await request.text();
  const verified = await verifyStandardWebhook(request.headers, raw, env.POLAR_WEBHOOK_SECRET);

  if (!verified.ok) {
    const status = verified.reason === 'not-configured' ? 503 : 401;
    return json({ error: 'Webhook rejected.', reason: verified.reason }, status);
  }

  let event: PolarEvent;
  try {
    event = JSON.parse(raw) as PolarEvent;
  } catch {
    return json({ error: 'Body was signed but is not JSON.' }, 400);
  }

  const type = typeof event.type === 'string' ? event.type : 'unknown';

  if (!env.DB) return json({ received: true, type, stored: false });

  let fresh = true;
  try {
    // The primary key makes a repeated delivery a no-op.
    const written = await env.DB.prepare(
      'INSERT OR IGNORE INTO billing_events (event_id, payload_type) VALUES (?, ?)',
    )
      .bind(verified.id, type)
      .run();
    fresh = (written.meta?.changes ?? 1) > 0;
  } catch {
    // Polar retries on a non-2xx, and a duplicate is harmless, so a storage
    // hiccup should not turn into an endless retry loop.
  }

  const data = event.data ?? {};
  if (!fresh || !PAID_EVENTS.has(type) || !isPaid(type, data)) {
    return json({ received: true, type });
  }

  const token = tokenOf(data);
  const checkoutId = str(data.checkout_id) ?? str(record(data.checkout)?.id);
  const email = emailOf(data);

  const row = await findResult(env.DB, token, checkoutId);

  if (!row) {
    // A sale we cannot attach to a result still has to be acknowledged, or
    // Polar will retry it forever.
    return json({ received: true, type, matched: false });
  }

  const alreadyPaid = Boolean(row.paid_at);
  try {
    await env.DB.prepare(
      `UPDATE results SET paid_at = COALESCE(paid_at, datetime('now')), email = COALESCE(?, email),
         checkout_id = COALESCE(?, checkout_id) WHERE token = ?`,
    )
      .bind(email, checkoutId, row.token)
      .run();
  } catch {
    return json({ received: true, type, matched: true, stored: false });
  }

  if (alreadyPaid || !email) return json({ received: true, type, matched: true, emailed: false });

  const from = sender(env);
  if (!from) return json({ received: true, type, matched: true, emailed: false });

  const link = `${new URL(request.url).origin}/result/?t=${row.token}`;
  const season = row.season.charAt(0).toUpperCase() + row.season.slice(1);
  const sent = await sendEmail(env, {
    from,
    to: email,
    subject: `Your ${season} colour report`,
    text: [
      `Thank you — your full colour report is ready.`,
      ``,
      `Open it here, on any device:`,
      link,
      ``,
      `Keep this email: the link is the only way back to your report. We never`,
      `saw your photo — it was read in your own browser and never uploaded.`,
    ].join('\n'),
  });

  return json({ received: true, type, matched: true, emailed: sent.sent });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
  json({ configured: Boolean(env.POLAR_WEBHOOK_SECRET) });
