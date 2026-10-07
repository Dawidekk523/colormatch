# colormatch — loop state

Read this first in every loop iteration. Take the next unchecked item in the
active stream, finish it whole, tick it, append a note under "Log". Do NOT
commit — Dawid does one commit + deploy in the morning (2026-09-16 decision).
Keep the working tree buildable at the end of every iteration: `npm run test`,
`npm run lint`, `npm run typecheck`.

Rules that bind the work: `/Users/dawid/.claude/CLAUDE.md` (design: no
gradients, no eyebrows, no heavy shadows, no card-next-to-card, no
border-next-to-border, no divider rules; changelog only for product-facing
changes, short, thesis-only).

Keywords: `keyword-research.md` in the repo root (Juni, Ahrefs US, 2026-09-15).

## Eyes

- `/Users/dawid/hades-agent/scripts/hades-see <url>` — text + PNG path, open the
  PNG with Read.
- No viewport flag. For phone widths: serve `tools/viewport.html` (built in the
  responsive stream) with an iframe at 390x844 / 768x1024 and hades-see that.
- `/Users/dawid/hades-agent/scripts/hades-ask "<request>"` — a bot with real
  tools (CDP `Emulation.setDeviceMetricsOverride`, vault logins, Cloudflare,
  Polar, SES console). Costs a model turn; one specific request at a time.
  Use it for infra (SES domain verification, Polar product, Pages secrets) and
  for true-DPR/touch checks.

## Stream A — paid product (do first: most external dependencies)

Today: `checkout.ts` returns a static `POLAR_CHECKOUT_URL`; the webhook only
records `event_id` in `billing_events`; the result lives only in
`sessionStorage` (`src/lib/result-storage.ts`). No account system, and none is
wanted — the receipt email is the only key.

- [x] D1 migration `0002_paid_results.sql`: `results(token PRIMARY KEY, season,
      undertone, source, confidence, palette_json, created_at, paid_at, email,
      checkout_id)`. Token = 32 hex from `crypto.getRandomValues`.
- [x] `POST /api/result` — stores the computed result before checkout, returns
      the token. Rate-limited like `/api/analysis`.
- [x] `POST /api/checkout` — creates a Polar checkout server-side with
      `metadata.token`, `success_url` carrying the checkout id. Needs
      `POLAR_ACCESS_TOKEN` + `POLAR_PRODUCT_ID`. Check the exact Polar API field
      names with Context7 before writing; do not write them from memory. Keep a
      GET that reports `available:false` when unconfigured.
- [x] Webhook: on the paid event, read `metadata.token` + customer email, set
      `paid_at`/`email`, send the mail. Idempotent via `billing_events`.
- [x] `GET /api/result/:token` — returns the full result only when `paid_at` is
      set; otherwise the free subset.
- [x] `src/pages/result/[token].astro` (SSR-ish via a function route, since the
      site is static — likely `functions/result/[token].ts` or a client fetch on
      a static page). Opens from the email on any device.
- [x] Success page after checkout: unlocks immediately from sessionStorage,
      hydrates from the token.
- [x] Mail: port `../artpatt/lib/ses-resend-compat.ts` to Workers —
      `aws4fetch` + SESv2 REST, same `Resend`-shaped interface, Resend kept as
      the fallback. `EMAIL_SES_*` secrets. Rewrite `subscribe.ts` onto it.
