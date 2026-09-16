import { hexToRgb, labChroma, rgbToLab } from './color';
import type { IconName } from './icons';
import { SEASONS, UNDERTONE_LABEL, type SeasonId, type Swatch, type Undertone } from './seasons-data';
import { SUBTYPES, subtypePalette, type Lean, type Subtype } from './subtypes';

/**
 * Everything the paid report shows beyond the free one is worked out here, from
 * the same reading the free result already used. Nothing is invented for the
 * sake of filling a page: every number on the report comes from a measurement
 * the browser made (a photo) or a point the visitor scored (the quiz), and the
 * report says which.
 */

/** Where a reading sits on each axis, −100 to 100. */
export interface ResultMetrics {
  /** Negative is cool, positive is warm. */
  warm: number;
  /** Negative is deep, positive is light. */
  light: number;
  /** Negative is soft, positive is clear. */
  clear: number;
  /** Photo readings, in the units the analysis uses. */
  hueAngle?: number;
  ita?: number;
  contrast?: number;
  coverage?: number;
  /** Quiz points, before they are turned into the axes above. */
  points?: { warm: number; light: number; clear: number };
}

const clamp = (value: number, min = -100, max = 100) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value);

/**
 * A reading that lands exactly on a boundary has to fall the same way here as
 * it did when the season was decided, or the report would argue with its own
 * headline. `side` is the direction that boundary belongs to.
 */
const nudge = (value: number, side: 1 | -1) => (value === 0 ? side : value);

/**
 * Quiz points are small integers, so each axis is divided by the score a
 * decisive set of answers reaches rather than by the theoretical maximum — a
 * visitor who answers every warm question warm should read as fully warm, not
 * as four fifths of the way there.
 */
export function metricsFromQuiz(points: { warm: number; light: number; clear: number }): ResultMetrics {
  return {
    warm: round(clamp((points.warm / 8) * 100)),
    // An even split on depth counts as light and on clarity as soft, which is
    // how the quiz itself reads those two answers.
    light: nudge(round(clamp((points.light / 4) * 100)), 1),
    clear: nudge(round(clamp((points.clear / 4) * 100)), -1),
    points,
  };
}

/**
 * The photo axes are the same thresholds the analysis already uses, expressed
 * as a distance from the middle of each band instead of a yes/no: 55° is the
 * midpoint of the undertone bands, 28 the light/deep boundary of the typology
 * angle, 45 the clear/soft contrast boundary.
 */
export function metricsFromPhoto(reading: {
  hueAngle: number;
  ita: number;
  contrast: number;
  coverage?: number;
}): ResultMetrics {
  return {
    warm: round(clamp(((reading.hueAngle - 55) / 15) * 100)),
    // Both photo boundaries are inclusive: 28 counts as light, 45 as clear.
    light: nudge(round(clamp(((reading.ita - 28) / 25) * 100)), 1),
    clear: nudge(round(clamp(((reading.contrast - 45) / 25) * 100)), 1),
    hueAngle: Math.round(reading.hueAngle * 10) / 10,
    ita: Math.round(reading.ita * 10) / 10,
    contrast: Math.round(reading.contrast * 10) / 10,
    coverage: reading.coverage,
  };
}

const SEASON_DIRECTION: Record<SeasonId, { warm: 1 | -1; light: 1 | -1; clear: 1 | -1 }> = {
  spring: { warm: 1, light: 1, clear: 1 },
  summer: { warm: -1, light: 1, clear: -1 },
  autumn: { warm: 1, light: -1, clear: -1 },
  winter: { warm: -1, light: -1, clear: 1 },
};

/** A reading with no measurements behind it, so an older card still opens. */
export function metricsFromSeason(season: SeasonId, undertone: Undertone): ResultMetrics {
  const direction = SEASON_DIRECTION[season];
  const warm = undertone === 'neutral' ? 0 : undertone === 'warm' ? 60 : -60;
  return { warm, light: direction.light * 55, clear: direction.clear * 45 };
}

