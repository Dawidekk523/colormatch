import { writeFileSync } from 'node:fs';

const people = [
  { file: 'light-warm', bg: '#f7f4ef', skin: '#f0d2a8', hair: '#6b4423', shirt: '#2f9e9e', label: 'Light warm skin with brown hair' },
  { file: 'light-cool', bg: '#f1f2f4', skin: '#efc9bb', hair: '#c9b18a', shirt: '#8fb3d1', label: 'Light cool skin with fair hair' },
  { file: 'deep-warm', bg: '#f7f4ef', skin: '#7a4a28', hair: '#20150f', shirt: '#c8971f', label: 'Deep warm skin with black hair' },
  { file: 'deep-cool', bg: '#f1f2f4', skin: '#6b4442', hair: '#1a1620', shirt: '#1f4fa3', label: 'Deep cool skin with black hair' },
];

// The same colour study the Drape component draws: hair tone, then skin across
// the middle of the frame where the centre-weighted sampler looks, then the
// garment colour under a neckline.
const svg = ({ bg, skin, hair, shirt, label }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400" role="img" aria-label="${label}">
  <title>${label}</title>
  <rect width="400" height="400" fill="${bg}"/>
  <rect y="0" width="400" height="88" fill="${hair}"/>
  <rect y="88" width="400" height="192" fill="${skin}"/>
  <rect y="280" width="400" height="120" fill="${shirt}"/>
  <path d="M150 280h100l-50 62z" fill="${skin}"/>
</svg>
`;

for (const person of people) {
  writeFileSync(new URL(`../public/samples/${person.file}.svg`, import.meta.url), svg(person));
}
console.log('wrote', people.length, 'sample colour studies');
