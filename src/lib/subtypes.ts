import { hexToRgb, labChroma, rgbToLab } from './color';
import { SEASONS, type SeasonId, type Swatch } from './seasons-data';

/**
 * Which way a subtype leans away from its parent season. The twelve-season
 * system is not twelve unrelated palettes: each one is a parent season pulled
 * towards a neighbour, and that is exactly how these are built.
 */
export type Lean = 'light' | 'deep' | 'soft' | 'bright' | 'true';

export interface Subtype {
  id: string;
  /** Lives at `/<slug>/`. Never rename one once it is live. */
  slug: string;
  /** What the page calls it. */
  name: string;
  /** Other names the same subtype goes by, used in the copy and for redirects. */
  aliases: string[];
  parent: SeasonId;
  /** The season it borrows from. `null` for the three "true" subtypes. */
  neighbour: SeasonId | null;
  lean: Lean;
}

export const SUBTYPES: Subtype[] = [
  {
    id: 'light-spring',
    slug: 'light-spring-color-palette',
    name: 'Light spring',
    aliases: [],
    parent: 'spring',
    neighbour: 'summer',
    lean: 'light',
  },
  {
    id: 'warm-spring',
    slug: 'warm-spring-color-palette',
    name: 'Warm spring',
    aliases: ['true spring', 'pure spring'],
    parent: 'spring',
    neighbour: null,
    lean: 'true',
  },
  {
    id: 'bright-spring',
    slug: 'bright-spring-color-palette',
    name: 'Bright spring',
    aliases: ['clear spring'],
    parent: 'spring',
    neighbour: 'winter',
    lean: 'bright',
  },
  {
    id: 'light-summer',
    slug: 'light-summer-color-palette',
    name: 'Light summer',
    aliases: [],
    parent: 'summer',
    neighbour: 'spring',
    lean: 'light',
  },
  {
    id: 'cool-summer',
    slug: 'cool-summer-color-palette',
    name: 'Cool summer',
    aliases: ['true summer', 'pure summer'],
    parent: 'summer',
    neighbour: null,
    lean: 'true',
  },
  {
    id: 'soft-summer',
    slug: 'soft-summer-color-palette',
    name: 'Soft summer',
    aliases: ['muted summer'],
    parent: 'summer',
    neighbour: 'autumn',
    lean: 'soft',
  },
  {
    id: 'soft-autumn',
    slug: 'soft-autumn-color-palette',
    name: 'Soft autumn',
    aliases: ['muted autumn'],
    parent: 'autumn',
    neighbour: 'summer',
    lean: 'soft',
  },
  {
    id: 'warm-autumn',
    slug: 'warm-autumn-color-palette',
    name: 'Warm autumn',
    aliases: ['true autumn', 'pure autumn'],
    parent: 'autumn',
    neighbour: null,
    lean: 'true',
  },
  {
    id: 'deep-autumn',
    slug: 'deep-autumn-color-palette',
    name: 'Deep autumn',
    aliases: ['dark autumn'],
    parent: 'autumn',
    neighbour: 'winter',
    lean: 'deep',
  },
  {
    id: 'deep-winter',
    slug: 'deep-winter-color-palette',
    name: 'Deep winter',
    aliases: ['dark winter'],
    parent: 'winter',
    neighbour: 'autumn',
    lean: 'deep',
  },
  {
    id: 'cool-winter',
    slug: 'cool-winter-color-palette',
    name: 'Cool winter',
    aliases: ['true winter', 'pure winter'],
    parent: 'winter',
    neighbour: null,
    lean: 'true',
  },
  {
    id: 'bright-winter',
    slug: 'bright-winter-color-palette',
    name: 'Bright winter',
    aliases: ['clear winter', 'vivid winter'],
    parent: 'winter',
    neighbour: 'spring',
    lean: 'bright',
  },
];

export const SUBTYPES_BY_PARENT: Record<SeasonId, Subtype[]> = {
  spring: SUBTYPES.filter((s) => s.parent === 'spring'),
  summer: SUBTYPES.filter((s) => s.parent === 'summer'),
  autumn: SUBTYPES.filter((s) => s.parent === 'autumn'),
  winter: SUBTYPES.filter((s) => s.parent === 'winter'),
};

export const getSubtype = (id: string): Subtype | undefined => SUBTYPES.find((s) => s.id === id);

interface Measured extends Swatch {
  lightness: number;
  chroma: number;
}

const measure = (swatch: Swatch): Measured => {
  const lab = rgbToLab(hexToRgb(swatch.hex));
  return { ...swatch, lightness: lab.l, chroma: labChroma(lab) };
};

/** The one number that defines each lean, high being the direction it leans. */
function score(swatch: Measured, lean: Lean): number {
  switch (lean) {
    case 'light':
      return swatch.lightness;
    case 'deep':
      return -swatch.lightness;
    case 'bright':
      return swatch.chroma;
    case 'soft':
      return -swatch.chroma;
    case 'true':
      // A true subtype is its parent at its most typical: nothing extreme in
      // either direction, so shades closest to the palette's own middle win.
      return 0;
  }
}

/**
 * Builds a subtype palette out of shades that already exist. Nothing here is
 * invented: seven shades come from the parent season, ranked by the quality the
 * subtype is named for, and three are borrowed from the neighbour it leans
 * towards. That is what a twelve-season subtype is, and saying so on the page
 * is more honest than presenting twelve palettes as if they were measured
 * separately.
 */
export function subtypePalette(subtype: Subtype): { wear: Swatch[]; neutrals: Swatch[]; avoid: Swatch[] } {
  const parent = SEASONS[subtype.parent];
  const measured = parent.wear.map(measure);

  let fromParent: Swatch[];
  if (subtype.lean === 'true') {
    const middle = measured.reduce((sum, s) => sum + s.chroma, 0) / measured.length;
    fromParent = [...measured]
      .sort((a, b) => Math.abs(a.chroma - middle) - Math.abs(b.chroma - middle))
      .slice(0, 10);
  } else {
    fromParent = [...measured].sort((a, b) => score(b, subtype.lean) - score(a, subtype.lean)).slice(0, 7);
  }

  const borrowed = subtype.neighbour
    ? [...SEASONS[subtype.neighbour].wear.map(measure)]
        .sort((a, b) => score(b, subtype.lean) - score(a, subtype.lean))
        .slice(0, 3)
    : [];

  const seen = new Set<string>();
  const wear = [...fromParent, ...borrowed]
    .map(({ name, hex }) => ({ name, hex }))
    .filter((swatch) => {
      const key = swatch.hex.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return { wear, neutrals: parent.neutrals, avoid: parent.avoid };
}
