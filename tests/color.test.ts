import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  hexToRgb,
  individualTypologyAngle,
  labChroma,
  labHueAngle,
  readableTextColor,
  rgbToHex,
  rgbToLab,
  rgbToYCbCr,
} from '../src/lib/color';

describe('hex conversion', () => {
  it('parses long and short hex, with or without a hash', () => {
    expect(hexToRgb('#ff8800')).toEqual({ r: 255, g: 136, b: 0 });
    expect(hexToRgb('f80')).toEqual({ r: 255, g: 136, b: 0 });
  });

  it('rejects anything that is not a colour', () => {
    expect(() => hexToRgb('#ggg')).toThrow();
    expect(() => hexToRgb('#ff88')).toThrow();
  });

  it('round-trips through rgb', () => {
    expect(rgbToHex(hexToRgb('#1f4fa3'))).toBe('#1f4fa3');
  });

  it('clamps out-of-range channels', () => {
    expect(rgbToHex({ r: -20, g: 300, b: 12.4 })).toBe('#00ff0c');
  });
});

describe('WCAG contrast', () => {
  it('gives 21 for black on white and 1 for a colour on itself', () => {
    expect(contrastRatio(hexToRgb('#000000'), hexToRgb('#ffffff'))).toBeCloseTo(21, 5);
    expect(contrastRatio(hexToRgb('#c5102c'), hexToRgb('#c5102c'))).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    const a = hexToRgb('#1f4fa3');
    const b = hexToRgb('#f4ead6');
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 10);
  });

  it('picks the text colour that actually passes AA on the swatch', () => {
    expect(readableTextColor(hexToRgb('#f0cdd8'))).toBe('#000000');
    expect(readableTextColor(hexToRgb('#14483c'))).toBe('#ffffff');
    for (const hex of ['#e8734a', '#8fb3d1', '#a9552c', '#1f4fa3']) {
      const bg = hexToRgb(hex);
      expect(contrastRatio(bg, hexToRgb(readableTextColor(bg)))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('lab', () => {
  it('maps white and black to the ends of the lightness scale', () => {
    expect(rgbToLab({ r: 255, g: 255, b: 255 }).l).toBeCloseTo(100, 3);
    expect(rgbToLab({ r: 0, g: 0, b: 0 }).l).toBeCloseTo(0, 6);
  });

  it('gives grey zero chroma', () => {
    expect(labChroma(rgbToLab({ r: 128, g: 128, b: 128 }))).toBeLessThan(0.01);
  });

  it('puts golden skin at a higher hue angle than pink skin', () => {
    const golden = labHueAngle(rgbToLab(hexToRgb('#f0d2a8')));
    const pink = labHueAngle(rgbToLab(hexToRgb('#efc9bb')));
    expect(golden).toBeGreaterThan(pink);
  });

  it('gives light skin a high ITA and deep skin a negative one', () => {
    expect(individualTypologyAngle(rgbToLab(hexToRgb('#f6dcd4')))).toBeGreaterThan(50);
    expect(individualTypologyAngle(rgbToLab(hexToRgb('#7a4a28')))).toBeLessThan(0);
  });
});

describe('ycbcr', () => {
  it('leaves grey with neutral chroma channels', () => {
    const { cb, cr } = rgbToYCbCr({ r: 100, g: 100, b: 100 });
    expect(cb).toBeCloseTo(128, 6);
    expect(cr).toBeCloseTo(128, 6);
  });
});
