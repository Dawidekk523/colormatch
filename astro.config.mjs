import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// PUBLIC_SITE_URL must be set in the Cloudflare Pages build environment so that
// canonical URLs and the sitemap point at the real domain.
const site = process.env.PUBLIC_SITE_URL ?? 'https://getcolormatch.com';

export default defineConfig({
  site,
  output: 'static',
  integrations: [
    react(),
    // A bought result is private and reachable only with its token, so it has
    // no business in the sitemap.
    sitemap({ filter: (page) => !page.includes('/result/') }),
  ],
  devToolbar: { enabled: false },
});
