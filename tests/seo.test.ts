// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GET as robots } from '../src/pages/robots.txt';
import { GET as sitemap } from '../src/pages/sitemap.xml';

const ORIGIN = 'https://getcolormatch.com';

type SiteContext = { site: URL };

/** The routes read only `site`, which Astro fills from the configured origin. */
const call = (route: unknown) =>
  (route as (ctx: SiteContext) => Response | Promise<Response>)({ site: new URL(ORIGIN) });

describe('robots.txt', () => {
  it('allows crawling and points at the conventional sitemap', async () => {
    const body = await (await call(robots)).text();
    expect(body).toContain('User-agent: *');
    expect(body).toContain('Allow: /');
    expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
    expect(body.match(/^Sitemap:/gm)).toHaveLength(1);
  });
});

describe('sitemap.xml', () => {
  it('serves a sitemap index for the chunk the integration generates', async () => {
    const res = await call(sitemap);
    expect(res.headers.get('content-type')).toContain('xml');
    const body = await res.text();
    expect(body).toContain('<sitemapindex');
    expect(body).toContain(`<loc>${ORIGIN}/sitemap-0.xml</loc>`);
  });
});

/**
 * The checks below read the real build output. They are skipped when `dist`
 * has not been built, so the suite still passes from a clean checkout; after
 * `npm run build` they verify the XML that actually ships.
 */
const dist = join(process.cwd(), 'dist');
const built = existsSync(join(dist, 'sitemap.xml'));

describe.skipIf(!built)('built sitemap', () => {
  it('keeps /sitemap.xml consistent with the generated index', () => {
    const alias = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
    const index = readFileSync(join(dist, 'sitemap-index.xml'), 'utf8');
    const chunk = index.match(/<loc>([^<]+)<\/loc>/)?.[1];
    expect(chunk).toBeTruthy();
    expect(alias).toContain(`<loc>${chunk}</loc>`);
  });

  it('lists public pages only', () => {
    const chunk = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
    const urls = [...chunk.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]!);
    expect(urls.length).toBeGreaterThan(20);
    for (const url of urls) {
      expect(url.startsWith(`${ORIGIN}/`)).toBe(true);
      expect(url).not.toContain('/result/');
      expect(url).not.toContain('/404');
    }
    expect(urls).toContain(`${ORIGIN}/`);
    expect(urls).toContain(`${ORIGIN}/pricing/`);
  });

  it('advertises the alias in the built robots.txt', () => {
    const body = readFileSync(join(dist, 'robots.txt'), 'utf8');
    expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
  });
});
