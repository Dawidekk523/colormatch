import { describe, expect, it } from 'vitest';
import { UNDERTONE_LIST, undertonePalette } from '../src/lib/undertones';
import { SEASONS } from '../src/lib/seasons-data';
import { hexToRgb, labChroma, rgbToLab } from '../src/lib/color';

const everyShade = new Set(
  Object.values(SEASONS)
    .flatMap((season) => [...season.wear, ...season.neutrals, ...season.avoid])
    .map((swatch) => swatch.hex.toLowerCase()),
);
const chromaOf = (hex: string) => labChroma(rgbToLab(hexToRgb(hex)));
const mean = (values: number[]) => values.reduce((a, b) => a + b, 0) / values.length;

describe('undertone palettes', () => {
  it('has a page for each undertone, with unique slugs', () => {
    expect(UNDERTONE_LIST).toHaveLength(4);
    expect(new Set(UNDERTONE_LIST.map((group) => group.slug)).size).toBe(4);
  });

  it('invents no colours', () => {
    for (const group of UNDERTONE_LIST) {
      const palette = undertonePalette(group);
      for (const swatch of [...palette.wear, ...palette.avoid]) {
        expect(everyShade.has(swatch.hex.toLowerCase())).toBe(true);
      }
    }
  });

  it('draws five shades from each of the two seasons that share the undertone', () => {
    for (const group of UNDERTONE_LIST) {
      const { wear } = undertonePalette(group);
      expect(wear).toHaveLength(10);
      for (const [index, season] of group.seasons.entries()) {
        const hexes = new Set(SEASONS[season].wear.map((swatch) => swatch.hex.toLowerCase()));
        for (const swatch of wear.slice(index * 5, index * 5 + 5)) {
          expect(hexes.has(swatch.hex.toLowerCase())).toBe(true);
        }
      }
    }
  });

  it('warns about the shades those same seasons struggle with, never the ones it recommends', () => {
    for (const group of UNDERTONE_LIST) {
      const { wear, avoid } = undertonePalette(group);
      const avoidable = new Set(group.seasons.flatMap((s) => SEASONS[s].avoid.map((x) => x.hex.toLowerCase())));
      const wearHexes = new Set(wear.map((swatch) => swatch.hex.toLowerCase()));
      expect(avoid.length).toBeGreaterThan(3);
      for (const swatch of avoid) {
        expect(avoidable.has(swatch.hex.toLowerCase())).toBe(true);
        expect(wearHexes.has(swatch.hex.toLowerCase())).toBe(false);
      }
    }
  });

  it('gives neutral and olive quieter colours than warm and cool', () => {
    const strength = Object.fromEntries(
      UNDERTONE_LIST.map((group) => [group.id, mean(undertonePalette(group).wear.map((s) => chromaOf(s.hex)))]),
    );
    expect(strength.neutral).toBeLessThan(strength.warm!);
    expect(strength.olive).toBeLessThan(strength.cool!);
  });
});
