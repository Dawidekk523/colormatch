import { describe, expect, it } from 'vitest';
import { SUBTYPES, subtypePalette } from '../src/lib/subtypes';
import { SEASONS } from '../src/lib/seasons-data';
import { hexToRgb, labChroma, rgbToLab } from '../src/lib/color';

const everyShade = new Set(
  Object.values(SEASONS)
    .flatMap((season) => [...season.wear, ...season.neutrals, ...season.avoid])
    .map((swatch) => swatch.hex.toLowerCase()),
);

const lightnessOf = (hex: string) => rgbToLab(hexToRgb(hex)).l;
const chromaOf = (hex: string) => labChroma(rgbToLab(hexToRgb(hex)));
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

describe('the twelve subtypes', () => {
  it('covers every parent season three times, with unique slugs', () => {
    expect(SUBTYPES).toHaveLength(12);
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
      expect(SUBTYPES.filter((s) => s.parent === season)).toHaveLength(3);
    }
    expect(new Set(SUBTYPES.map((s) => s.slug)).size).toBe(12);
    expect(new Set(SUBTYPES.map((s) => s.id)).size).toBe(12);
  });

  it('invents no colours — every shade comes from a real palette', () => {
    for (const subtype of SUBTYPES) {
      const palette = subtypePalette(subtype);
      for (const swatch of [...palette.wear, ...palette.neutrals, ...palette.avoid]) {
        expect(everyShade.has(swatch.hex.toLowerCase())).toBe(true);
      }
    }
  });

  it('gives each subtype a usable palette with no repeats', () => {
    for (const subtype of SUBTYPES) {
      const { wear } = subtypePalette(subtype);
      expect(wear.length).toBeGreaterThanOrEqual(9);
      expect(new Set(wear.map((s) => s.hex.toLowerCase())).size).toBe(wear.length);
    }
  });

  it('leans the way its name says it does', () => {
    for (const subtype of SUBTYPES) {
      if (subtype.lean === 'true') continue;
      const parentWear = SEASONS[subtype.parent].wear;
      const subtypeWear = subtypePalette(subtype).wear;

      if (subtype.lean === 'light' || subtype.lean === 'deep') {
        const parentMean = mean(parentWear.map((s) => lightnessOf(s.hex)));
        const subtypeMean = mean(subtypeWear.map((s) => lightnessOf(s.hex)));
        if (subtype.lean === 'light') expect(subtypeMean).toBeGreaterThan(parentMean);
        else expect(subtypeMean).toBeLessThan(parentMean);
      } else {
        const parentMean = mean(parentWear.map((s) => chromaOf(s.hex)));
        const subtypeMean = mean(subtypeWear.map((s) => chromaOf(s.hex)));
        if (subtype.lean === 'bright') expect(subtypeMean).toBeGreaterThan(parentMean);
        else expect(subtypeMean).toBeLessThan(parentMean);
      }
    }
  });

  it('borrows from the neighbour it leans towards, and only from there', () => {
    for (const subtype of SUBTYPES) {
      const parentHexes = new Set(SEASONS[subtype.parent].wear.map((s) => s.hex.toLowerCase()));
      const borrowed = subtypePalette(subtype).wear.filter((s) => !parentHexes.has(s.hex.toLowerCase()));
      if (!subtype.neighbour) {
        expect(borrowed).toHaveLength(0);
        continue;
      }
      const neighbourHexes = new Set(SEASONS[subtype.neighbour].wear.map((s) => s.hex.toLowerCase()));
      expect(borrowed.length).toBeGreaterThan(0);
      for (const swatch of borrowed) expect(neighbourHexes.has(swatch.hex.toLowerCase())).toBe(true);
    }
  });
});