export interface AxisReading {
  id: 'undertone' | 'depth' | 'clarity';
  label: string;
  leftLabel: string;
  rightLabel: string;
  /** −100 (left) to 100 (right). */
  value: number;
  /** What that position means, in one sentence. */
  verdict: string;
}

function strength(value: number): string {
  const size = Math.abs(value);
  if (size >= 70) return 'strongly';
  if (size >= 35) return 'clearly';
  if (size >= 15) return 'slightly';
  return 'barely';
}

export function axisReadings(metrics: ResultMetrics): AxisReading[] {
  const side = (value: number, left: string, right: string) => (value < 0 ? left : right);
  return [
    {
      id: 'undertone',
      label: 'Undertone',
      leftLabel: 'Cool',
      rightLabel: 'Warm',
      value: metrics.warm,
      verdict:
        Math.abs(metrics.warm) < 15
          ? 'Your skin sits between the two, which is what a neutral undertone looks like.'
          : `Your skin reads ${strength(metrics.warm)} ${side(metrics.warm, 'cool', 'warm')}, so ${side(metrics.warm, 'blue-based', 'golden')} versions of a colour suit you better than ${side(metrics.warm, 'golden', 'blue-based')} ones.`,
    },
    {
      id: 'depth',
      label: 'Depth',
      leftLabel: 'Deep',
      rightLabel: 'Light',
      value: metrics.light,
      verdict:
        metrics.light >= 0
          ? `Your colouring is ${strength(metrics.light)} light, so colours that stay lifted suit you better than heavy ones.`
          : `Your colouring is ${strength(metrics.light)} deep, so a colour has to carry some weight to hold its own next to you.`,
    },
    {
      id: 'clarity',
      label: 'Clarity',
      leftLabel: 'Soft',
      rightLabel: 'Clear',
      value: metrics.clear,
      verdict:
        metrics.clear >= 0
          ? `The difference between your hair, skin and eyes is ${strength(metrics.clear)} marked, so clean, saturated colour suits you.`
          : `Your features blend into one another, so dusty and muted colours suit you better than bright ones.`,
    },
  ];
}

export interface SeasonMatch {
  season: SeasonId;
  name: string;
  accent: string;
  /** Share of the total match, 0–100, across the four seasons. */
  percent: number;
}

/**
 * How near each season came. The weights mirror the rule the result itself
 * follows — a decisive undertone settles the half and depth settles the season
 * inside it, and only a neutral undertone lets clarity decide — so the season
 * named at the top of the report is always the season at the top of this list.
 */
export function seasonMatches(metrics: ResultMetrics): SeasonMatch[] {
  const decisive = Math.abs(metrics.warm) >= 15;
  // A neutral undertone is one the reading could not call, so it is given no
  // weight at all here — exactly as the season rule treats it.
  const weights = decisive ? { warm: 2, light: 1, clear: 0 } : { warm: 0, light: 1, clear: 1.5 };
  const align = (value: number, direction: 1 | -1) => ((value * direction) / 100 + 1) / 2;

  const scored = (Object.keys(SEASON_DIRECTION) as SeasonId[]).map((season) => {
    const direction = SEASON_DIRECTION[season];
    const score =
      weights.warm * align(metrics.warm, direction.warm) +
      weights.light * align(metrics.light, direction.light) +
      weights.clear * align(metrics.clear, direction.clear);
    return { season, score };
  });

  const total = scored.reduce((sum, item) => sum + item.score, 0) || 1;
  // Ordered on the raw score, not on the rounded percentage: two seasons can
  // round to the same number while one of them is genuinely the result.
  return [...scored]
    .sort((a, b) => b.score - a.score)
    .map(({ season, score }) => ({
      season,
      name: SEASONS[season].name,
      accent: SEASONS[season].accent,
      percent: Math.round((score / total) * 100),
    }));
}

/**
 * The twelve-season subtype: the season, plus the direction the reading leans
 * hardest in. A reading that leans no particular way is the "true" version of
 * its season, which is exactly what those subtypes mean.
 */
