/**
 * The share image is the only part of a result that travels off the site, so it
 * is drawn here rather than screenshotted: a canvas gives us the same typography
 * and the same palette on every device, and it costs no dependency.
 *
 * Both orientations are described by a `Layout` record instead of a single scale
 * factor. A story-shaped 1080x1350 wants a tall stack and a 1600x900 wants two
 * columns, and stretching one into the other looks accidental — so each size
 * gets its own numbers while the section drawers stay shared.
 */

export interface ShareSwatch {
  name: string;
  hex: string;
}

export interface ShareAxis {
  label: string;
  leftLabel: string;
  rightLabel: string;
  /** -100..100, negative leans towards `leftLabel`. */
  value: number;
}

export interface ShareData {
  seasonName: string;
  subtypeName: string;
  undertoneLabel: string;
  tagline: string;
  confidencePct: number;
  axes: ShareAxis[];
  wear: ShareSwatch[];
  neutrals: ShareSwatch[];
  avoid: ShareSwatch[];
  site: string;
}

export type ShareOrientation = 'portrait' | 'landscape';

export const SHARE_SIZE: Record<ShareOrientation, { width: number; height: number }> = {
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1600, height: 900 },
};

const SURFACE = '#f7f4ef';
const INK = '#15161a';
const SOFT_INK = '#54585f';
const HAIRLINE = 'rgba(21,22,26,0.12)';

const DISPLAY = '"Iowan Old Style", "Palatino Linotype", Palatino, "Hoefler Text", Georgia, serif';
const TEXT = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const font = (weight: number, size: number, family: string = TEXT): string =>
  `${weight} ${size}px ${family}`;

interface Layout {
  margin: number;
  section: number;
  seasonSize: number;
  metaSize: number;
  taglineSize: number;
  headingSize: number;
  nameSize: number;
  hexSize: number;
  tileRadius: number;
  tileGap: number;
  wearPerRow: number;
  wearTileH: number;
  neutralTileH: number;
  axisBlock: number;
  avoidRadius: number;
}

const LAYOUT: Record<ShareOrientation, Layout> = {
  portrait: {
    margin: 72,
    section: 36,
    seasonSize: 104,
    metaSize: 30,
    taglineSize: 26,
    headingSize: 24,
    nameSize: 18,
    hexSize: 15,
    tileRadius: 16,
    tileGap: 16,
    wearPerRow: 5,
    wearTileH: 96,
    neutralTileH: 60,
    axisBlock: 80,
    avoidRadius: 20,
  },
  landscape: {
    /* Sized up against the portrait layout rather than copied from it: a wide
       canvas that keeps phone-sized type looks like a mistake on a screen. */
    margin: 76,
    section: 40,
    seasonSize: 100,
    metaSize: 29,
    taglineSize: 25,
    headingSize: 26,
    nameSize: 19,
    hexSize: 16,
    tileRadius: 16,
    tileGap: 18,
    wearPerRow: 5,
    wearTileH: 124,
    neutralTileH: 78,
    axisBlock: 106,
    avoidRadius: 22,
  },
};

/** `roundRect` is widely available but not everywhere, and a bare truthiness
 * check on a declared method upsets strict TypeScript, hence the typeof. */
