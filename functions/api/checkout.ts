import { json } from '../_shared';

interface Body {
  token?: unknown;
}

const isToken = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{32}$/.test(value);

const apiBase = (env: Env): string => (env.POLAR_API_BASE ?? 'https://api.polar.sh').replace(/\/+$/, '');

/**
 * Whether the paid plan is open at all. The upgrade button asks this before it
 * offers anything, so an unconfigured environment says "not open yet" instead
 * of leading somewhere broken.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const configured = Boolean(env.POLAR_ACCESS_TOKEN && env.POLAR_PRODUCT_ID && env.DB);
  if (configured) return json({ available: true });
  if (env.POLAR_CHECKOUT_URL) {
    // Older setup: a hosted link with no token. It still sells, but the result
    // cannot be reopened from the receipt email.
    return json({ available: true, url: env.POLAR_CHECKOUT_URL, tokenless: true });
  }
  return json({ available: false, reason: 'checkout-not-configured' });
};

/**
 * Opens a Polar checkout for one parked result. The token rides along in the
 * checkout's metadata, so when the paid-order webhook arrives we know which
 * result was bought without ever having asked the visitor to make an account.
 * The checkout id is written back to the row as a second way to find it.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }

  if (!isToken(body.token)) return json({ error: 'Unknown result.' }, 400);

  if (!env.POLAR_ACCESS_TOKEN || !env.POLAR_PRODUCT_ID || !env.DB) {
    return json({ available: false, reason: 'checkout-not-configured' }, 503);
  }

  const token = body.token;
  const existing = await env.DB.prepare('SELECT token FROM results WHERE token = ?')
    .bind(token)
    .first<{ token: string }>();
  if (!existing) return json({ error: 'Unknown result.' }, 404);

  const origin = new URL(request.url).origin;
  // Polar substitutes {CHECKOUT_ID}; the token in the path means the success
  // page can show the result even before the webhook has landed.
  const successUrl = `${origin}/result/?t=${token}&checkout_id={CHECKOUT_ID}`;

  let created: { id?: unknown; url?: unknown };
  try {
    const response = await fetch(`${apiBase(env)}/v1/checkouts/`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.POLAR_ACCESS_TOKEN}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        products: [env.POLAR_PRODUCT_ID],
        success_url: successUrl,
        metadata: { token },
      }),
    });
    if (!response.ok) return json({ available: false, reason: 'checkout-provider-error' }, 502);
    created = (await response.json()) as { id?: unknown; url?: unknown };
  } catch {
    return json({ available: false, reason: 'checkout-provider-error' }, 502);
  }

  if (typeof created.url !== 'string') {
    return json({ available: false, reason: 'checkout-provider-error' }, 502);
  }

  if (typeof created.id === 'string') {
    try {
      await env.DB.prepare('UPDATE results SET checkout_id = ? WHERE token = ?').bind(created.id, token).run();
    } catch {
      // The metadata path still identifies the row, so a failed write here is
      // not worth refusing a sale over.
    }
  }

  return json({ available: true, url: created.url });
};