export function subtypeFor(season: SeasonId, metrics: ResultMetrics): Subtype {
  const candidates = SUBTYPES.filter((item) => item.parent === season);
  const pull: Record<Lean, number> = {
    light: metrics.light,
    deep: -metrics.light,
    bright: metrics.clear,
    soft: -metrics.clear,
    true: 40,
  };
  return candidates.reduce((best, item) => (pull[item.lean] > pull[best.lean] ? item : best), candidates[0]!);
}

export interface MeasuredSwatch extends Swatch {
  /** CIE L*, 0–100. */
  lightness: number;
  /** CIE C*, roughly 0–110. */
  chroma: number;
  rgb: { r: number; g: number; b: number };
}

export function measureSwatch(swatch: Swatch): MeasuredSwatch {
  const rgb = hexToRgb(swatch.hex);
  const lab = rgbToLab(rgb);
  return {
    ...swatch,
    rgb,
    lightness: Math.round(lab.l),
    chroma: Math.round(labChroma(lab)),
  };
}

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export interface PaletteStats {
  lightness: number;
  chroma: number;
  lightnessRange: [number, number];
  chromaRange: [number, number];
}

export function paletteStats(swatches: MeasuredSwatch[]): PaletteStats {
  const lightness = swatches.map((s) => s.lightness);
  const chroma = swatches.map((s) => s.chroma);
  return {
    lightness: Math.round(average(lightness)),
    chroma: Math.round(average(chroma)),
    lightnessRange: [Math.min(...lightness), Math.max(...lightness)],
    chromaRange: [Math.min(...chroma), Math.max(...chroma)],
  };
}

export interface WardrobeRules {
  metals: string;
  whites: string;
  denim: string;
  lipstick: string;
  prints: string;
  hair: string;
}

const LIPSTICK: Record<SeasonId, string> = {
  spring: 'Coral, peach and warm pinks. A blue-red will look painted on.',
  summer: 'Rose, soft berry and cool pinks, kept a shade off full strength.',
  autumn: 'Brick, terracotta and warm browned reds.',
  winter: 'True red, fuchsia and plum, at full strength.',
};

export function wardrobeRules(season: SeasonId, metrics: ResultMetrics): WardrobeRules {
  const warm = metrics.warm > 15;
  const cool = metrics.warm < -15;
  const clear = metrics.clear >= 0;
  const light = metrics.light >= 0;

  return {
    metals: warm
      ? 'Gold, brass and bronze. Silver goes grey and flat against warm skin.'
      : cool
        ? 'Silver, platinum and white gold. Yellow gold pulls sallow.'
        : 'Both work. Rose gold and mixed-metal pieces are the safest buy.',
    whites: warm
      ? 'Ivory, cream and off-white. Optic white drains you.'
      : cool
        ? 'Optic white and cool grey-white. Cream turns your skin yellow.'
        : 'Soft white — one step off optic, one step off cream.',
    denim: cool
      ? light
        ? 'Light and mid blue washes, no orange-toned distressing.'
        : 'Dark indigo and black denim.'
      : light
        ? 'Mid blue with a warm, slightly faded wash.'
        : 'Deep blue and brown-cast washes; avoid stark blue-black.',
    lipstick: LIPSTICK[season],
    prints: clear
      ? 'High-contrast prints — the pattern should be as decisive as your colouring.'
      : 'Tonal prints, two or three shades of the same family. Sharp contrast overwhelms you.',
    hair: warm
      ? 'Warm brown, honey and copper tones. Ash toners fight your skin.'
      : cool
        ? 'Ash and cool brown tones. Golden highlights turn brassy on you.'
        : 'Anything close to your natural depth; keep highlights within two shades.',
  };
}

export interface ReportInput {
  season: SeasonId;
  undertone: Undertone;
  source: 'photo' | 'quiz';
  confidence: number;
  metrics?: ResultMetrics;
  /** Palette frozen at the time of purchase, when there is one. */
  palette?: { wear: Swatch[]; neutrals: Swatch[]; avoid: Swatch[] };
}