- [x] Privacy copy: we now store an email. `README.md` ("only the resulting
      season is ever sent anywhere") and the `wrangler.toml` comment
      ("non-personal storage only") are no longer true. The photo still never
      leaves the device — say exactly that instead.
- [x] Changelog entry (product-facing).

Still open in Stream A:

- [x] The card itself. `palette_json` is written by nobody yet, so a buyer gets
      the palette plus a print button — not the printable card and wardrobe
      checklist the pricing page promises. Build the card (a print-sized layout
      of the palette) and the checklist, and write the card payload on purchase.
- [x] Price. `pricing.astro` reads `PUBLIC_CARD_PRICE` from the build
      environment and now falls back to $9.99, matching the Polar product.

Infra, checked with hades-ask on 2026-09-16:

- Polar: organisation `DPMEDIA`, product `ColorMatch Personal Color Analysis`,
  $9.99 one-off, `product_id` `49e30fa2-f8d0-42f5-b711-9ff35406e8e8`. Dawid
  still has to `wrangler pages secret put POLAR_ACCESS_TOKEN` and
  `POLAR_PRODUCT_ID` (and `POLAR_WEBHOOK_SECRET`), and point the Polar webhook
  at `https://getcolormatch.com/api/webhooks/polar`.
- SES: `getcolormatch.com` is NOT verified. The account is out of the sandbox
  only in `eu-west-1`; every other region is sandboxed. Verifying the domain
  means adding DKIM CNAMEs and MAIL FROM records in Cloudflare — the classifier
  refused to let hades-ask touch DNS, so this is Dawid's call in the morning.
  Until then the Resend fallback is what actually sends.

## Stream B — responsiveness bugs

- [x] `tools/viewport.html` — iframe harness. Params: `path`, `w`, `offset`,
      `h`, `base`. The iframe is rendered tall and shifted up behind a clipping
      window, because it is cross-origin and cannot be scrolled. Serve it with
      `cd tools && python3 -m http.server 4399` alongside `npm run dev`, then
      `hades-see "http://localhost:4399/viewport.html?path=/&w=390&offset=460"`.
The `hades-see` block cleared on its own; screenshots work again.

Swept and fixed at 390:

- [x] `/` and `/pricing` — sound. Stacked plans, no overflow, price reads $9.99.
- [x] `/color-analysis-quiz` — question headings were shredded into short ragged
      lines: `text-wrap: balance` is for display lines, and these headings are
      whole sentences. Now `pretty` on `.quiz__question`.
- [x] `/find-my-color-palette` — every step carried a full-width 2px rule above
      it, which in one column reads as a divider between sections (and breaks
      the no-divider rule). Now a 2rem mark, full width only from 48rem. The
      list also had no space above it at all, see the note below.
- [x] `/color-palette-from-image` at 390 — the hero ran edge to edge. `.shell`
      sets the page gutter with `width: min(100% - 2.5rem, …)` and
      `.hero__inner` overwrote it with a plain `100%`, winning on source order.
      Every hero on every page was affected. Fixed in `.hero__inner`.
- [x] `/color-seasons` and `/result` at 390 — sound.
- [x] Stack spacing, chased down properly. Two separate causes:
      `.stack > * + *` scores (0,1,0) and lost the tie to component rules that
      reset their own margin (now `.stack.stack > * + *`); and every React
      island is wrapped in `<astro-island>`, which Astro lays out as
      `display: contents`, so the stack margin landed on a box that does not
      exist. Every widget — Analyzer, Quiz, SeasonExplorer, ColourCompare,
      UpgradeButton — sat hard against the paragraph above it. Fixed by giving
      the spacing to what the island renders.
- [x] `/` and `/pricing` at 768 — the compare slider was capped at 30rem and
      left-aligned, leaving a column of dead space beside it; now centred. The
      two plans sit side by side correctly.
- [x] `/color-analysis-quiz`, `/color-palette-from-image`, `/find-my-color-palette`,
      `/color-seasons` at 768 — all sound. One thing left deliberately alone:
      the three-step lists sit in two columns at 768, so the third step is an
      orphan on its own row. Fitting three across would need the measure to drop
      to about 210px, which is worse than the orphan.

Stream B is done. The harness stays in `tools/viewport.html` for the next sweep.

## Stream C — visual pass against remove.bg

- [x] Looked at remove.bg: home, mid-page sections, footer.

What transfers:

- The tool sits beside the headline, above the fold — the upload panel is the
  hero, not something below it. Applied to the home page (`.hero--split`).
- Results lead. They show a cut-out sample immediately; our compare slider makes
  the same argument but sits far down the page. Worth considering a move up.
- Generous, quiet white space between sections, and alternating text/image
  blocks rather than one centred column all the way down.
- A two-tier footer: link columns, then a quiet band for legal and social. Ours
  is smaller and does not need the second tier yet.

What does not, under the design rules: the soft gradient glow behind their
upload card, the large drop shadow on it, the wavy divider above the footer and
the dark slate band.

- [x] The before/after slider already sits directly under the hero, so there is
      nothing to move. The alternating text/image rhythm is a genuine home-page
      redesign rather than a tidy-up — at 1280 the mid-page sections leave the
      right half of the shell empty — so it is written down as a proposal for
      Dawid rather than done unasked.

## Stream D — SEO pages

Order from `keyword-research.md`:

1. [x] Four season pages: spring / summer / autumn / winter color palette
       (>10k, Easy). Live at `/spring-color-palette/` and so on:
       `src/lib/season-pages.ts` holds the copy, `src/pages/[slug].astro`
       renders it, `src/components/SwatchGrid.astro` draws the palettes, and
       `/color-seasons/` links into each. ~1,600 words a page, FAQ schema,
       all four in the sitemap. Subagent copy reviewed: every shade it names
       checks out against `seasons-data.ts` (bar "oyster" and "oatmeal", which
       come from the wardrobe checklists), and two claims it flagged itself were
       corrected — an unsupported ranking of navy over black for autumn, and a
       line implying winter contrast depends on skin lightness. Changelog
       written.
2. [x] Season subtypes. Decided against inventing 144 hex codes: a subtype is
       its parent season leaning towards a neighbour, so `src/lib/subtypes.ts`
       derives each palette from shades that already exist — seven from the
       parent ranked by the quality the subtype is named for (L* for
       light/deep, C* for bright/soft, via `rgbToLab`), three borrowed from the
       neighbour, and nothing borrowed at all for the three "true" subtypes. The
       page says so in as many words. Twelve canonical subtypes, not the
       twenty-one name variants in the keyword list: the variants are aliases
       for the same thing, so they are named in each page's title and sent to
       the canonical page by `public/_redirects` (generated by
       `tools/build-redirects.mjs`, kept honest by `tests/redirects.test.ts`).
       `src/pages/[slug].astro` now serves both kinds of palette page and only
       builds subtypes that have copy. `/color-seasons/` no longer claims
       twelve-season systems are for stylists only, since we now publish them.
       Light spring is written as the quality bar; an Opus subagent is writing
       the other eleven — REVIEW before ticking, and check it did not claim a
       "true" subtype borrows anything. Changelog entry still to write.
3. [x] Skin tone cluster. `src/lib/undertones.ts` derives each undertone
       palette from the two seasons that share it — five shades from each,
       the most saturated for warm and cool, the least saturated for neutral and
       olive, with the warnings taken from those same two seasons' avoid lists
       (5 new tests). `/skin-tone-colors/` is the hub for the ">1k" keyword and
       is written; `/warm-skin-tone-colors/` is written as the quality bar and
       renders through `src/components/UndertoneSection.astro`.
       All five pages are live and build (~1,200-1,500 words each, FAQ schema).
       Subagent copy reviewed: shade names were verified by running
       `undertonePalette()` rather than guessed, and two unsupported claims were
       cut — metal finishes for olive skin, and a ranking of which seasons olive
       skin "can" be. Changelog written.
4. [x] `color analysis app` / `free color analysis app` — `/color-analysis-app/`,
       with the analyzer in a split hero and a section on what a photo cannot do
       that a consultant can.
5. [x] `what colors look good on me` — `/what-colors-look-good-on-me/`, answer
       first, quiz underneath, then the four palettes. `color season quiz` and
       `find my color season` were deliberately NOT given their own pages:
       `/color-analysis-quiz/` and `/find-my-color-palette/` already answer
       exactly those questions, so the phrases went into their titles,
       descriptions and headings instead. A second page for the same question
       only competes with the first.
6. [x] Outfit long-tail. `/best-colors-to-wear-with-gray-hair/` is written —
       its argument is that greying changes contrast, not undertone, which is
       also the most useful thing this site can tell its own audience. A
       subagent is writing `/best-colors-to-wear-to-an-interview/` and
       `/best-colors-to-wear-for-a-photoshoot/` (headshots folded into the
       second). REVIEW before ticking, and write one changelog entry for the
       three together.

Also done this tick: the footer grew from three groups to five (the palettes,
skin tone, and a "more" column), because thirty pages behind a five-link nav is
not a map. The disclaimer needed its own shell — `.note` sets a measure and
`.shell` centres, so together they had parked it in the middle of the footer.

Rules: never rename an existing slug (memory: colormatch brand). Every page
needs its own copy — no template text swapped by season name. Bulk, mechanical
parts go to an Opus-medium subagent; review the output afterwards. One changelog
entry per batch, thesis only.

## Log

- 2026-09-16 — plan written, keyword research copied to `keyword-research.md`.
- 2026-09-16 — Stream A: migration `0002_paid_results.sql` (results table, no
  email until an order is paid), `POST /api/result` at
  `functions/api/result/index.ts`, plus `randomToken` and a scoped
  `consumeDailyBudget` in `_shared.ts` so parking a result does not eat the
  analysis budget. `RESULT_DAILY_LIMIT` added to `env.d.ts`. test/lint/typecheck
  green. Next: `POST /api/checkout` — read the Polar API field names from
  Context7 first.
- 2026-09-16 — Stream A finished bar the card content: server-side Polar
  checkout carrying the result token, paid-order webhook that unlocks the row
  and emails the link, `GET /api/result/:token`, `/result/` page (noindex, out
  of the sitemap), SES-first mail module with a Resend fallback
  (`functions/mail.ts`, aws4fetch), `subscribe.ts` moved onto it, privacy copy
  in README/wrangler/home FAQ corrected, pricing FAQ rewritten around "no
  account, the email is the key", print stylesheet, 15 new worker tests
  (`tests/worker/paid-flow.test.ts`). 140 tests, lint and typecheck green,
  build clean. Uncommitted, as agreed.
- 2026-09-16 — Stream B started: viewport harness built and working; home and
  pricing check out at 390. Price wired to the real Polar product ($9.99, with
  `PUBLIC_CARD_PRICE` able to override). Dev server on :4321 and the harness on
  :4399 were left running in the background.
- 2026-09-16 — Stream A closed. `src/lib/card.ts` builds and validates a frozen
  card payload, `PaletteCard.tsx` prints it as one sheet, every season gained a
  seven-item wardrobe checklist in `seasons-data.ts`, the browser sends the card
  with the parked result and `palette_json` stores it (8 KB cap), and printing
  now yields the card alone. Price set to $9.99. 144 tests green, build clean.
  Stream B is next but still blocked on the `hades-see` permission rule.
- 2026-09-16 — Stream B: quiz heading wrapping, the step rules that read as
  dividers, and the missing space above the steps list all fixed at 390.
  `hades-see` works again. Found the stack-spacing specificity bug and wrote it
  down rather than fixing it blind. 145 tests green.
- 2026-09-16 — Stream B, second pass. Three site-wide defects, not page-local
  ones: heroes lost the page gutter on phones, every interactive island lost its
  stack spacing (two independent causes, both now fixed in `global.css`), and
  the compare slider left dead space on a tablet. 145 tests, lint, typecheck and
  build all green.
- 2026-09-16 — Stream B closed (768 sweep clean) and Stream C read. The home
  hero is now two columns on a wide screen with the analyzer, the four sample
  faces and the quiz link all above the fold; the extra hero line is hidden on
  phones so it cannot push the button below the fold. Changelog entry written.
  145 tests, lint and build green.
- 2026-09-16 — Stream D, first batch done. Four season palette pages built,
  cross-linked and in the sitemap; subagent copy for summer, autumn and winter
  reviewed and two unsupported claims corrected. 11 pages build clean, lint and
  typecheck green. Next: the 12/16 subtypes, which need palette data that does
  not exist yet — decide whether to generate it or to write subtype pages that
  point back at the parent palette.
- 2026-09-16 — Stream D, subtype machinery built and tested (7 new tests, 152
  total). Palettes are derived rather than invented, aliases redirect to
  canonical pages, and the four-vs-twelve answer on `/color-seasons/` no longer
  contradicts the new pages. Copy for eleven subtypes is with a subagent.
- 2026-09-16 — While the subtype copy was being written: swatch rows now use
  subgrid, so a colour name that wraps to two lines ("Warm Aubergine",
  "Chocolate Brown") no longer pushes its hex code out of line with the rest of
  the row. Falls back to the old flex layout where subgrid is unsupported.
  Stream C's open item resolved: the slider is already high on the page, and the
  alternating rhythm is left as a proposal.
- 2026-09-16 — Stream D, subtypes closed. Eleven subtype pages reviewed and
  three claims corrected; 16 palette pages now build (4 seasons + 12 subtypes),
  152 tests green. Next up is the skin tone cluster.
- 2026-09-16 — Stream D, skin tone cluster started: undertone derivation and
  tests done (157 total), hub page and the warm page written, three page files
  parked in `.claude/pending/` until their copy arrives so the build stays
  green.
- 2026-09-16 — Stream D, skin tone cluster closed. Five pages live, parked files
  restored, two lore claims cut from the olive page. 27 URLs in the sitemap,
  157 tests, lint and build green.
- 2026-09-16 — Stream D, items 4 and 5 done. Two new pages, two existing ones
  retitled to cover their sibling phrases. 30 pages build, 29 URLs in the
  sitemap, 157 tests green. Only the outfit long-tail (item 6) is left.
- 2026-09-16 — Stream D item 6 started: grey hair page written, two occasion
  pages with a subagent. Footer rebuilt as five link columns so the new pages
  are reachable from every page, and its disclaimer alignment fixed. 31 pages
  build, 157 tests green.
- 2026-09-16 — Stream D closed. Interview and photoshoot pages reviewed, titles
  made consistent, one shaky claim reworded. 32 URLs in the sitemap, 157 tests,
  lint, typecheck and build all green. All four streams are now complete; what
  is left is Dawid's: the morning commit and deploy, the Polar and SES secrets,
  and the DNS records for SES.
