import type { APIRoute } from 'astro';

/**
 * The sitemap integration writes its index to `/sitemap-index.xml` and the
 * pages themselves to `/sitemap-0.xml`; it has no option to name a file
 * `/sitemap.xml`. Crawlers and Search Console still expect the conventional
 * address, so this route serves the same index at `/sitemap.xml`, and
 * `robots.txt` points here. The referenced chunk is the one the integration
 * always produces at this size (one chunk, `entryLimit` is 45,000 pages).
 */
export const GET: APIRoute = ({ site }) => {
  const chunk = new URL('sitemap-0.xml', site).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${chunk}</loc></sitemap></sitemapindex>`;

  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
