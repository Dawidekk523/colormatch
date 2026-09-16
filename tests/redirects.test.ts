// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SUBTYPES } from '../src/lib/subtypes';

const file = readFileSync(join(process.cwd(), 'public/_redirects'), 'utf8');

describe('alias redirects', () => {
  it('sends every alternative name to the canonical subtype page', () => {
    const expected = SUBTYPES.flatMap((subtype) =>
      subtype.aliases.map((alias) => `/${alias.replace(/\s+/g, '-')}-color-palette/ /${subtype.slug}/ 301`),
    );
    for (const line of expected) expect(file).toContain(line);
  });

  it('points only at pages that are actually built', () => {
    const slugs = new Set(SUBTYPES.map((subtype) => `/${subtype.slug}/`));
    const targets = [...file.matchAll(/^\S+ (\S+) 301$/gm)].map((match) => match[1]!);
    expect(targets.length).toBeGreaterThan(0);
    for (const target of targets) expect(slugs.has(target)).toBe(true);
  });
});
