# Changelog

## 2026-09-16 — Three pages for the moments people actually ask about

Added pages on what to wear with grey hair, to an interview, and for a
photoshoot or headshot. Each one names real shades with codes and links back to
the free report, because the honest answer to all three questions starts with
"it depends which colours suit you".

The thesis is that these searches are the same product question wearing
different clothes, and answering them generically is what everyone else already
does. Grey hair changes contrast rather than undertone. An interview wants one
colour that suits the face rather than the navy everybody is told to wear. A
camera exaggerates both contrast and saturation, so a shade that is right in the
mirror can be too much on a sensor. The footer also grew into five columns, so
thirty-odd pages are reachable from anywhere rather than hidden behind a
five-link menu.

## 2026-09-16 — Pages for the two questions people actually type

Added `/color-analysis-app/` and `/what-colors-look-good-on-me/`. The first
answers what the tool is, with the upload panel in the hero and an honest
section on what a photograph cannot see that a consultant can. The second
answers the question directly in its first line and puts the seven-question quiz
under it.

The thesis is that both searches are asked by someone who wants an answer now,
not an explanation. Neither page holds anything back before the tool: the point
is that the visitor can finish what they came for on the page they landed on.
Two sibling phrases — "color season quiz" and "find my color season" — were
folded into the existing quiz and guide pages rather than given pages of their
own, because a second page for the same question would only compete with the
first.

## 2026-09-16 — Pages for skin tone and undertone

Added `/skin-tone-colors/` and a page for each undertone — warm, cool, neutral
and olive — with the shades that suit it, the shades to be careful with, and
three checks anyone can do at home by a window.

The thesis is that most advice about skin tone answers the wrong question. It
sorts people by how light or deep their skin is, when what decides whether a
colour works is which way the skin's colour leans. These pages separate the two
in as many words, treat a split test result as meaning neutral rather than as a
failed test, and treat olive as a cast that sits across the undertone question
rather than as a fifth undertone. Each one ends where it should: undertone
narrows four seasons to two, and the free report settles the rest.

## 2026-09-16 — The twelve sub-seasons, without inventing colours

Added a page for each of the twelve sub-seasons — light, warm and bright spring,
light, cool and soft summer, and so on — each with its own palette, the subtype
it is most often confused with and a daylight test to tell the two apart.
Alternative names ("true summer", "dark autumn", "clear winter") point at the
page for the same thing rather than competing with it.

The thesis is that a sub-season is not a separate palette but a season leaning
towards its neighbour, so each palette here is built from shades that already
exist on the site: seven from the parent, ranked by the quality the subtype is
named for, and three borrowed from the season it leans towards. The pages say
so outright. Inventing a hundred and forty-four new colours would have looked
more authoritative and meant less, and the free report still answers with one of
the four seasons, which is what a person actually needs to shop.

## 2026-09-16 — A page for each of the four palettes

Added `/spring-color-palette/`, `/summer-color-palette/`, `/autumn-color-palette/`
and `/winter-color-palette/`: the full palette with names and hex codes, how to
tell whether that season is yours, how to wear it, where it usually goes wrong,
and a FAQ. They link to each other and to the existing four-season reference.

The thesis comes from the keyword research: "<season> color palette" is the
largest and least contested search this product can answer, and a single page
covering all four seasons cannot rank for any of them. Each page is written
about a different confusion — summer against winter, autumn against spring,
winter against the advice to soften everything — so someone reading two of them
learns two things rather than the same thing twice.

## 2026-09-16 — The tool moves into the home hero

On a wide screen the home page now puts the photo upload, the four sample faces
and the link to the quiz beside the headline instead of below it. Previously a
desktop visitor saw only type above the fold and had to scroll before the
product appeared at all.

The thesis is the one remove.bg proves: on a free tool, the tool is the
argument. Someone who can see the upload button and four example faces without
scrolling understands what the site does in a second and can start immediately.
Nothing changes on a phone, where reading first and acting second is the right
order.

## 2026-09-16 — The palette card is actually buyable

Turned the paid plan from an honest placeholder into a working product. The
result a visitor computed is parked under a random token before checkout, the
token travels through Polar in the checkout metadata, and the paid-order webhook
uses it to unlock the card and email a link back to it.

The thesis is that an account is the wrong price to charge for a one-off
purchase: this audience will abandon a sign-up form, and a password is one more
thing to lose. The receipt email is the account — its link opens the card on any
device, including a phone held up in a shop. That does mean we now store a
season and the address Polar used for the receipt, so the privacy copy says so
instead of claiming nothing personal is ever kept. The photo is still read in
the browser and still never uploaded.

The card itself is what is being sold: one sheet with every colour named and
coded, and a checklist of things to actually look for in a shop. It is frozen at
the moment of purchase rather than read live from the site, because a card
bought in March should still be the card someone is holding in December. The
price on the pricing page is $9.99, matching the Polar product.

## 2026-09-15 — Real logo and favicons

Put the colormatch mark — a colour wheel around a garment on a hanger — in the
masthead and across every icon slot (favicon, Apple touch icon, web manifest),
replacing the placeholder square. The browser tab and the home-screen icon are
the first and last thing a returning visitor sees, and a generic square there
undercuts a product whose whole claim is an eye for colour. The theme colour
moves from blue to white to match the page.

## 2026-09-15 — Editorial visual pass and mobile menu

Reworked the interface to look like a fashion page rather than a generic tool:
serif display headings against the existing large, high-contrast body text, one
spacing and radius scale, flat surfaces and far more white space. The thesis is
that a colour-analysis product is bought on taste — a visitor who does not trust
the page's eye for colour will not trust its verdict about theirs — while the
70+ readability decisions stay untouched.

The drawn figures are gone. Seasons and the before/after slider now show
photographs with the season's colour draped over the clothing, the way a stylist
holds fabric under someone's chin, and the four sample inputs are real portraits
instead of clip art. Showing the effect on an actual face is the whole argument
for the product, and no illustration makes that case. The five nav links collapse
into a hamburger menu on phones so the header stops wrapping over two lines above
the fold.

## 2026-09-15 — First MVP of colormatch

Built the initial product: a free colour-analysis tool at getcolormatch.com that
gives a visitor their colour season, undertone, palette and colours to avoid,
from either a photo or a seven-question quiz.

The thesis is that existing colour analysis is either an expensive consultation
or a shallow quiz with no explanation. Offering a real palette for free, with no
sign-up and no upload, removes every reason to bounce — the photo is read in the
browser, so "is my photo safe" never becomes a question. Two routes in (photo and
quiz) exist because the photo route depends on a decent camera and good light,
which a large part of the audience does not have; the quiz uses things people can
check at home instead.

The interface is built for readers aged 70 and over, since that group buys
clothes deliberately and is badly served by small, low-contrast fashion sites.
Four search-intent pages cover the quiz, the photo route, the seasonal palettes
and the how-to question, each with its own copy and FAQ. A paid palette-card plan
is present as a working, honest interface that reports it is not open yet.
