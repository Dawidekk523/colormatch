import { describe, expect, it } from 'vitest';
import { hexToRgb, rgbToHex } from '../src/lib/color';
import { isSkinPixel, readSkin, sampleDimensions, SAMPLE_SIZE } from '../src/lib/skin';
import { analyseSkinReading } from '../src/lib/season';

/**
 * Builds a frame the way a selfie is laid out: background, an oval of skin in
 * the middle, and a band of hair across the top of that oval.
 */
function makeFrame(options: {
  size?: number;
  background: string;
  skin: string;
  hair?: string;
  /** How wide the skin oval is, as a share of the frame. */
  faceScale?: number;
}) {
  const size = options.size ?? 60;
  const data = new Uint8ClampedArray(size * size * 4);
  const bg = hexToRgb(options.background);
  const skin = hexToRgb(options.skin);
  const hair = options.hair ? hexToRgb(options.hair) : null;
  const faceScale = options.faceScale ?? 0.32;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x - size / 2) / (size * faceScale);
      const ny = (y - size / 2) / (size * faceScale * 1.2);
      const inFace = nx * nx + ny * ny <= 1;
      const inHair = hair !== null && inFace && y < size * 0.42;
      const px = inHair ? hair : inFace ? skin : bg;
      const i = (y * size + x) * 4;
      data[i] = px.r;
      data[i + 1] = px.g;
      data[i + 2] = px.b;
      data[i + 3] = 255;
    }
  }
  return { data, width: size, height: size };
}

describe('isSkinPixel', () => {
  it('accepts skin tones across the light-to-deep range', () => {
    for (const hex of ['#f6dcd4', '#f0d2a8', '#c68642', '#a5683c', '#7a4a28']) {
      expect(isSkinPixel(hexToRgb(hex)), hex).toBe(true);
    }
  });

  it('rejects background, sky, greenery and near-black hair', () => {
    for (const hex of ['#ffffff', '#3b7fd4', '#2f8f3f', '#101010', '#8a8a8a']) {
      expect(isSkinPixel(hexToRgb(hex)), hex).toBe(false);
    }
  });
});

describe('readSkin', () => {
  it('recovers the skin colour from a photo-shaped frame', () => {
    const frame = makeFrame({ background: '#d8dee6', skin: '#f0d2a8' });
    const reading = readSkin(frame.data, frame.width, frame.height);
    expect(reading.coverage).toBeGreaterThan(0.3);
    expect(rgbToHex(reading.skin)).toBe('#f0d2a8');
  });

  it('ignores a background that happens to sit outside the centre', () => {
    const warm = readSkin(...frameArgs('#2f8f3f', '#f0d2a8'));
    const cool = readSkin(...frameArgs('#3b7fd4', '#f0d2a8'));
    expect(rgbToHex(warm.skin)).toBe(rgbToHex(cool.skin));
  });

  it('measures more contrast when the hair is dark than when it is pale', () => {
    const dark = readSkin(...frameArgs('#d8dee6', '#f0d2a8', '#1a1410'));
    const pale = readSkin(...frameArgs('#d8dee6', '#f0d2a8', '#ded3c4'));
    expect(dark.contrast).toBeGreaterThan(pale.contrast);
    expect(dark.contrast).toBeGreaterThan(45);
  });

  it('reports no coverage for a frame with no skin in it', () => {
    const frame = makeFrame({ background: '#d8dee6', skin: '#3b7fd4' });
    const reading = readSkin(frame.data, frame.width, frame.height);
    expect(reading.coverage).toBe(0);
    expect(analyseSkinReading(reading)).toBeNull();
  });

  it('reports thin coverage when the face is tiny in the frame', () => {
    const frame = makeFrame({ background: '#d8dee6', skin: '#f0d2a8', faceScale: 0.05 });
    const reading = readSkin(frame.data, frame.width, frame.height);
    expect(reading.coverage).toBeLessThan(0.06);
  });

  it('survives a fully transparent frame', () => {
    const data = new Uint8ClampedArray(20 * 20 * 4);
    const reading = readSkin(data, 20, 20);
    expect(reading.coverage).toBe(0);
  });

  it('classifies a light warm face with dark hair as Spring end to end', () => {
    const reading = readSkin(...frameArgs('#d8dee6', '#f0d2a8', '#1a1410'));
    expect(analyseSkinReading(reading)?.season).toBe('spring');
  });

  it('classifies a deep warm face as Autumn end to end', () => {
    const reading = readSkin(...frameArgs('#d8dee6', '#7a4a28', '#1a1410'));
    expect(analyseSkinReading(reading)?.season).toBe('autumn');
  });
});

function frameArgs(background: string, skin: string, hair?: string) {
  const frame = makeFrame({ background, skin, hair });
  return [frame.data, frame.width, frame.height] as const;
}

describe('sampleDimensions', () => {
  it('leaves small images alone', () => {
    expect(sampleDimensions(120, 90)).toEqual({ width: 120, height: 90 });
  });

  it('caps the longest edge and keeps the shape', () => {
    const out = sampleDimensions(4000, 3000);
    expect(Math.max(out.width, out.height)).toBe(SAMPLE_SIZE);
    expect(out.width / out.height).toBeCloseTo(4 / 3, 2);
  });

  it('never returns a zero-sized frame', () => {
    const out = sampleDimensions(4000, 3);
    expect(out.height).toBeGreaterThanOrEqual(1);
  });
});