function roundRectPath(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number,
): void {
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
function drawTile(
  ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, hex: string,
): void {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = hex;
  ctx.fill();
  roundRectPath(ctx, x + 0.5, y + 0.5, w - 1, h - 1, r - 0.5);
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Colour names are user-facing data of unknown length, so a label first shrinks
 * a little and then loses its tail rather than running into its neighbour.
 * Sets `ctx.font` as a side effect; the caller draws immediately after.
 */
function fitText(
  ctx: CanvasRenderingContext2D, text: string, maxWidth: number,
  size: number, minSize: number, weight: number, family: string = TEXT,
): string {
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
  return `${clipped.trim()}…`;
}

function drawIdentity(
  ctx: CanvasRenderingContext2D, l: Layout, x: number, w: number, top: number, data: ShareData,
): number {
  let y = top;
  ctx.fillStyle = INK;
  ctx.fillText(fitText(ctx, data.seasonName, w, l.seasonSize, l.seasonSize - 24, 400, DISPLAY), x, y);
  y += l.seasonSize * 1.06;

  const meta = `${data.subtypeName} · ${data.undertoneLabel} · ${Math.round(clamp(data.confidencePct, 0, 100))}% match`;
  ctx.fillStyle = INK;
  ctx.fillText(fitText(ctx, meta, w, l.metaSize, l.metaSize - 8, 600), x, y);
  y += l.metaSize * 1.4;

  ctx.fillStyle = SOFT_INK;
  ctx.fillText(fitText(ctx, data.tagline, w, l.taglineSize, l.taglineSize - 6, 400), x, y);
  return y + l.taglineSize * 1.3;
}

function drawHeading(ctx: CanvasRenderingContext2D, l: Layout, x: number, y: number, label: string): number {
  ctx.fillStyle = INK;
  ctx.font = font(600, l.headingSize);
  ctx.fillText(label, x, y);
  return y + l.headingSize * 1.5;
}

function drawSwatchRows(
  ctx: CanvasRenderingContext2D, l: Layout, x: number, w: number, top: number,
  swatches: ShareSwatch[], perRow: number, tileH: number, withHex: boolean,
): number {
  const tileW = (w - l.tileGap * (perRow - 1)) / perRow;
  const rowH = tileH + 10 + l.nameSize + (withHex ? 4 + l.hexSize : 0);
  let y = top;
  swatches.forEach((swatch, index) => {
    const col = index % perRow;
    const row = Math.floor(index / perRow);
    const tileX = x + col * (tileW + l.tileGap);
    const tileY = y + row * (rowH + l.tileGap);
    drawTile(ctx, tileX, tileY, tileW, tileH, l.tileRadius, swatch.hex);
    ctx.fillStyle = INK;
    ctx.fillText(fitText(ctx, swatch.name, tileW, l.nameSize, l.nameSize - 4, 500), tileX, tileY + tileH + 10);
    if (withHex) {
      ctx.fillStyle = SOFT_INK;
      ctx.font = font(400, l.hexSize);
      ctx.fillText(swatch.hex.toUpperCase(), tileX, tileY + tileH + 14 + l.nameSize);
    }
  });
  const rows = Math.max(1, Math.ceil(swatches.length / perRow));
  y += rows * rowH + (rows - 1) * l.tileGap;
  return y;
}

/**
 * The meter is a plain track with a single filled marker: a share image is read
 * at thumbnail size, so position carries the meaning and the number is there for
 * anyone who zooms in.
 */
function drawAxes(
  ctx: CanvasRenderingContext2D, l: Layout, x: number, w: number, top: number, axes: ShareAxis[],
): number {
  const markerR = 9;
  const trackH = 8;
  let y = top;
  for (const axis of axes) {
    const value = clamp(axis.value, -100, 100);
    ctx.fillStyle = INK;
    ctx.font = font(600, l.headingSize - 3);
    ctx.fillText(axis.label, x, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = SOFT_INK;
    ctx.font = font(400, l.headingSize - 3);
    // The side it leans to, then the distance — the same way the report reads,
    // so a number on the picture means what it meant on the page.
    ctx.fillText(
      `${value < 0 ? axis.leftLabel : axis.rightLabel} ${Math.abs(Math.round(value))}`,
      x + w,
      y,
    );
    ctx.textAlign = 'left';

    const trackY = y + l.headingSize * 1.4;
    roundRectPath(ctx, x, trackY, w, trackH, trackH / 2);
    ctx.fillStyle = HAIRLINE;
    ctx.fill();

    // Inset by the marker radius so a reading of exactly +/-100 still sits whole
    // on the track instead of hanging off its end.
    const markerX = x + markerR + ((value + 100) / 200) * (w - markerR * 2);
    ctx.beginPath();
    ctx.arc(markerX, trackY + trackH / 2, markerR, 0, Math.PI * 2);
    ctx.fillStyle = INK;
    ctx.fill();

    const labelY = trackY + trackH + 12;
    ctx.fillStyle = SOFT_INK;
    ctx.font = font(400, l.nameSize);
    ctx.fillText(axis.leftLabel, x, labelY);
    ctx.textAlign = 'right';
    ctx.fillText(axis.rightLabel, x + w, labelY);
    ctx.textAlign = 'left';
    y += l.axisBlock + l.nameSize;
  }
  return y;
}

function drawAvoid(
  ctx: CanvasRenderingContext2D, l: Layout, x: number, w: number, top: number, swatches: ShareSwatch[],
): number {
  const r = l.avoidRadius;
  const slot = swatches.length > 0 ? w / swatches.length : w;
  swatches.forEach((swatch, index) => {
    const cx = x + index * slot + r;
    ctx.beginPath();
    ctx.arc(cx, top + r, r, 0, Math.PI * 2);
    ctx.fillStyle = swatch.hex;
    ctx.fill();
    ctx.strokeStyle = HAIRLINE;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = SOFT_INK;
    ctx.fillText(
      fitText(ctx, swatch.name, slot - l.tileGap, l.nameSize, l.nameSize - 4, 400),
      cx - r,
      top + r * 2 + 10,
    );
  });
  return top + r * 2 + 10 + l.nameSize;
}

function drawSite(ctx: CanvasRenderingContext2D, l: Layout, x: number, y: number, site: string, align: CanvasTextAlign): void {
  ctx.textAlign = align;
  ctx.fillStyle = SOFT_INK;
  ctx.font = font(500, l.nameSize + 3);
  ctx.fillText(site, x, y);
  ctx.textAlign = 'left';
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

function drawPortrait(ctx: CanvasRenderingContext2D, data: ShareData, l: Layout): void {
  const { width, height } = SHARE_SIZE.portrait;
  const x = l.margin;
  const w = width - l.margin * 2;

  let y = drawIdentity(ctx, l, x, w, l.margin + 8, data);
  y += l.section;
  y = drawSwatchRows(ctx, l, x, w, y, data.wear, l.wearPerRow, l.wearTileH, true);
  y += l.section;
  y = drawHeading(ctx, l, x, y, 'Neutrals');
  y = drawSwatchRows(ctx, l, x, w, y, data.neutrals, 4, l.neutralTileH, false);
  y += l.section;
  y = drawAxes(ctx, l, x, w, y, data.axes);
  y += l.section - 12;
  y = drawHeading(ctx, l, x, y, 'Avoid');
  drawAvoid(ctx, l, x, w, y, data.avoid);

  drawSite(ctx, l, x, height - l.margin - l.nameSize - 3, data.site, 'left');
}

function drawLandscape(ctx: CanvasRenderingContext2D, data: ShareData, l: Layout): void {
  const { width, height } = SHARE_SIZE.landscape;
  const gutter = 72;
  const leftW = Math.round((width - l.margin * 2 - gutter) * 0.4);
  const rightX = l.margin + leftW + gutter;
  const rightW = width - l.margin - rightX;

  let left = drawIdentity(ctx, l, l.margin, leftW, l.margin + 16, data);
  left += l.section;
  drawAxes(ctx, l, l.margin, leftW, left, data.axes);

  let right = l.margin + 16;
  right = drawSwatchRows(ctx, l, rightX, rightW, right, data.wear, l.wearPerRow, l.wearTileH, true);
  right += l.section;
  right = drawHeading(ctx, l, rightX, right, 'Neutrals');
  right = drawSwatchRows(ctx, l, rightX, rightW, right, data.neutrals, 4, l.neutralTileH, false);
  right += l.section;
  right = drawHeading(ctx, l, rightX, right, 'Avoid');
  drawAvoid(ctx, l, rightX, rightW, right, data.avoid);

  // Under the axes rather than under the palette: the right column grows with
  // the number of colours and would run into a line pinned to that corner.
  drawSite(ctx, l, l.margin, height - l.margin - l.nameSize - 3, data.site, 'left');
}

export function drawShareImage(canvas: HTMLCanvasElement, data: ShareData, orientation: ShareOrientation): void {
  const size = SHARE_SIZE[orientation];
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context is unavailable');

  ctx.fillStyle = SURFACE;
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // The caps in the types are a promise about our own data, not about whatever
  // a stored result from an older version happens to hold.
  const safe: ShareData = {
    ...data,
    axes: data.axes.slice(0, 3),
    wear: data.wear.slice(0, 10),
    neutrals: data.neutrals.slice(0, 4),
    avoid: data.avoid.slice(0, 5),
  };

  const layout = LAYOUT[orientation];
  if (orientation === 'portrait') drawPortrait(ctx, safe, layout);
  else drawLandscape(ctx, safe, layout);
}

export async function shareImageBlob(data: ShareData, orientation: ShareOrientation): Promise<Blob> {
  const canvas = document.createElement('canvas');
  drawShareImage(canvas, data, orientation);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not encode the share image'));
    }, 'image/png');
  });
}

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'result';

export async function downloadShareImage(data: ShareData, orientation: ShareOrientation): Promise<void> {
  const blob = await shareImageBlob(data, orientation);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `colormatch-${slugify(data.seasonName)}-${orientation}.png`;
  // Firefox only follows a link that is in the document, and revoking the URL on
  // the same tick can cancel a download that has not started fetching yet.
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
