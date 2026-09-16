import type { ResultMetrics } from './report';
import { readMetrics } from './result-storage';
import { SEASONS, UNDERTONE_LABEL, type SeasonId, type Swatch, type Undertone } from './seasons-data';

export interface CardPayload {
  version: 1;
  season: SeasonId;
  seasonName: string;
  undertone: Undertone;
  undertoneLabel: string;
  wear: Swatch[];
  neutrals: Swatch[];
  avoid: Swatch[];
  avoidReason: string;
  checklist: string[];
  /** The reading behind the result, so the bought report can show its numbers. */
  metrics?: ResultMetrics;
}

/**
 * The card is a snapshot, not a live view of `SEASONS`. Someone who bought a
 * card in March should still be holding the same colours in December, even if
 * the palettes here are revised in between — so the whole payload is frozen at
 * the moment of purchase and stored with the result.
 */
export function buildCard(season: SeasonId, undertone: Undertone, metrics?: ResultMetrics): CardPayload {
  const data = SEASONS[season];
  return {
    version: 1,
    season,
    seasonName: data.name,
    undertone,
    undertoneLabel: UNDERTONE_LABEL[undertone],
    wear: data.wear,
    neutrals: data.neutrals,
    avoid: data.avoid,
    avoidReason: data.avoidReason,
    checklist: data.checklist,
    metrics,
  };
}

const isSwatchList = (value: unknown): value is Swatch[] =>
  Array.isArray(value) &&
  value.length <= 24 &&
  value.every(
    (item) =>
      item &&
      typeof item === 'object' &&
      typeof (item as Swatch).name === 'string' &&
      /^#[0-9a-f]{6}$/i.test(String((item as Swatch).hex)),
  );

/** Anything that comes back from the network is checked before it is drawn. */
export function readCard(value: unknown): CardPayload | null {
  if (!value || typeof value !== 'object') return null;
  const card = value as Partial<CardPayload>;
  if (card.version !== 1) return null;
  if (typeof card.season !== 'string' || !(card.season in SEASONS)) return null;
  if (!isSwatchList(card.wear) || !isSwatchList(card.neutrals) || !isSwatchList(card.avoid)) return null;
  if (!Array.isArray(card.checklist) || card.checklist.some((item) => typeof item !== 'string')) return null;
  return {
    version: 1,
    season: card.season as SeasonId,
    seasonName: typeof card.seasonName === 'string' ? card.seasonName : SEASONS[card.season as SeasonId].name,
    undertone: (['warm', 'cool', 'neutral'] as const).includes(card.undertone as Undertone)
      ? (card.undertone as Undertone)
      : 'neutral',
    undertoneLabel: typeof card.undertoneLabel === 'string' ? card.undertoneLabel : '',
    wear: card.wear,
    neutrals: card.neutrals,
    avoid: card.avoid,
    avoidReason: typeof card.avoidReason === 'string' ? card.avoidReason : '',
    checklist: card.checklist.slice(0, 20),
    metrics: readMetrics(card.metrics),
  };
}
