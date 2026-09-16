/**
 * Draws every Open Graph image the site links to and writes them into public/og/.
 *
 * The cards are generated rather than designed by hand because they are made of
 * the same data the pages are made of: seventeen images, one per season, one per
 * subtype and one for the brand, all of which would drift the moment a swatch is
 * renamed or a palette is retuned. Running this script again is the only upkeep.
 *
 * They are committed as static PNGs instead of being rendered on request so that
 * a crawler asking for an image gets a file off the CDN, with no runtime, no cold
 * start and no chance of a preview that fails to appear.
 *
 * The visual language is the one in src/lib/share-image.ts — same surface, same
 * ink, same fonts, same hairlined tiles. That file is browser code and is not
 * imported here; this is the same picture in a different shape.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { SEASONS, SEASON_ORDER } from '../src/lib/seasons-data';
import { SUBTYPES, subtypePalette } from '../src/lib/subtypes';

const WIDTH = 1200;
const HEIGHT = 630;
const MARGIN = 72;
const CONTENT = WIDTH - MARGIN * 2;

const SURFACE = '#f7f4ef';
const INK = '#15161a';
const SOFT_INK = '#54585f';
const HAIRLINE = 'rgba(21,22,26,0.12)';

const DISPLAY = '"Iowan Old Style", "Palatino Linotype", Palatino, "Hoefler Text", Georgia, serif';
const TEXT = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TILE_RADIUS = 14;

const font = (weight, size, family = TEXT) => `${weight} ${size}px ${family}`;

const outDir = new URL('../public/og/', import.meta.url);
mkdirSync(outDir, { recursive: true });

/** `roundRect` exists in this canvas build; the fallback keeps the drawing code
 * honest if the script is ever pointed at another one. */
function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * Pale creams sit almost invisibly on the surface colour, so every tile carries
 * a hairline drawn just inside its own edge — it reads as part of the swatch
 * rather than as a border stacked next to a border.
 */
function drawTile(ctx, x, y, w, h, r, hex) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = hex;
  ctx.fill();
  roundRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r - 0.5);
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.stroke();
}

const truncated = [];

/**
 * Colour names and season names are data of unknown length, so a label first
 * shrinks a little and then loses its tail rather than running into its
 * neighbour. Sets `ctx.font` as a side effect; the caller draws immediately
 * after. Anything that had to lose its tail is reported at the end, because a
 * heading with an ellipsis in it is a layout to fix and not an image to ship.
 */
function fitText(ctx, text, maxWidth, size, minSize, weight, family = TEXT) {
  let current = size;
  while (current > minSize) {
    ctx.font = font(weight, current, family);
    if (ctx.measureText(text).width <= maxWidth) return text;
    current -= 1;
  }
  ctx.font = font(weight, current, family);
  if (ctx.measureText(text).width <= maxWidth) return text;
  let clipped = text;
  while (clipped.length > 1 && ctx.measureText(`${clipped}…`).width > maxWidth) {
    clipped = clipped.slice(0, -1);
  }
  truncated.push(text);
  return `${clipped.trim()}…`;
}

function card(name, draw) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  draw(ctx);
  const file = new URL(`${name}.png`, outDir);
  writeFileSync(file, canvas.toBuffer('image/png'));
  return file;
}

/** Title and subtitle, the block every card opens with. Returns the y the rest
 * of the card starts from. */
function drawHeader(ctx, title, subtitle, titleSize) {
  ctx.fillStyle = INK;
  ctx.fillText(fitText(ctx, title, CONTENT, titleSize, titleSize - 12, 400, DISPLAY), MARGIN, MARGIN + 12);
  const y = MARGIN + 12 + titleSize * 1.12;
  ctx.fillStyle = SOFT_INK;
  ctx.fillText(fitText(ctx, subtitle, CONTENT, 27, 20, 400), MARGIN, y);
  return y + 27 * 1.3;
}

/**
 * Ten shades, five to a row, each with its name and hex. Five across rather than
 * ten keeps a two-word colour name readable at the size a preview is seen.
 */
