import { rgbToLab, rgbToYCbCr, type Rgb } from './color';
import type { SkinReading } from './season';

/** Longest edge the photo is scaled down to before we read pixels. */
export const SAMPLE_SIZE = 200;

/**
 * Classic YCbCr skin-tone band plus an RGB sanity rule. It is deliberately
 * permissive about lightness so it works across skin tones, and strict about
 * chroma so walls, clothing and hair fall out.
 */
export function isSkinPixel(rgb: Rgb): boolean {
  const { r, g, b } = rgb;
  if (r <= 40 || r <= b) return false;
  if (r - Math.min(g, b) < 12) return false;

  const { y, cb, cr } = rgbToYCbCr(rgb);
  if (y < 40 || y > 245) return false;
  return cb >= 77 && cb <= 130 && cr >= 133 && cr <= 178;
}

/**
 * Reads an already-downscaled frame. Only the central ellipse is considered,
 * because that is where a face sits in a selfie and it keeps the background out.
 */
export function readSkin(data: Uint8ClampedArray, width: number, height: number): SkinReading {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.42;
  const ry = height * 0.46;

  let considered = 0;
  const skinLightness: number[] = [];
  const cropLightness: number[] = [];
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  const skinPixels: Rgb[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny > 1) continue;

      const i = (y * width + x) * 4;
      if (data[i + 3]! < 128) continue;

      const rgb: Rgb = { r: data[i]!, g: data[i + 1]!, b: data[i + 2]! };
      considered += 1;
      cropLightness.push(rgbToLab(rgb).l);

      if (isSkinPixel(rgb)) {
        skinPixels.push(rgb);
        skinLightness.push(rgbToLab(rgb).l);
      }
    }
  }

  if (considered === 0 || skinPixels.length === 0) {
    return { skin: { r: 0, g: 0, b: 0 }, coverage: 0, contrast: 0 };
  }

  // Trim the darkest and lightest fifth of the skin pixels so that shadow and
  // flare do not drag the average colour away from the real skin tone.
  const sorted = [...skinLightness].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.2)]!;
  const high = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.8))]!;

  let kept = 0;
  for (let i = 0; i < skinPixels.length; i += 1) {
    const l = skinLightness[i]!;
    if (l < low || l > high) continue;
    const px = skinPixels[i]!;
    sumR += px.r;
    sumG += px.g;
    sumB += px.b;
    kept += 1;
  }

  if (kept === 0) {
    for (const px of skinPixels) {
      sumR += px.r;
      sumG += px.g;
      sumB += px.b;
      kept += 1;
    }
  }

  // Hair, brows and eyes are the dark end of the crop; the gap to the skin
  // tells us whether the person's overall colouring is high or low contrast.
  const cropSorted = [...cropLightness].sort((a, b) => a - b);
  const darkest = cropSorted[Math.floor(cropSorted.length * 0.05)]!;
  const skinMedian = sorted[Math.floor(sorted.length * 0.5)]!;

  return {
    skin: { r: sumR / kept, g: sumG / kept, b: sumB / kept },
    coverage: skinPixels.length / considered,
    contrast: Math.max(0, skinMedian - darkest),
  };
}

/** Scaled-down dimensions that keep the aspect ratio, capped at SAMPLE_SIZE. */
export function sampleDimensions(width: number, height: number, cap = SAMPLE_SIZE) {
  const longest = Math.max(width, height);
  if (longest <= cap) return { width: Math.max(1, width), height: Math.max(1, height) };
  const scale = cap / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
