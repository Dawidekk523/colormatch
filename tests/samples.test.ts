import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hexToRgb } from '../src/lib/color';
import { analyseSkinReading } from '../src/lib/season';
import { readSkin, SAMPLE_SIZE } from '../src/lib/skin';

/**
 * The sample drawings are real inputs: clicking one runs the same analyser a
 * photo runs through. Rasterising the bands here keeps the artwork and the
 * reading honest with each other, so a redesign of the drawing cannot quietly
 * change which season a sample lands on.
 */
const BAND = /<rect(?:\s+y="(\d+)")?\s+width="400"\s+height="(\d+)"\s+fill="(#[0-9a-f]{6})"\/>/g;

function rasterise(file: string): Uint8ClampedArray {
  const svg = readFileSync(resolve(process.cwd(), `public/samples/${file}.svg`), 'utf8');
  const bands = [...svg.matchAll(BAND)].map((m) => ({
    top: Number(m[1] ?? 0),
    height: Number(m[2]),
    rgb: hexToRgb(m[3]!),
  }));
  expect(bands.length).toBeGreaterThanOrEqual(4);

  const data = new Uint8ClampedArray(SAMPLE_SIZE * SAMPLE_SIZE * 4);
  for (let y = 0; y < SAMPLE_SIZE; y += 1) {
    const sourceY = (y / SAMPLE_SIZE) * 400;
    const band = bands.findLast((b) => sourceY >= b.top && sourceY < b.top + b.height) ?? bands[0]!;
    for (let x = 0; x < SAMPLE_SIZE; x += 1) {
      const i = (y * SAMPLE_SIZE + x) * 4;
      data[i] = band.rgb.r;
      data[i + 1] = band.rgb.g;
      data[i + 2] = band.rgb.b;
      data[i + 3] = 255;
    }
  }
  return data;
}

const CASES: { file: string; season: string }[] = [
  { file: 'light-warm', season: 'spring' },
  { file: 'light-cool', season: 'summer' },
  { file: 'deep-warm', season: 'autumn' },
  { file: 'deep-cool', season: 'winter' },
];

describe('sample drawings', () => {
  for (const { file, season } of CASES) {
    it(`${file} reads as ${season}`, () => {
      const reading = readSkin(rasterise(file), SAMPLE_SIZE, SAMPLE_SIZE);
      expect(reading.coverage).toBeGreaterThan(0.2);
      const result = analyseSkinReading(reading);
      expect(result?.season).toBe(season);
    });
  }
});
