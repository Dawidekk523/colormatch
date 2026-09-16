export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type Undertone = 'warm' | 'cool' | 'neutral';

export interface Swatch {
  name: string;
  hex: string;
}

export interface Season {
  id: SeasonId;
  name: string;
  tagline: string;
  /** Two or three sentences in plain language, used on result screens and on /color-seasons. */
  description: string;
  undertone: Undertone;
  depth: 'light' | 'deep';
  contrast: 'clear' | 'soft';
  /** The colour most associated with the season, used as an accent on cards. */
  accent: string;
  wear: Swatch[];
  neutrals: Swatch[];
  avoid: Swatch[];
  avoidReason: string;
  tips: string[];
  /** Printed on the bought card: what to look for when actually shopping. */
  checklist: string[];
}

export const SEASONS: Record<SeasonId, Season> = {
  spring: {
    id: 'spring',
    name: 'Spring',
    tagline: 'Warm and light',
    description:
      'Spring colours are warm, fresh and full of light, like a garden in early morning sun. They have yellow or golden warmth in them and stay bright rather than dusty. Next to these colours your skin usually looks rested and even.',
    undertone: 'warm',
    depth: 'light',
    contrast: 'clear',
    accent: '#e8734a',
    wear: [
      { name: 'Coral', hex: '#e8734a' },
      { name: 'Peach', hex: '#f0a878' },
      { name: 'Golden Yellow', hex: '#e8b33c' },
      { name: 'Apple Green', hex: '#84b23c' },
      { name: 'Warm Turquoise', hex: '#2f9e9e' },
      { name: 'Aqua Blue', hex: '#4aa6c8' },
      { name: 'Salmon Pink', hex: '#e58b7b' },
      { name: 'Periwinkle', hex: '#7d8fd6' },
      { name: 'Bright Poppy', hex: '#d8452f' },
      { name: 'Light Moss', hex: '#a3b56b' },
    ],
    neutrals: [
      { name: 'Ivory', hex: '#f4ead6' },
      { name: 'Camel', hex: '#b98b4f' },
      { name: 'Warm Beige', hex: '#cdb08a' },
      { name: 'Soft Navy', hex: '#3c4d7a' },
    ],
    avoid: [
      { name: 'Black', hex: '#111111' },
      { name: 'Burgundy', hex: '#5d1a2b' },
      { name: 'Dusty Mauve', hex: '#9b8290' },
      { name: 'Charcoal Grey', hex: '#3a3d42' },
      { name: 'Icy Grey Blue', hex: '#b9c6d2' },
    ],
    avoidReason:
      'Very dark and dusty colours can look heavy next to a light, warm colouring and can make the face look tired.',
    tips: [
      'Choose warm white or ivory instead of pure white.',
      'If you like dark colours, use soft navy or warm brown instead of black.',
      'Gold jewellery usually suits this palette better than silver.',
    ],
    checklist: [
      'A warm white or ivory shirt, instead of a bright white one.',
      'A coral, peach or salmon top to wear close to the face.',
      'A camel coat or jacket in place of a black one.',
      'One clear, light blue — aqua or periwinkle — for contrast.',
      'Gold earrings or a gold chain, worn at the neckline.',
      'A scarf in apple green or golden yellow to lift a plain outfit.',
      'Soft navy for the one dark piece every wardrobe needs.',
    ],
  },
  summer: {
    id: 'summer',
    name: 'Summer',
    tagline: 'Cool and soft',
    description:
      'Summer colours are cool and gentle, as if a little grey has been mixed into them. Think of a garden after rain. They stay light to medium and never look harsh or neon.',
    undertone: 'cool',
    depth: 'light',
    contrast: 'soft',
    accent: '#6f8fb5',
    wear: [
      { name: 'Powder Blue', hex: '#8fb3d1' },
      { name: 'Soft Rose', hex: '#d4939f' },
      { name: 'Lavender', hex: '#a294c4' },
      { name: 'Dusty Pink', hex: '#c98f9c' },
      { name: 'Sage Green', hex: '#8fa392' },
      { name: 'Slate Blue', hex: '#6f8fb5' },
      { name: 'Mauve', hex: '#9b7f96' },
      { name: 'Seafoam', hex: '#8ab8ad' },
      { name: 'Soft Plum', hex: '#7a5a73' },
      { name: 'Periwinkle Blue', hex: '#7e8cc4' },
    ],
    neutrals: [
      { name: 'Soft White', hex: '#f1f1ee' },
      { name: 'Cool Grey', hex: '#9aa0a6' },
      { name: 'Taupe', hex: '#9b8f87' },
      { name: 'Navy', hex: '#2f4260' },
    ],
    avoid: [
      { name: 'Orange', hex: '#e2601b' },
      { name: 'Tomato Red', hex: '#d63426' },
      { name: 'Mustard', hex: '#c8971f' },
      { name: 'Camel', hex: '#b98b4f' },
      { name: 'Pure Black', hex: '#000000' },
    ],
    avoidReason:
      'Strong warm and very bright colours tend to overpower a soft, cool colouring and can pull attention away from the face.',
    tips: [
      'Choose soft white instead of bright white.',
      'Navy and charcoal work better than pure black near the face.',
      'Silver jewellery usually suits this palette better than gold.',
    ],
    checklist: [
      'A soft white or oyster shirt rather than a stark white one.',
      'A powder blue or dusty pink top for the face-framing layer.',
      'A grey-blue or slate coat instead of black.',
      'One gentle accent — lavender, sage or mauve — in a scarf or knit.',
      'Silver jewellery, kept fine rather than chunky.',
      'Two colours of similar lightness together, not one dark and one bright.',
      'A cool-toned denim rather than a warm, orange-cast wash.',
    ],
  },
  autumn: {
    id: 'autumn',
    name: 'Autumn',
    tagline: 'Warm and deep',
    description:
      'Autumn colours are warm, rich and a little earthy, like leaves and spices in October. They have golden warmth but more depth and less brightness than Spring colours.',
    undertone: 'warm',
    depth: 'deep',
    contrast: 'soft',
    accent: '#a9552c',
    wear: [
      { name: 'Terracotta', hex: '#a9552c' },
      { name: 'Rust', hex: '#8f3d1e' },
      { name: 'Mustard', hex: '#c8971f' },
      { name: 'Olive Green', hex: '#6b6b2f' },
      { name: 'Forest Green', hex: '#3b5c3b' },
      { name: 'Deep Teal', hex: '#255f60' },
      { name: 'Pumpkin', hex: '#c2662a' },
      { name: 'Moss', hex: '#7c8a43' },
      { name: 'Brick Red', hex: '#93342c' },
      { name: 'Warm Aubergine', hex: '#5a3540' },
    ],
    neutrals: [
      { name: 'Cream', hex: '#f0e4cc' },
      { name: 'Chocolate Brown', hex: '#4e3424' },
      { name: 'Khaki', hex: '#a08e63' },
      { name: 'Bronze', hex: '#8a6a3a' },
    ],
    avoid: [
      { name: 'Icy Pink', hex: '#f0cdd8' },
      { name: 'Fuchsia', hex: '#c2247d' },
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Cool Grey', hex: '#9aa0a6' },
      { name: 'Black', hex: '#000000' },
    ],
    avoidReason:
      'Cold, icy colours can clash with golden warmth in the skin and often make the face look washed out.',
    tips: [
      'Cream and off-white are kinder to your face than pure white.',
      'Chocolate brown or deep olive can replace black in an outfit.',
      'Gold, copper and bronze jewellery suit this palette well.',
    ],
    checklist: [
      'A cream or oatmeal shirt in place of a cool white one.',
      'A rust, terracotta or warm olive top near the face.',
      'A camel, chocolate or bronze coat rather than a black one.',
      'One deep accent — teal or forest green — for contrast.',
      'Gold, copper or antique brass jewellery.',
      'Textured fabrics — wool, suede, linen — which hold these colours well.',
      'Warm denim, and brown shoes and belts instead of black.',
    ],
  },
  winter: {
    id: 'winter',
    name: 'Winter',
    tagline: 'Cool and clear',
    description:
      'Winter colours are cool and clear, with strong contrast, like a bright day with snow on the ground. They are either very deep or very icy, and they stay pure rather than dusty.',
    undertone: 'cool',
    depth: 'deep',
    contrast: 'clear',
    accent: '#1f4fa3',
    wear: [
      { name: 'True Red', hex: '#c5102c' },
      { name: 'Royal Blue', hex: '#1f4fa3' },
      { name: 'Emerald', hex: '#0f7a55' },
      { name: 'Fuchsia', hex: '#c2247d' },
      { name: 'Sapphire', hex: '#15487d' },
      { name: 'Icy Pink', hex: '#f0cdd8' },
      { name: 'Icy Blue', hex: '#cfe0ef' },
      { name: 'Deep Violet', hex: '#4a2a7a' },
      { name: 'Pine Green', hex: '#14483c' },
      { name: 'Magenta', hex: '#a51a6d' },
    ],
    neutrals: [
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Black', hex: '#000000' },
      { name: 'Charcoal', hex: '#33363b' },
      { name: 'Cool Navy', hex: '#1c2a45' },
    ],
    avoid: [
      { name: 'Mustard', hex: '#c8971f' },
      { name: 'Terracotta', hex: '#a9552c' },
      { name: 'Olive Green', hex: '#6b6b2f' },
      { name: 'Warm Beige', hex: '#cdb08a' },
      { name: 'Salmon', hex: '#e58b7b' },
    ],
    avoidReason:
      'Muted, golden and earthy colours tend to flatten a cool, high-contrast colouring and can make the skin look sallow.',
    tips: [
      'Pure white and true black both work well right next to your face.',
      'One strong colour with a neutral is usually enough — you do not need many colours at once.',
      'Silver and platinum jewellery suit this palette well.',
    ],
    checklist: [
      'A true white shirt — this is the palette that can wear it.',
      'One strong colour near the face: true red, fuchsia or royal blue.',
      'A black or charcoal coat, which genuinely suits you.',
      'An icy pastel as the light note, rather than a beige one.',
      'Silver or platinum jewellery, and it can be bold.',
      'One clear colour with one neutral — resist wearing three at once.',
      'Crisp fabrics over heathered, muted ones.',
    ],
  },
};

export const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

export const UNDERTONE_LABEL: Record<Undertone, string> = {
  warm: 'Warm (golden)',
  cool: 'Cool (pink or blue)',
  neutral: 'Neutral (a mix of both)',
};
