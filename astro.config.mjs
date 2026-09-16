import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// PUBLIC_SITE_URL must be set in the Cloudflare Pages build environment so that
// canonical URLs and the sitemap point at the real domain.
const site = process.env.PUBLIC_SITE_URL ?? 'https://getcolormatch.com';

export default defineConfig({
  site,
  output: 'static',
  // Pages are small and static; fetching the next one while a link is under the
  // cursor makes the site feel instant without loading anything nobody asked for.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [
    react(),
    // A bought result is private and reachable only with its token, so it has
    // no business in the sitemap.
    // `lastmod` is the build: the whole site is generated from one source tree,
    // so every page is as fresh as the deploy that made it.
    sitemap({
      filter: (page) => !page.includes('/result/'),
      lastmod: new Date(),
      // Each palette page has a share card drawn from that palette, so Google
      // Images is told about it here rather than left to find it in a meta tag.
      // The palette slugs all end in `-color-palette`, and the card is named
      // after what comes before it.
      serialize: (item) => {
        const palette = new URL(item.url).pathname.match(/^\/(.+)-color-palette\/$/);
        const card = palette ? `/og/${palette[1]}.png` : '/og/default.png';
        return { ...item, img: [{ url: new URL(card, site).href }] };
      },
    }),
  ],
  devToolbar: { enabled: false },
});
