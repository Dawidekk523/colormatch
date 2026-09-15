import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import jpeg from 'jpeg-js';
import { describe, expect, it } from 'vitest';
import { analyseSkinReading } from '../src/lib/season';
import { readSkin, SAMPLE_SIZE } from '../src/lib/skin';

/**
 * The sample photos are real inputs: clicking one runs the same analyser a
 * visitor's own photo runs through. Decoding them here, and box-averaging down
 * to the size the browser canvas uses, keeps the pictures and the tiles that
 * describe them honest with each other — swapping in a photo that reads as a
 * different season fails the suite instead of shipping a wrong example.
 */
function downsample(file: string): Uint8ClampedArray {
  const raw = jpeg.decode(readFileSync(resolve(process.cwd(), `public/samples/${file}.jpg`)), {
    useTArray: true,
    formatAsRGBA: true,
  });
  const out = new Uint8ClampedArray(SAMPLE_SIZE * SAMPLE_SIZE * 4);
  const boxWidth = raw.width / SAMPLE_SIZE;
  const boxHeight = raw.height / SAMPLE_SIZE;

  for (let y = 0; y < SAMPLE_SIZE; y += 1) {
    for (let x = 0; x < SAMPLE_SIZE; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let seen = 0;
      for (let sy = Math.floor(y * boxHeight); sy < Math.ceil((y + 1) * boxHeight); sy += 1) {
        for (let sx = Math.floor(x * boxWidth); sx < Math.ceil((x + 1) * boxWidth); sx += 1) {
          const i = (Math.min(sy, raw.height - 1) * raw.width + Math.min(sx, raw.width - 1)) * 4;
          r += raw.data[i]!;
          g += raw.data[i + 1]!;
          b += raw.data[i + 2]!;
          seen += 1;
        }
      }
      const o = (y * SAMPLE_SIZE + x) * 4;
      out[o] = r / seen;
      out[o + 1] = g / seen;
      out[o + 2] = b / seen;
      out[o + 3] = 255;
    }
  }
  return out;
}

const CASES = [
  { file: 'light-warm', season: 'spring' },
  { file: 'light-cool', season: 'summer' },
  { file: 'golden-warm', season: 'autumn' },
  { file: 'deep-cool', season: 'winter' },
] as const;

describe('sample photos', () => {
  for (const { file, season } of CASES) {
    it(`${file} reads as ${season}`, () => {
      const reading = readSkin(downsample(file), SAMPLE_SIZE, SAMPLE_SIZE);
      // Well clear of MIN_SKIN_COVERAGE: a sample that barely qualifies would
      // be a poor example of the photo the site asks for.
      expect(reading.coverage).toBeGreaterThan(0.4);
      expect(analyseSkinReading(reading)?.season).toBe(season);
    });
  }
});