export interface FullReportData {
  season: SeasonId;
  seasonName: string;
  tagline: string;
  description: string;
  accent: string;
  undertone: Undertone;
  undertoneLabel: string;
  source: 'photo' | 'quiz';
  confidencePct: number;
  /** False when the reading itself was not kept, so the page says so. */
  measured: boolean;
  metrics: ResultMetrics;
  axes: AxisReading[];
  matches: SeasonMatch[];
  subtype: Subtype;
  neighbour: { id: SeasonId; name: string } | null;
  wear: MeasuredSwatch[];
  /** The subtype's own ten shades, some of them borrowed from the neighbour. */
  subtypeWear: (MeasuredSwatch & { borrowed: boolean })[];
  neutrals: MeasuredSwatch[];
  avoid: MeasuredSwatch[];
  stats: PaletteStats;
  avoidStats: PaletteStats;
  avoidReason: string;
  wardrobe: WardrobeRules;
  checklist: string[];
  tips: string[];
}

export function buildReport(input: ReportInput): FullReportData {
  const data = SEASONS[input.season];
  const measured = Boolean(input.metrics);
  const metrics = input.metrics ?? metricsFromSeason(input.season, input.undertone);
  const palette = input.palette ?? { wear: data.wear, neutrals: data.neutrals, avoid: data.avoid };
  const wear = palette.wear.map(measureSwatch);
  const avoid = palette.avoid.map(measureSwatch);
  const subtype = subtypeFor(input.season, metrics);
  const parentHexes = new Set(SEASONS[subtype.parent].wear.map((swatch) => swatch.hex.toLowerCase()));
  const subtypeWear = subtypePalette(subtype).wear.map((swatch) => ({
    ...measureSwatch(swatch),
    borrowed: !parentHexes.has(swatch.hex.toLowerCase()),
  }));

  return {
    season: input.season,
    seasonName: data.name,
    tagline: data.tagline,
    description: data.description,
    accent: data.accent,
    undertone: input.undertone,
    undertoneLabel: UNDERTONE_LABEL[input.undertone],
    source: input.source,
    confidencePct: Math.round(Math.min(1, Math.max(0, input.confidence)) * 100),
    measured,
    metrics,
    axes: axisReadings(metrics),
    matches: seasonMatches(metrics),
    subtype,
    neighbour: subtype.neighbour ? { id: subtype.neighbour, name: SEASONS[subtype.neighbour].name } : null,
    wear,
    subtypeWear,
    neutrals: palette.neutrals.map(measureSwatch),
    avoid,
    stats: paletteStats(wear),
    avoidStats: paletteStats(avoid),
    avoidReason: data.avoidReason,
    wardrobe: wardrobeRules(input.season, metrics),
    checklist: data.checklist,
    tips: data.tips,
  };
}

/**
 * The free result and the bought one are the same report, stopped at different
 * points. Saying so plainly — with the real count of what is there and what is
 * not — is both fairer and more persuasive than a vague "premium" label.
 */
export const FREE_SECTION_COUNT = 5;
export const REPORT_SECTION_COUNT = 14;

export const REPORT_EXTRAS: { title: string; detail: string; icon: IconName }[] = [
  {
    icon: 'measurements',
    title: 'Your three measurements',
    detail: 'How warm, how light, how clear — each scored.',
  },
  {
    icon: 'subtype',
    title: 'Your subtype of the twelve',
    detail: 'Which Summer, Spring, Autumn or Winter, with its own ten shades.',
  },
  {
    icon: 'seasonFit',
    title: 'A score for all four seasons',
    detail: 'Whether this was decisive or a near thing.',
  },
  {
    icon: 'reading',
    title: 'The reading behind it',
    detail: 'The angles your photo gave, or the points your answers scored.',
  },
  {
    icon: 'colours',
    title: 'Every colour measured',
    detail: 'Hex, RGB, lightness and intensity for all nineteen.',
  },
  {
    icon: 'wardrobe',
    title: 'Metals, whites, denim, lips',
    detail: 'The six decisions that come up every time you shop.',
  },
  {
    icon: 'picture',
    title: 'A picture to keep',
    detail: 'The palette as a PNG, tall or wide, and a printable page.',
  },
  {
    icon: 'subtype',
    title: 'A lookbook of you',
    detail: 'Four pictures of you wearing your own colours, if you ask for them.',
  },
];
