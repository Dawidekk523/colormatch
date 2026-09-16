# colormatch

A free colour-analysis web app. A visitor uploads a photo or answers seven short
questions, and gets a colour season (Spring, Summer, Autumn or Winter), a
possible undertone, a named palette with hex codes, and the colours to be
careful with.

Production domain: **getcolormatch.com**

Two things shape the whole build:

- **The photo never leaves the device.** It is decoded onto a small off-screen
  canvas in the browser; the only thing that ever leaves is the season it came
  out as. Buying the palette card stores that season and the email address Polar
  took for the receipt, because the link in that email is the only way back to
  the card — there are no accounts. The free report stores nothing personal.
- **It has to be readable by someone in their seventies.** Large type, WCAG AA
  contrast, big targets, visible focus rings, and nothing that depends on
  telling two colours apart — every swatch is labelled with a name and a code.

## Stack

| Piece | Choice |
| --- | --- |
| Site | Astro 7, `output: 'static'` |
| Interactive parts | React 19 islands |
| Backend | Cloudflare Pages Functions in `functions/` |
| Storage | Cloudflare D1 (optional — the app works with no database bound) |
| Styling | Plain CSS with custom properties, no framework |
| Tests | Vitest, jsdom for components, node for Workers code |

No adapter is used: `astro build` writes `dist/`, Cloudflare Pages serves it and
mounts `functions/` automatically.

## Running it

```sh
npm install
npm run dev          # Astro dev server; the frontend works with no backend
npm run build        # static build into dist/
npm run preview      # wrangler pages dev — serves dist/ plus the API functions
```

Checks:

```sh
npm run lint         # eslint over src, functions and tests
npm run typecheck    # astro check + tsc over functions/
npm test             # vitest
npm run functions:build  # compiles the Pages Functions bundle, offline
```

## Configuration

Every value comes from an environment variable. **No secret belongs in this
repository.**

| Name | Where it is set | What happens without it |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | Pages build environment | Canonical URLs and the sitemap fall back to the production domain in `astro.config.mjs` |
| `ANALYSIS_DAILY_LIMIT` | `[vars]` in `wrangler.toml` | Defaults to 50 anonymous analyses per visitor per day |
| `POLAR_WEBHOOK_SECRET` | `wrangler pages secret put` | The webhook refuses every delivery with `503` |
| `RESULT_DAILY_LIMIT` | `[vars]` in `wrangler.toml` | Defaults to 20 parked results per visitor per day |
| `POLAR_ACCESS_TOKEN` | `wrangler pages secret put` | The upgrade button says the plan is not open yet |
| `POLAR_PRODUCT_ID` | `wrangler pages secret put` | Same as above |
| `POLAR_API_BASE` | `wrangler pages secret put` | Defaults to `https://api.polar.sh`; set the sandbox host while testing |
| `POLAR_CHECKOUT_URL` | `wrangler pages secret put` | Legacy hosted link, used only when no access token is set. It cannot carry a result token, so the buyer gets no email link |
| `EMAIL_SES_REGION`, `EMAIL_SES_ACCESS_KEY_ID`, `EMAIL_SES_SECRET_ACCESS_KEY` | `wrangler pages secret put` | SES is skipped and Resend is tried instead |
| `EMAIL_FROM` | `wrangler pages secret put` | Falls back to `RESEND_FROM`; with neither, nothing is ever sent |
| `RESEND_API_KEY` | `wrangler pages secret put` | No fallback if SES fails or is unset |
| `RESEND_FROM` | `wrangler pages secret put` | Sender for the fallback path |

For local work, copy `.dev.vars.example` to `.dev.vars`. That file is
git-ignored and must stay that way.

### Database

D1 holds anonymous counters — which season came out, whether it came from a
photo or the quiz, a per-visitor daily cap, webhook event ids for
de-duplication — and the `results` table behind the paid card. A result row
starts anonymous: it is a random 32-character token plus the season. An email
address is written to it only when Polar reports the order paid, so an abandoned
checkout leaves nothing personal behind. The IP address is never stored — only a
SHA-256 hash of the IP joined with the current date.

```sh
wrangler d1 create color_palette_db     # copy the id into wrangler.toml
npm run db:migrate:local
npm run db:migrate:remote
```

If the `DB` binding is missing, every endpoint degrades quietly and the site
keeps working.

## Deploying

```sh
npm run deploy       # build, then wrangler pages deploy
```

In the Pages project settings: build command `npm run build`, output directory
`dist`, and `PUBLIC_SITE_URL=https://getcolormatch.com`.

## API

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/health` | GET | Reports which integrations are configured |
| `/api/analysis` | POST | Records an anonymous `{season, source}` pair, rate-limited |
| `/api/analysis` | GET | Season totals |
| `/api/checkout` | GET | Returns the Polar checkout link when one is configured |
| `/api/subscribe` | POST | Emails a palette through Resend |
| `/api/webhooks/polar` | POST | Verified Polar webhook receiver |

The Polar webhook uses Standard Webhooks: `webhook-id`, `webhook-timestamp` and
`webhook-signature` headers, HMAC-SHA256 over `id.timestamp.body`, a five-minute
timestamp tolerance, and a constant-time comparison. It is implemented directly
on Web Crypto, so there is no SDK dependency. Tests never send a real email or
call a real payment provider.

## Pages

| Path | Intent |
| --- | --- |
| `/` | General — colour analysis, both routes in |
| `/color-analysis-quiz/` | The quiz |
| `/color-palette-from-image/` | The photo route |
| `/color-seasons/` | Reference: the four seasonal palettes |
| `/find-my-color-palette/` | How to find your palette |
| `/pricing/` | Plans |

`sitemap-index.xml` is generated at build time and `robots.txt` is served from
`src/pages/robots.txt.ts`, both from `PUBLIC_SITE_URL`.

## Limits worth knowing

- The photo route reads an average skin tone; it does not detect faces. A photo
  where the face does not fill the middle of the frame is refused rather than
  guessed at.
- Browsers cannot decode HEIC, which is the iPhone default. The app says so in
  plain language and points at the quiz.
- The result is a styling suggestion. It is not a professional consultation and
  not any kind of health or medical assessment, and the interface says so.

## Photography

The sample inputs (`public/samples`) and the season portraits (`public/photos`)
are Unsplash photographs, fetched and cropped by `node tools/prepare-photos.mjs`,
with the source and photographer of every file recorded in
`PHOTO-CREDITS.md`. The samples are square face crops because clicking one
runs the real analyser; `tests/samples.test.ts` decodes them and asserts the season
each one reads as, so a swapped photo cannot quietly change what the tiles promise.
