import { hexToRgb, labChroma, rgbToLab } from './color';
import { SEASONS, type SeasonId, type Swatch } from './seasons-data';

export type UndertoneId = 'warm' | 'cool' | 'neutral' | 'olive';

export interface UndertoneGroup {
  id: UndertoneId;
  /** Lives at `/<slug>/`. Never rename one once it is live. */
  slug: string;
  name: string;
  /** The seasons this undertone is drawn from, and in which order. */
  seasons: [SeasonId, SeasonId];
  /** How the shades are chosen, said plainly on the page. */
  rule: string;
}

export const UNDERTONE_GROUPS: Record<UndertoneId, UndertoneGroup> = {
  warm: {
    id: 'warm',
    slug: 'warm-skin-tone-colors',
    name: 'Warm',
    seasons: ['spring', 'autumn'],
    rule: 'The strongest shades from both warm seasons — spring for the clear ones, autumn for the deep ones.',
  },
  cool: {
    id: 'cool',
    slug: 'cool-skin-tone-colors',
    name: 'Cool',
    seasons: ['summer', 'winter'],
    rule: 'The strongest shades from both cool seasons — summer for the soft ones, winter for the clear ones.',
  },
  neutral: {
    id: 'neutral',
    slug: 'neutral-skin-tone-colors',
    name: 'Neutral',
    seasons: ['spring', 'summer'],
    rule: 'The quietest shades from a warm season and a cool one. A neutral undertone is not served by either extreme, so these are the colours that lean least in either direction.',
  },
  olive: {
    id: 'olive',
    slug: 'olive-skin-tone-colors',
    name: 'Olive',
    seasons: ['autumn', 'summer'],
    rule: 'Muted shades from autumn and summer. Olive skin carries a green cast that clear, bright colours fight and softened ones sit alongside.',
  },
};

export const UNDERTONE_LIST = Object.values(UNDERTONE_GROUPS);

const chromaOf = (swatch: Swatch) => labChroma(rgbToLab(hexToRgb(swatch.hex)));

/**
 * Undertone palettes are built out of the season palettes rather than invented,
 * the same way the subtypes are. An undertone is not a fifth system: it is the
 * thing two seasons have in common, so each page shows five shades from each of
 * the two seasons that share it.
 *
 * Warm and cool take the most saturated shades, because those are the ones that
 * make the undertone obvious. Neutral and olive take the least saturated, since
 * both are undone by a colour at full strength.
 */
export function undertonePalette(group: UndertoneGroup): { wear: Swatch[]; avoid: Swatch[] } {
  const quiet = group.id === 'neutral' || group.id === 'olive';

  const wear = group.seasons.flatMap((season) =>
    [...SEASONS[season].wear]
      .sort((a, b) => (quiet ? chromaOf(a) - chromaOf(b) : chromaOf(b) - chromaOf(a)))
      .slice(0, 5)
      .map(({ name, hex }) => ({ name, hex })),
  );

  // What to be careful with comes from the same two seasons, because the
  // shades a season struggles with are exactly the ones that fight the
  // undertone it belongs to.
  const seen = new Set<string>();
  const avoid = group.seasons
    .flatMap((season) => SEASONS[season].avoid.map(({ name, hex }) => ({ name, hex })))
    .filter((swatch) => {
      const key = swatch.hex.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 6);

  return { wear, avoid };
}
