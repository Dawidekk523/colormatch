import { describe, expect, it } from 'vitest';
import { buildCard, readCard } from '../src/lib/card';
import { SEASONS } from '../src/lib/seasons-data';

describe('the bought card', () => {
  it('freezes everything the card prints, not a reference to the palette', () => {
    const card = buildCard('autumn', 'warm');
    expect(card.seasonName).toBe('Autumn');
    expect(card.undertoneLabel).toMatch(/warm/i);
    expect(card.wear).toHaveLength(SEASONS.autumn.wear.length);
    expect(card.checklist.length).toBeGreaterThan(3);
    expect(readCard(JSON.parse(JSON.stringify(card)))).toEqual(card);
  });

  it('gives every season a checklist that names real things to buy', () => {
    for (const season of Object.values(SEASONS)) {
      expect(season.checklist.length).toBeGreaterThanOrEqual(5);
      for (const item of season.checklist) expect(item.length).toBeGreaterThan(20);
    }
  });

  it('refuses a card that did not come from us', () => {
    expect(readCard(null)).toBeNull();
    expect(readCard({ version: 2 })).toBeNull();
    expect(readCard({ version: 1, season: 'monsoon' })).toBeNull();
    const card = buildCard('winter', 'cool');
    expect(readCard({ ...card, wear: [{ name: 'X', hex: 'javascript:alert(1)' }] })).toBeNull();
  });
});
