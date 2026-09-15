import { describe, expect, it } from 'vitest';
import {
  analyseSkinReading,
  clarityFromContrast,
  depthFromIta,
  MIN_SKIN_COVERAGE,
  seasonFromTraits,
  undertoneFromHueAngle,
} from '../src/lib/season';
import { hexToRgb } from '../src/lib/color';
import { SEASONS, SEASON_ORDER } from '../src/lib/seasons-data';

describe('undertone bands', () => {
  it('reads low hue angles as cool and high ones as warm', () => {
    expect(undertoneFromHueAngle(30)).toBe('cool');
    expect(undertoneFromHueAngle(52)).toBe('cool');
    expect(undertoneFromHueAngle(58)).toBe('warm');
    expect(undertoneFromHueAngle(80)).toBe('warm');
  });

  it('keeps the middle band neutral', () => {
    expect(undertoneFromHueAngle(55)).toBe('neutral');
  });
});

describe('depth and clarity', () => {
  it('splits light from deep at the ITA boundary', () => {
    expect(depthFromIta(28)).toBe('light');
    expect(depthFromIta(27.9)).toBe('deep');
    expect(depthFromIta(-40)).toBe('deep');
  });

  it('calls a big skin-to-hair gap clear', () => {
    expect(clarityFromContrast(60)).toBe('clear');
    expect(clarityFromContrast(10)).toBe('soft');
  });
});

describe('the four-season grid', () => {
  it('maps every warm and cool combination', () => {
    expect(seasonFromTraits({ undertone: 'warm', depth: 'light', clarity: 'clear' })).toBe('spring');
    expect(seasonFromTraits({ undertone: 'warm', depth: 'deep', clarity: 'soft' })).toBe('autumn');
    expect(seasonFromTraits({ undertone: 'cool', depth: 'light', clarity: 'soft' })).toBe('summer');
    expect(seasonFromTraits({ undertone: 'cool', depth: 'deep', clarity: 'clear' })).toBe('winter');
  });

  it('ignores clarity when the undertone is decided', () => {
    expect(seasonFromTraits({ undertone: 'warm', depth: 'light', clarity: 'soft' })).toBe('spring');
    expect(seasonFromTraits({ undertone: 'cool', depth: 'deep', clarity: 'soft' })).toBe('winter');
  });

  it('uses clarity to break a neutral tie', () => {
    expect(seasonFromTraits({ undertone: 'neutral', depth: 'light', clarity: 'clear' })).toBe('spring');
    expect(seasonFromTraits({ undertone: 'neutral', depth: 'light', clarity: 'soft' })).toBe('summer');
    expect(seasonFromTraits({ undertone: 'neutral', depth: 'deep', clarity: 'clear' })).toBe('winter');
    expect(seasonFromTraits({ undertone: 'neutral', depth: 'deep', clarity: 'soft' })).toBe('autumn');
  });

  it('can reach all four seasons and nothing else', () => {
    const reached = new Set<string>();
    for (const undertone of ['warm', 'cool', 'neutral'] as const) {
      for (const depth of ['light', 'deep'] as const) {
        for (const clarity of ['clear', 'soft'] as const) {
          reached.add(seasonFromTraits({ undertone, depth, clarity }));
        }
      }
    }
    expect([...reached].sort()).toEqual([...SEASON_ORDER].sort());
  });
});

describe('analyseSkinReading', () => {
  it('refuses to guess when almost no skin was found', () => {
    expect(
      analyseSkinReading({ skin: hexToRgb('#f0d2a8'), coverage: MIN_SKIN_COVERAGE - 0.01, contrast: 50 }),
    ).toBeNull();
  });

  it('reads light golden skin with dark hair as Spring', () => {
    const result = analyseSkinReading({ skin: hexToRgb('#f0d2a8'), coverage: 0.35, contrast: 55 });
    expect(result?.undertone).toBe('warm');
    expect(result?.depth).toBe('light');
    expect(result?.season).toBe('spring');
  });

  it('reads light pink skin with soft contrast as Summer', () => {
    const result = analyseSkinReading({ skin: hexToRgb('#efc9bb'), coverage: 0.3, contrast: 20 });
    expect(result?.undertone).toBe('cool');
    expect(result?.season).toBe('summer');
  });

  it('reads deep golden skin as Autumn', () => {
    const result = analyseSkinReading({ skin: hexToRgb('#7a4a28'), coverage: 0.4, contrast: 20 });
    expect(result?.undertone).toBe('warm');
    expect(result?.depth).toBe('deep');
    expect(result?.season).toBe('autumn');
  });

  it('reads deep cool skin with strong contrast as Winter', () => {
    const result = analyseSkinReading({ skin: hexToRgb('#6b4442'), coverage: 0.4, contrast: 60 });
    expect(result?.undertone).toBe('cool');
    expect(result?.season).toBe('winter');
  });

  it('reports lower confidence for thin coverage and borderline undertones', () => {
    const strong = analyseSkinReading({ skin: hexToRgb('#f0d2a8'), coverage: 0.4, contrast: 50 })!;
    const weak = analyseSkinReading({ skin: hexToRgb('#d9bda2'), coverage: 0.07, contrast: 50 })!;
    expect(strong.confidence).toBeGreaterThan(weak.confidence);
    expect(weak.confidence).toBeGreaterThanOrEqual(0);
    expect(strong.confidence).toBeLessThanOrEqual(1);
  });
});

describe('season data', () => {
  it('has a full palette for every season', () => {
    for (const id of SEASON_ORDER) {
      const season = SEASONS[id];
      expect(season.wear.length).toBeGreaterThanOrEqual(8);
      expect(season.avoid.length).toBeGreaterThanOrEqual(3);
      expect(season.neutrals.length).toBeGreaterThanOrEqual(3);
      for (const swatch of [...season.wear, ...season.neutrals, ...season.avoid]) {
        expect(swatch.hex).toMatch(/^#[0-9a-f]{6}$/);
        expect(() => hexToRgb(swatch.hex)).not.toThrow();
        expect(swatch.name.length).toBeGreaterThan(2);
      }
    }
  });

  it('agrees with the rules it is meant to describe', () => {
    for (const id of SEASON_ORDER) {
      const s = SEASONS[id];
      expect(seasonFromTraits({ undertone: s.undertone, depth: s.depth, clarity: s.contrast })).toBe(id);
    }
  });
});