function drawPalette(ctx, swatches, top) {
  const perRow = 5;
  const gap = 18;
  const tileW = (CONTENT - gap * (perRow - 1)) / perRow;
  const tileH = 108;
  const nameSize = 19;
  const hexSize = 15;
  const rowH = tileH + 10 + nameSize + 4 + hexSize;
  swatches.forEach((swatch, index) => {
    const x = MARGIN + (index % perRow) * (tileW + gap);
    const y = top + Math.floor(index / perRow) * (rowH + gap);
    drawTile(ctx, x, y, tileW, tileH, TILE_RADIUS, swatch.hex);
    ctx.fillStyle = INK;
    ctx.fillText(fitText(ctx, swatch.name, tileW, nameSize, nameSize - 4, 500), x, y + tileH + 10);
    ctx.fillStyle = SOFT_INK;
    ctx.font = font(400, hexSize);
    ctx.fillText(swatch.hex.toUpperCase(), x, y + tileH + 14 + nameSize);
  });
}

/**
 * The hero strip: all four palettes side by side, six shades each, drawn as one
 * unbroken run per season so the group reads as a palette instead of as a row of
 * loose chips.
 */
function drawSeasonStrips(ctx, top, height) {
  const gap = 32;
  const groupW = (CONTENT - gap * (SEASON_ORDER.length - 1)) / SEASON_ORDER.length;
  const nameSize = 20;
  SEASON_ORDER.forEach((id, group) => {
    const shades = SEASONS[id].wear.slice(0, 6);
    const x = MARGIN + group * (groupW + gap);
    const chipW = groupW / shades.length;
    ctx.save();
    roundRectPath(ctx, x, top, groupW, height, TILE_RADIUS);
    ctx.clip();
    shades.forEach((swatch, index) => {
      ctx.fillStyle = swatch.hex;
      // Overdrawn by a pixel so no seam of the background shows between shades.
      ctx.fillRect(x + index * chipW, top, chipW + 1, height);
    });
    ctx.restore();
    roundRectPath(ctx, x + 0.5, top + 0.5, groupW - 1, height - 1, TILE_RADIUS - 0.5);
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.fillText(fitText(ctx, SEASONS[id].name, groupW, nameSize, nameSize - 3, 500), x, top + height + 16);
  });
}

const written = [];

written.push(
  card('default', (ctx) => {
    ctx.fillStyle = INK;
    ctx.fillText(
      fitText(ctx, 'Find the colours that suit you', CONTENT, 76, 60, 400, DISPLAY),
      MARGIN,
      MARGIN + 16,
    );
    ctx.fillStyle = SOFT_INK;
    ctx.fillText(
      fitText(ctx, 'Free colour analysis from a photo or a quiz — getcolormatch.com', CONTENT, 29, 22, 400),
      MARGIN,
      MARGIN + 16 + 76 * 1.16,
    );
    // Pinned to the bottom margin rather than stacked under the words: the space
    // between the two blocks is the design.
    const stripH = 148;
    drawSeasonStrips(ctx, HEIGHT - MARGIN - 20 - 16 - stripH, stripH);
  }),
);

for (const id of SEASON_ORDER) {
  const season = SEASONS[id];
  written.push(
    card(id, (ctx) => {
      const top = drawHeader(ctx, `The ${season.name} colour palette`, season.tagline, 64);
      drawPalette(ctx, season.wear.slice(0, 10), top + 30);
    }),
  );
}

/** Season names are lowercase in running prose on the site, and the subtitle is
 * running prose: "A summer palette", but "An autumn palette". */
const article = (word) => (/^[aeiou]/i.test(word) ? 'An' : 'A');

for (const subtype of SUBTYPES) {
  const parent = SEASONS[subtype.parent].name.toLowerCase();
  const subtitle = subtype.neighbour
    ? `${article(parent)} ${parent} palette leaning towards ${SEASONS[subtype.neighbour].name.toLowerCase()}`
    : `${article(parent)} ${parent} palette`;
  written.push(
    card(subtype.id, (ctx) => {
      const top = drawHeader(ctx, subtype.name, subtitle, 64);
      drawPalette(ctx, subtypePalette(subtype).wear.slice(0, 10), top + 30);
    }),
  );
}

for (const file of written) console.log(file.pathname.split('/public/').pop());
if (truncated.length > 0) console.warn('truncated to fit:', [...new Set(truncated)].join(', '));
console.log('wrote', written.length, 'images');
