/**
 * PostHog through the site's own domain, so blockers that drop third-party
 * analytics hosts leave the funnel intact. Assets and ingest live on different
 * PostHog hosts; nothing here is stored.
 */
export const onRequest: PagesFunction<Env> = async ({ request }) => {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/ev/, '');
  const host = /^\/(static|array)\//.test(path) ? 'eu-assets.i.posthog.com' : 'eu.i.posthog.com';
  const headers = new Headers(request.headers);
  headers.delete('cookie');
  headers.set('host', host);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('x-forwarded-for', ip);

  return fetch(`https://${host}${path}${url.search}`, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  });
};
