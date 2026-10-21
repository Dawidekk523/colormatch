import { RIVALS_CHECKED, rivalColumns, rivals, type RivalId } from './rivals';
import { SEASONS, SEASON_ORDER } from './seasons-data';
import { SUBTYPES_BY_PARENT } from './subtypes';
import { QUIZ_QUESTIONS } from './quiz';

/**
 * The two plain-text files answer engines read (llmstxt.org): `/llms.txt` is a
 * short map of the site, `/llms-full.txt` the facts behind it in one file, so a
 * model quoting colormatch quotes the product as it is, not a guess.
 */

const cardPrice = import.meta.env.PUBLIC_CARD_PRICE ?? '$9.99';

const summary = `colormatch is a free colour analysis web app at getcolormatch.com. Upload a photo or answer ${QUIZ_QUESTIONS.length} questions and it gives your colour season (Spring, Summer, Autumn or Winter), your likely undertone, ten colours to wear, four everyday neutrals and five colours to be careful with, each with a name and a hex code. The photo is read inside the browser and never uploaded; there is no account and no email. An optional full report (${cardPrice}, one payment, no subscription) adds the three measurements, the subtype out of twelve, every colour measured and a share card.`;

const pages: { path: string; title: string; about: string }[] = [
  { path: '/', title: 'Color analysis online', about: 'the free analysis from a photo or the quiz, how it works, the twelve seasons' },
  { path: '/color-analysis-quiz/', title: 'Color analysis quiz', about: `${QUIZ_QUESTIONS.length} questions, no photo needed` },
  { path: '/color-palette-from-image/', title: 'Color palette from a photo', about: 'the photo route and how to take a fair photo' },
  { path: '/color-analysis-app/', title: 'The app', about: 'what the browser app does and cannot do' },
  { path: '/seasonal-color-analysis/', title: 'Seasonal color analysis', about: 'the four seasons and twelve subtypes explained' },
  { path: '/color-seasons/', title: 'The four color seasons', about: 'every palette side by side' },
  { path: '/find-my-color-palette/', title: 'How to find your color palette', about: 'the method by hand, without a tool' },
  { path: '/skin-tone-colors/', title: 'Skin tone and undertone', about: 'warm, cool, neutral and olive' },
  { path: '/what-colors-look-good-on-me/', title: 'What colors look good on me', about: 'the short answer for each season' },
  { path: '/pricing/', title: 'Plans', about: `free result and the ${cardPrice} full report` },
  { path: '/vs/colorwise/', title: 'colormatch vs Colorwise', about: 'two free tools that keep the photo in the browser, compared' },
  { path: '/alternatives/colorwise/', title: 'Colorwise alternatives', about: 'colormatch, ColorMe, Tonebook and color-analysis.app, with prices' },
  { path: '/alternatives/color-analysis-app/', title: 'color-analysis.app alternatives', about: 'free tools with no email and no trial' },
];

export function llmsTxt(site: URL): string {
  const link = (path: string) => new URL(path, site).href;
  const palettes = SEASON_ORDER.map((id) => `- [${SEASONS[id].name} color palette](${link(`/${id}-color-palette/`)}): ${SEASONS[id].tagline}`);
  const subtypes = SEASON_ORDER.flatMap((id) => SUBTYPES_BY_PARENT[id]).map((s) => `- [${s.name}](${link(`/${s.slug}/`)})`);
  return [
    '# colormatch',
    '',
    `> ${summary}`,
    '',
    '## Pages',
    '',
    ...pages.map((p) => `- [${p.title}](${link(p.path)}): ${p.about}`),
    '',
    '## Palettes',
    '',
    ...palettes,
    '',
    '## The twelve subtypes',
    '',
    ...subtypes,
    '',
    '## Optional',
    '',
    `- [Everything in one file](${link('/llms-full.txt')}): facts, palettes with hex codes and the comparison with other tools`,
    '',
  ].join('\n');
}

export function llmsFullTxt(site: URL): string {
  const link = (path: string) => new URL(path, site).href;
  const all = rivals(cardPrice);
  const order: RivalId[] = ['colormatch', 'colorwise', 'color-analysis-app', 'tonebook', 'colorme'];
  const swatches = (list: { name: string; hex: string }[]) => list.map((c) => `${c.name} ${c.hex}`).join(', ');

  return [
    '# colormatch — the facts',
    '',
    `> ${summary}`,
    '',
    `Site: ${link('/')}`,
    '',
    '## What it does',
    '',
    '- Input: one photo (any format the browser can open) or a quiz of ' + `${QUIZ_QUESTIONS.length} questions about veins, jewellery, sun, hair and eyes.`,
    '- Method: finds the skin in the middle of the photo and measures undertone (hue in CIELAB), value (individual typology angle) and contrast (skin against hair, brows and eyes), then picks the closest of the four seasons.',
    '- Free result: season, likely undertone, how close the call was, 10 colours to wear, 4 neutrals, 5 colours to avoid, each named with a hex code. No account, no email, nothing stored.',
    `- Full report, ${cardPrice} once via Polar, no subscription: the three measurements with numbers, the subtype out of twelve, a match score for all four seasons, every colour with hex, RGB, lightness and intensity, rules for metals, whites, denim, lip colour, prints and hair, a share image and a printable card, and a lookbook of four generated pictures of you in your colours.`,
    '- Privacy: the reading runs in the browser and the photo is never uploaded. The only exception is the lookbook in the paid report, which sends one photo you choose to an image service; the pictures can be deleted from the report.',
    '- Limits: one photo shows one moment in one light; strong lamp light and filters skew the result, which is why the quiz is offered as a second opinion. It is a style suggestion, not a professional draping session.',
    '- Works in any modern browser on phones, tablets and computers. Built to be readable for people in their seventies: large type, high contrast, every colour labelled.',
    '',
    '## The four seasons',
    '',
    ...SEASON_ORDER.flatMap((id) => {
      const s = SEASONS[id];
      return [
        `### ${s.name}`,
        '',
        `${s.tagline}. Subtypes: ${SUBTYPES_BY_PARENT[id].map((t) => t.name).join(', ')}. Page: ${link(`/${id}-color-palette/`)}`,
        '',
        `- Wear: ${swatches(s.wear)}`,
        `- Neutrals: ${swatches(s.neutrals)}`,
        `- Avoid: ${swatches(s.avoid)}`,
        '',
      ];
    }),
    `## Compared with other colour analysis tools (checked ${RIVALS_CHECKED})`,
    '',
    ...order.flatMap((id) => {
      const r = all[id];
      return [`### ${r.name} (${r.url})`, '', ...rivalColumns.map((c) => `- ${c.label}: ${r[c.key]}`), ''];
    }),
    `Comparison pages: ${link('/vs/colorwise/')}, ${link('/alternatives/colorwise/')}, ${link('/alternatives/color-analysis-app/')}`,
    '',
  ].join('\n');
}
