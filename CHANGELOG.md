# Changelog

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
