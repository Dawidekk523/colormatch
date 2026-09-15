import { individualTypologyAngle, labHueAngle, rgbToLab, type Rgb } from './color';
import type { SeasonId, Undertone } from './seasons-data';

export type Depth = 'light' | 'deep';
export type Clarity = 'clear' | 'soft';

export interface ColourTraits {
  undertone: Undertone;
  depth: Depth;
  clarity: Clarity;
}

/**
 * CIELAB hue-angle bands for skin. Golden skin lands high on the hue angle,
 * pink and blue-toned skin lands low; the narrow middle band is read as neutral
 * because an average colour cannot separate it reliably.
 */
export const UNDERTONE_COOL_MAX = 52;
export const UNDERTONE_WARM_MIN = 58;

/** Individual Typology Angle boundary between light and deep colouring. */
export const DEPTH_ITA_LIGHT_MIN = 28;

/** Lightness distance between skin and the darkest parts of the face crop. */
export const CLARITY_CONTRAST_MIN = 45;

export function undertoneFromHueAngle(hueAngle: number): Undertone {
  if (hueAngle <= UNDERTONE_COOL_MAX) return 'cool';
  if (hueAngle >= UNDERTONE_WARM_MIN) return 'warm';
  return 'neutral';
}

export function depthFromIta(ita: number): Depth {
  return ita >= DEPTH_ITA_LIGHT_MIN ? 'light' : 'deep';
}

export function clarityFromContrast(contrast: number): Clarity {
  return contrast >= CLARITY_CONTRAST_MIN ? 'clear' : 'soft';
}

/**
 * The four-season grid. Warm/cool sets the half, light/deep sets the season
 * inside it. A neutral undertone has no half of its own, so clarity decides:
 * clear colouring goes to the bright season, soft colouring to the muted one.
 */
export function seasonFromTraits({ undertone, depth, clarity }: ColourTraits): SeasonId {
  if (undertone === 'warm') return depth === 'light' ? 'spring' : 'autumn';
  if (undertone === 'cool') return depth === 'light' ? 'summer' : 'winter';
  if (clarity === 'clear') return depth === 'light' ? 'spring' : 'winter';
  return depth === 'light' ? 'summer' : 'autumn';
}

export interface SkinReading {
  /** Average colour of the skin pixels found in the photo. */
  skin: Rgb;
  /** Share of sampled pixels that looked like skin, 0–1. */
  coverage: number;
  /** Lightness gap between skin and the darkest part of the crop (hair, eyes, brows). */
  contrast: number;
}

export interface AnalysisResult extends ColourTraits {
  season: SeasonId;
  hueAngle: number;
  ita: number;
  /** 0–1. Low values mean the photo gave us little to work with. */
  confidence: number;
}

/** Below this share of skin pixels we refuse to guess rather than invent a season. */
export const MIN_SKIN_COVERAGE = 0.06;

export function analyseSkinReading(reading: SkinReading): AnalysisResult | null {
  if (reading.coverage < MIN_SKIN_COVERAGE) return null;

  const lab = rgbToLab(reading.skin);
  const hueAngle = labHueAngle(lab);
  const ita = individualTypologyAngle(lab);

  const undertone = undertoneFromHueAngle(hueAngle);
  const depth = depthFromIta(ita);
  const clarity = clarityFromContrast(reading.contrast);

  // Confidence grows with how much skin we found and how far the undertone sits
  // from the band edges, where the reading could tip either way.
  const coverageScore = Math.min(1, reading.coverage / 0.3);
  const edgeDistance = Math.min(
    Math.abs(hueAngle - UNDERTONE_COOL_MAX),
    Math.abs(hueAngle - UNDERTONE_WARM_MIN),
  );
  const undertoneScore = Math.min(1, edgeDistance / 12);
  const confidence = Math.round((0.55 * coverageScore + 0.45 * undertoneScore) * 100) / 100;

  return {
    season: seasonFromTraits({ undertone, depth, clarity }),
    undertone,
    depth,
    clarity,
    hueAngle,
    ita,
    confidence,
  };
}
