import { isEmail, json } from '../_shared';
import { SEASON_IDS } from '../_shared';
import { sendEmail, sender } from '../mail';

interface Body {
  email?: unknown;
  season?: unknown;
}

/**
 * Emails a copy of a palette. Nothing is sent unless a sender and at least one
 * provider are configured, which keeps test and preview environments quiet by
 * default.
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

  const from = sender(env);
  if (!from) {
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

  const sent = await sendEmail(env, {
    from,
    to: body.email,
    subject: `Your ${season} colour palette`,
    text: `Here is your palette again: ${new URL('/color-seasons/', request.url).href}`,
  });

  if (!sent.sent) {
    return json({ sent: false, reason: sent.reason ?? 'email-provider-error' }, 502);
  }

  return json({ sent: true });
};
