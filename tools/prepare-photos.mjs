/**
 * Downloads the photography used on the site and writes it into public/.
 *
 * Two shapes, because they do different jobs:
 *  - samples/  square, face filling the frame. These are real inputs: clicking
 *    one runs the analyser, so the crop has to look like the photo the site
 *    asks people to take. tests/samples.test.ts asserts what each one reads as.
 *  - photos/   4:5, head and shoulders with room under the chin for the colour
 *    drape the season gallery lays over the clothing.
 *
 * Every picture is from Unsplash under the Unsplash licence (free, commercial
 * use, no attribution required — credited anyway in PHOTO-CREDITS.md).
 * Unsplash+ / premium_photo assets are deliberately avoided.
 */
import { writeFileSync } from 'node:fs';

export const SAMPLES = [
  {
    file: 'light-warm',
    id: 'UZmSn5GaSWY',
    by: 'Beatriz Cattel',
    page: 'https://unsplash.com/photos/young-woman-with-long-brown-hair-wearing-a-black-shirt-UZmSn5GaSWY',
    src: 'https://images.unsplash.com/photo-1770058443069-e384cd001e9b',
    label: 'Light skin, warm tone',
  },
  {
    file: 'light-cool',
    id: '0b_7r_dNjFs',
    by: 'Valeria Lendel',
    page: 'https://unsplash.com/photos/a-woman-with-long-black-hair-standing-in-front-of-a-wall-0b_7r_dNjFs',
    src: 'https://images.unsplash.com/photo-1636153279424-cb5d1e00f5a2',
    label: 'Light skin, cool tone',
  },
  {
    file: 'golden-warm',
    id: 'O6mDCu8h3wo',
    by: 'Valentina Giarre',
    page: 'https://unsplash.com/photos/a-woman-with-freckled-hair-is-posing-for-a-picture-O6mDCu8h3wo',
    src: 'https://images.unsplash.com/photo-1637318510642-71a3cf69459b',
    label: 'Golden skin, warm tone',
  },
  {
    file: 'deep-cool',
    id: 'nuuu9qqFXoE',
    by: 'Gift Habeshaw',
    page: 'https://unsplash.com/photos/woman-in-brown-sweater-smiling-nuuu9qqFXoE',
    src: 'https://images.unsplash.com/photo-1623963888101-f50eceae6c9d',
    label: 'Deep skin, cool tone',
  },
];

export const PORTRAITS = [
  {
    file: 'spring',
    id: 'IF9TK5Uy-KI',
    by: 'Jake Nackos',
    page: 'https://unsplash.com/photos/woman-in-white-crew-neck-shirt-smiling-IF9TK5Uy-KI',
    src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
  },
  {
    file: 'summer',
    id: 'ij6JGuYzCd4',
    by: 'Devin Santiago',
    page: 'https://unsplash.com/photos/a-young-woman-with-blonde-hair-smiles-ij6JGuYzCd4',
    src: 'https://images.unsplash.com/photo-1764971591006-b6eb67a8f0cb',
  },
  {
    file: 'autumn',
    id: '6ZXoZALOBWE',
    by: 'Eden',
    page: 'https://unsplash.com/photos/a-man-standing-in-front-of-a-white-wall-6ZXoZALOBWE',
    src: 'https://images.unsplash.com/photo-1569444741836-ca6d8b36ee75',
    // Framed off-centre in the original, so this one is cropped around the face.
    facepad: 3.4,
  },
  {
    file: 'winter',
    id: 'qhrhmDZ6DTY',
    by: 'Vitaly Gariev',
    page: 'https://unsplash.com/photos/smiling-asian-woman-with-long-dark-hair-and-white-shirt-qhrhmDZ6DTY',
    src: 'https://images.unsplash.com/photo-1758600587391-338f5376b7ed',
  },
];

async function save(url, path) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  writeFileSync(new URL(path, import.meta.url), Buffer.from(await response.arrayBuffer()));
}

for (const s of SAMPLES) {
  await save(`${s.src}?fit=facearea&facepad=1.6&w=640&h=640&q=72&fm=jpg`, `../public/samples/${s.file}.jpg`);
}
for (const p of PORTRAITS) {
  const framing = p.facepad ? `fit=facearea&facepad=${p.facepad}` : 'fit=crop&crop=faces';
  await save(`${p.src}?${framing}&w=640&h=800&q=72&fm=jpg`, `../public/photos/${p.file}.jpg`);
}

const credits = `# Photo credits

Every photograph here comes from [Unsplash](https://unsplash.com/license) under the
Unsplash licence: free to use, including commercially, with no attribution required.
Credit is given anyway. Run \`node tools/prepare-photos.mjs\` to fetch them again.

## Sample inputs (public/samples)

${SAMPLES.map((s) => `- \`${s.file}.jpg\` — ${s.by} — ${s.page}`).join('\n')}

## Season portraits (public/photos)

${PORTRAITS.map((p) => `- \`${p.file}.jpg\` — ${p.by} — ${p.page}`).join('\n')}
`;
writeFileSync(new URL('../PHOTO-CREDITS.md', import.meta.url), credits);

console.log('wrote', SAMPLES.length, 'samples and', PORTRAITS.length, 'portraits');
