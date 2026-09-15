import { isEmail, json } from '../_shared';
import { SEASON_IDS } from '../_shared';

interface Body {
  email?: unknown;
  season?: unknown;
}

/**
 * Emails a copy of a palette through Resend. Nothing is sent unless both the
 * key and a verified sender are configured, which keeps test and preview
 * environments quiet by default.
 */
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json({ error: 'Expected a JSON body.' }, 400);
  }

  if (!isEmail(body.email)) {
    return json({ error: 'Please enter a valid email address.' }, 400);
  }
  const season =
    typeof body.season === 'string' && (SEASON_IDS as readonly string[]).includes(body.season)
      ? body.season
      : null;
  if (!season) return json({ error: 'Unknown season.' }, 400);

  if (!env.RESEND_API_KEY || !env.RESEND_FROM) {
    return json({ sent: false, reason: 'email-not-configured' }, 503);
  }

  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO subscriptions (email, season) VALUES (?, ?)
         ON CONFLICT(email) DO UPDATE SET season = excluded.season`,
      )
        .bind(body.email, season)
        .run();
    } catch {
      /* the email matters more than the record of it */
    }
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [body.email],
      subject: `Your ${season} colour palette`,
      text: `Here is your palette again: ${new URL('/color-seasons/', request.url).href}`,
    }),
  });

  if (!response.ok) {
    return json({ sent: false, reason: 'email-provider-error' }, 502);
  }

  return json({ sent: true });
};
