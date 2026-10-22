/**
 * The other color-analysis tools people ask about, as they were on the day
 * they were checked. Every value here comes from the tool's own pages or from
 * running it once end to end; when a claim is theirs and could not be tested
 * (what happens to a photo on their servers), the cell says so. Re-check and
 * move `RIVALS_CHECKED` before changing a value.
 */

export const RIVALS_CHECKED = '21 October 2026';
export const RIVALS_CHECKED_ISO = '2026-10-21';

export type RivalId = 'colormatch' | 'colorwise' | 'color-analysis-app' | 'tonebook' | 'colorme';

export interface Rival {
  id: RivalId;
  name: string;
  url: string;
  price: string;
  free: string;
  signup: string;
  photo: string;
  method: string;
  where: string;
}

export const rivalColumns: { key: keyof Omit<Rival, 'id' | 'name' | 'url'>; label: string }[] = [
  { key: 'price', label: 'Price' },
  { key: 'free', label: 'What you get free' },
  { key: 'signup', label: 'Sign-up or email' },
  { key: 'photo', label: 'Your photo' },
  { key: 'method', label: 'How it decides' },
  { key: 'where', label: 'Where it runs' },
];

export function rivals(cardPrice: string): Record<RivalId, Rival> {
  return {
    colormatch: {
      id: 'colormatch',
      name: 'colormatch',
      url: 'https://getcolormatch.com/',
      price: `Free; optional full report ${cardPrice} once, no subscription`,
      free: 'Season (one of four), undertone, 10 colors, 4 neutrals and 5 to avoid, each with a name and hex code',
      signup: 'None',
      photo: 'Read inside your browser and never uploaded',
      method: 'Measures undertone, value and contrast in the photo automatically, or seven questions instead',
      where: 'Any browser, phone or computer',
    },
    colorwise: {
      id: 'colorwise',
      name: 'Colorwise.me',
      url: 'https://colorwise.me/self-analysis',
      price: 'Free on the web; the My Best Colors phone app sells a one-time premium unlock',
      free: 'Season (one of twelve), 18 colors and 8 to avoid as a picture, without color codes',
      signup: 'None',
      photo: 'Stays in your browser, by their statement',
      method: 'You pick skin, hair and eye colors on your selfie, then their model scores them',
      where: 'Browser, plus iPhone and Android apps',
    },
    'color-analysis-app': {
      id: 'color-analysis-app',
      name: 'color-analysis.app',
      url: 'https://color-analysis.app/',
      price: '$1 for a 7-day trial, then $29.99 every 3 months until cancelled',
      free: 'Nothing — the result is behind the trial',
      signup: 'Email before the result',
      photo: 'Optional; uploaded and "deleted immediately", by their statement',
      method: 'About twenty questions, an optional photo, and AI',
      where: 'Browser',
    },
    tonebook: {
      id: 'tonebook',
      name: 'Tonebook',
      url: 'https://tonebook.app/',
      price: 'Free preview; Pro is weekly, yearly or lifetime, priced in the iPhone app',
      free: 'Season and up to 10 colors',
      signup: 'None for the preview',
      photo: 'Sent to OpenAI for the analysis, by their statement',
      method: 'An AI model reads a selfie; a quiz without a photo in the browser',
      where: 'iPhone (iOS 17+) and browser; no Android',
    },
    colorme: {
      id: 'colorme',
      name: 'ColorMe',
      url: 'https://colorme.style/',
      price: 'Free',
      free: 'A live mirror of your face against each palette; it gives no season',
      signup: 'None',
      photo: 'Camera and photo stay on your device, by their statement',
      method: 'No verdict — you compare the palettes yourself',
      where: 'Browser',
    },
  };
}

/** colormatch itself, for the pages that set it against the others. */
export function colormatchApp(cardPrice: string): Record<string, unknown> {
  return {
    '@type': 'SoftwareApplication',
    name: 'colormatch',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Any browser',
    url: 'https://getcolormatch.com/',
    description:
      'Free color analysis in the browser: a photo or seven questions give a color season, an undertone, ten colors, four neutrals and five colors to avoid, each with a hex code. The photo is never uploaded.',
    offers: [
      { '@type': 'Offer', name: 'Color season and palette', price: '0', priceCurrency: 'USD' },
      {
        '@type': 'Offer',
        name: 'Full color report',
        price: cardPrice.replace(/[^0-9.]/g, ''),
        priceCurrency: 'USD',
        url: 'https://getcolormatch.com/pricing/',
      },
    ],
  };
}
