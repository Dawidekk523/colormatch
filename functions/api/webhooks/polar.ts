import { json } from '../../_shared';
import { verifyStandardWebhook } from '../../standard-webhooks';

interface PolarEvent {
  type?: unknown;
}

/**
 * Polar delivers order and subscription events here. The endpoint verifies the
 * signature before it looks at the body, and it refuses everything when no
 * secret is configured rather than accepting unsigned traffic.
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

  if (env.DB) {
    try {
      // The primary key makes a repeated delivery a no-op.
      await env.DB.prepare('INSERT OR IGNORE INTO billing_events (event_id, payload_type) VALUES (?, ?)')
        .bind(verified.id, type)
        .run();
    } catch {
      // Polar retries on a non-2xx, and a duplicate is harmless, so a storage
      // hiccup should not turn into an endless retry loop.
    }
  }

  return json({ received: true, type });
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) =>
  json({ configured: Boolean(env.POLAR_WEBHOOK_SECRET) });
