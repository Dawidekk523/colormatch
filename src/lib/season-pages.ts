import type { SeasonId } from './seasons-data';

export interface SeasonPage {
  season: SeasonId;
  /** Lives at `/<slug>/`. Never rename one once it is live. */
  slug: string;
  title: string;
  description: string;
  heading: string;
  lede: string;
  /** Two or three paragraphs. Every season says something different here. */
  intro: string[];
  suits: { lede: string; signs: string[] };
  wearing: { heading: string; body: string }[];
  mistakes: string[];
  faq: { question: string; answer: string }[];
}

/**
 * One page per season, each written for the search it answers ("spring color
 * palette" and so on). The copy is deliberately not a template with the season
 * name swapped in: someone reading two of these should learn two different
 * things, and a page that says nothing new is not worth ranking.
 */
export const SEASON_PAGES: Record<SeasonId, SeasonPage> = {
  spring: {
    season: 'spring',
    slug: 'spring-color-palette',
    title: 'The Spring Colour Palette — Every Shade, With Codes | colormatch',
    description:
      'The full spring color palette: warm, clear shades with names and hex codes, the neutrals that go with them, the colors to avoid, and how to tell if spring is your season.',
    heading: 'The spring colour palette',
    lede: 'Warm, clear and light — the palette of a garden in early morning sun, before the colours have had a chance to dust over.',
    intro: [
      'Spring is the warm, light end of colour analysis. Every shade in it has yellow somewhere inside, and every shade stays bright rather than muted: coral rather than brick, apple green rather than olive, golden yellow rather than mustard. Held against a spring colouring, these shades make the skin look rested; the same face under a heavy, greyed colour tends to look tired instead.',
      'It is the smallest of the four palettes in most wardrobes, mainly because high-street clothing swings between cool pastels and dark neutrals, and spring lives in neither. Knowing the exact shades — and their codes — is what turns a frustrating shopping trip into a short one.',
    ],
    suits: {
      lede: 'Spring is likely to be your season if several of these are true at once. One on its own proves nothing.',
      signs: [
        'Your veins look green rather than blue in daylight.',
        'Gold jewellery sits more comfortably on you than silver.',
        'Ivory and cream look better on you than optical white.',
        'Your hair has warmth in it — golden, honey, strawberry or light auburn.',
        'Black next to your face looks severe rather than smart.',
      ],
    },
    wearing: [
      {
        heading: 'Put the clear colours near your face',
        body: 'Coral, peach, warm turquoise and apple green do their work at the neckline: a top, a scarf, a collar, the frame of your glasses. Below the waist the rule relaxes completely — a skirt or trousers in a colour that is not yours causes no trouble at all.',
      },
      {
        heading: 'Swap the black pieces, not the whole wardrobe',
        body: 'Most of what makes a wardrobe look wrong on a spring colouring is the dark neutral doing the heavy lifting. Soft navy, camel and warm brown do the same job without the drain, and they combine with the brighter shades far more easily than black does.',
      },
      {
        heading: 'Keep white warm',
        body: 'Ivory, cream and warm beige read as "white" in an outfit while staying on the warm side. Optical white, the kind used in office shirts, is the single most common spring mistake — it is bright but cold, and it makes the face look flushed.',
      },
    ],
    mistakes: [
      'Reaching for pastels. Spring is light but not washed out; a chalky pastel flattens it, where a clear peach does not.',
      'Treating every warm colour as safe. Mustard, rust and olive are warm but muted, and they belong to autumn — spring wants warmth with brightness still in it.',
      'Buying the palette in bulk. Four or five correct pieces near the face change more than a wardrobe rebuilt from scratch.',
    ],
    faq: [
      {
        question: 'What is the difference between spring and autumn?',
        answer:
          'Both are warm, so both suit gold and struggle with stark white. The difference is clarity: spring colours are bright and fresh, autumn colours are muted and earthy. The same warm orange exists as spring coral and as autumn rust — if the brighter one lifts your face and the earthy one dulls it, you are spring.',
      },
      {
        question: 'Can spring wear black at all?',
        answer:
          'Away from the face, yes — trousers, shoes, a bag. Right under the chin it tends to look heavy against a light warm colouring. Soft navy or a warm dark brown gives you the same anchoring effect without it.',
      },
      {
        question: 'Is spring only for fair skin?',
        answer:
          'No. Depth of skin and undertone are separate things: spring occurs across the full range of skin tones, from very fair to deep. What the season describes is the direction your colouring leans — warm and clear — not how light or dark you are.',
      },
      {
        question: 'What are the hex codes for?',
        answer:
          'They are the exact recipes for the shades on this page. Paste one into a shop filter, a paint chart or a yarn search and you get that colour rather than an approximation of it.',
      },
      {
        question: 'How do I know for certain that I am a spring?',
        answer:
          'Nothing here is a measurement, so certainty is the wrong bar. Take the free colour report — either from a photo or from seven questions about things you can check at home — and compare the palette it gives you with the one on this page.',
      },
    ],
  },

  summer: {
    season: 'summer',
    slug: 'summer-color-palette',
    title: 'The Summer Colour Palette — Every Shade, With Codes | colormatch',
    description:
      'The full summer color palette: cool, soft shades with names and hex codes, the neutrals that anchor them, the colors to avoid, and how to tell if summer is your season.',
    heading: 'The summer colour palette',
    lede: 'Cool and gently muted — the palette of a garden after rain, where every colour has a little grey mixed into it.',
    intro: [
      'Summer is the cool, soft end of colour analysis. Every shade in it has a little grey mixed in, and every shade stays in the light to middle range rather than going very dark or very bright: powder blue rather than royal blue, dusty pink rather than fuchsia, sage green rather than emerald. Held against a summer colouring, these gentle shades let the face stay the strongest thing in the picture.',
      'The mistake worth guarding against is not spring or autumn, which are warm and therefore obviously wrong. It is winter. Both summer and winter are cool, so both suit silver and both look poor in mustard or camel, and people routinely sort themselves into the wrong one. The dividing line is clarity: winter colours are pure and full strength, summer colours are softened. A summer in a true red is not wearing a warm colour by mistake, only one that is too loud for the face behind it.',
    ],
    suits: {
      lede: 'Summer is likely to be your season if several of these are true at once. One on its own proves nothing.',
      signs: [
        'Your veins look blue or faintly violet in daylight.',
        'Silver jewellery sits more comfortably on you than gold.',
        'Soft white and oyster look better on you than optical white.',
        'Your hair has an ashy quality — mousy, cool brown, or greying without brassiness.',
        'A strong, bright colour near your face seems to be wearing you rather than the other way round.',
      ],
    },
    wearing: [
      {
        heading: 'Keep two colours close in lightness',
        body: 'This is the one palette built on gentle contrast. Powder blue with cool grey, or dusty pink with taupe, look settled because neither piece shouts over the other. One very dark piece with one very bright piece is a winter arrangement, and on a summer colouring it tends to look borrowed.',
      },
      {
        heading: 'Take the dusty version of any colour you like',
        body: 'Almost every colour exists in both a clear and a softened form, and summer wants the softened one. Slate blue instead of a vivid blue, mauve or soft plum instead of a strong purple, seafoam instead of a sharp green. The shade family can stay the same; only the amount of grey in it changes.',
      },
      {
        heading: 'Let navy be the anchor instead of black',
        body: 'Every wardrobe needs something dark for coats, trousers and evenings. Navy, charcoal and soft plum do that work on a summer colouring, where pure black draws a hard line under the chin and makes the skin look drained by comparison.',
      },
    ],
    mistakes: [
      'Assuming that cool means winter. Silver suiting you narrows the choice to two seasons, not one — the second question is whether the colour is clear or softened.',
      'Adding one bright accent to lift a soft outfit. Tomato red or orange near the face overpowers a soft colouring and pulls attention away from it.',
      'Reaching for camel as the safe neutral. It carries golden warmth; taupe and cool grey fill the same slot without fighting the palette.',
    ],
    faq: [
      {
        question: 'What is the difference between summer and winter?',
        answer:
          'Both are cool, so both suit silver and both look wrong in mustard or camel — the difference is clarity. Winter shades are pure and at full strength, summer shades have grey softened into them. Powder blue and royal blue are the same colour family at two different settings, and the one that lets your face stay the focus is your answer.',
      },
      {
        question: 'Does summer mean I have to wear pale colours?',
        answer:
          'No — it means gentle rather than pale. Mauve, soft plum and slate blue have real depth in them, and navy is a proper dark. What summer avoids is not depth but harshness, so a medium, slightly greyed colour carries further than a chalky pastel does.',
      },
      {
        question: 'I have deep skin. Can I still be a summer?',
        answer:
          'Yes. Depth of skin and undertone are two separate things, and every season occurs across the whole range of skin tones. Summer describes a cool, softly contrasted colouring, which is as common in deep skin as in fair skin.',
      },
      {
        question: 'Why does my navy look fine but my black does not?',
        answer:
          'Navy is dark without being absolute, so it sits closer to the softness of your own colouring. Pure black is the maximum of the scale, and next to a summer face it creates a contrast the face cannot meet. Charcoal behaves in the same forgiving way as navy.',
      },
      {
        question: 'How can I test this at home?',
        answer:
          'Stand by a window in daylight and hold a clear, true red against your face, then a dusty pink or soft rose. On a summer colouring the bright one takes over and the softened one lets your features read normally. If the reverse happens, look at winter instead, and take the free colour report to check the result.',
      },
    ],
  },

  autumn: {
    season: 'autumn',
    slug: 'autumn-color-palette',
    title: 'The Autumn Colour Palette — Every Shade, With Codes | colormatch',
    description:
      'The full autumn color palette: warm, earthy shades with names and hex codes, the neutrals to build on, the colors to avoid, and how to tell if autumn is your season.',
    heading: 'The autumn colour palette',
    lede: 'Warm and earthy — the palette of turning leaves, spice and old gold, where richness matters more than brightness.',
    intro: [
      'Autumn is the warm, deep end of colour analysis. The shades are golden but muted, and they carry weight rather than sparkle: rust, terracotta, olive green, mustard, forest green, deep teal. Held against an autumn colouring, these earthy shades match the warmth already in the skin, and the face looks solid rather than washed out.',
      'The season most often confused with autumn is spring, not one of the cool pair. Both are warm, so both suit gold and both struggle beside pure white — the avoid list here exists because cold, icy colours clash with golden skin and leave the face looking drained. What separates them is brightness. Spring keeps its warmth clear and light; autumn keeps its warmth muted and deep. The same orange appears as a spring coral and as an autumn rust, and only one of the two will look like it belongs to you.',
    ],
    suits: {
      lede: 'Autumn is likely to be your season if several of these are true at once. One on its own proves nothing.',
      signs: [
        'Your veins look green rather than blue in daylight.',
        'Gold, copper or bronze jewellery suits you better than silver.',
        'Cream and oatmeal look better on you than pure white.',
        'Your hair has depth and warmth — chestnut, auburn, bronze or dark golden brown.',
        'Icy pink or fuchsia near your face looks like fancy dress rather than clothing.',
      ],
    },
    wearing: [
      {
        heading: 'Make brown your dark instead of black',
        body: 'Chocolate brown, bronze and deep olive green give an outfit its weight without the coldness of black. The same swap is worth making in the small things: brown shoes, a brown belt and a warm-toned watch strap keep an outfit consistent, where one black accessory can look like it came from another wardrobe.',
      },
      {
        heading: 'Let texture carry the colour',
        body: 'Muted shades depend on the surface they sit on. Wool, suede, linen and heavy cotton hold rust and khaki properly, while a flat synthetic in the same shade reads thinner and slightly dead. This is the palette where the fabric matters as much as the hex code.',
      },
      {
        heading: 'Find contrast in depth, not in brightness',
        body: 'An autumn outfit gets its interest from a dark shade against cream, or deep teal against khaki — not from one loud colour in the middle of quiet ones. Forest green and warm aubergine are the accents that do this work while staying inside the palette.',
      },
    ],
    mistakes: [
      'Treating every warm colour as autumn. Clear coral and golden yellow are warm but bright, and they belong to spring — autumn wants the same warmth with the brightness taken out.',
      'Keeping the pure white shirt. It is the single coldest thing most people own, and against golden skin it makes the face look tired. Cream or oatmeal does the same job in an outfit.',
      'Using cool grey as the everyday neutral. Khaki, bronze and chocolate brown are the autumn equivalents, and they sit with the rest of the palette instead of cooling it down.',
    ],
    faq: [
      {
        question: 'What is the difference between autumn and spring?',
        answer:
          'Both are warm, so gold jewellery and cream suit either one — the difference is brightness. Spring shades stay clear and fresh, autumn shades are muted and earthy. Hold a bright coral next to rust: if the coral looks thin and the rust looks natural on you, autumn is the better fit.',
      },
      {
        question: 'Does autumn mean muddy or dull colours?',
        answer:
          'No. Muted is not the same as dull, and the palette includes deep teal, brick red, pumpkin and forest green, which are strong colours by any measure. What they share is that the brightness has been turned down rather than the richness.',
      },
      {
        question: 'Autumn is described as deep. Does that mean my skin has to be dark?',
        answer:
          'No — depth here describes the colours, not the person wearing them. Undertone and skin depth are separate things, and autumn colouring appears across the full range of skin tones, from very fair with red or golden warmth through to deep. The test is whether warm and muted shades suit you, not how light or dark you are.',
      },
      {
        question: 'Can autumn wear navy or black?',
        answer:
          'Away from the face both are workable. Right at the neckline they read as cold next to golden skin, which is why chocolate brown, forest green and deep teal are the dark options in this palette. Keeping black to shoes and bags solves most of it.',
      },
      {
        question: 'How do I find out whether autumn is my season?',
        answer:
          'Compare your own colouring with the palette on this page in daylight rather than under a bulb, which adds warmth that is not there. The free colour report gives you a full palette from a photo or from seven questions you can answer at home, and you can hold it against these shades to confirm.',
      },
    ],
  },

  winter: {
    season: 'winter',
    slug: 'winter-color-palette',
    title: 'The Winter Colour Palette — Every Shade, With Codes | colormatch',
    description:
      'The full winter color palette: cool, clear shades with names and hex codes, the neutrals that carry them, the colors to avoid, and how to tell if winter is your season.',
    heading: 'The winter colour palette',
    lede: 'Cool and clear — the palette of frost and ink, where colours stay true and contrast is the point.',
    intro: [
      'Winter is the cool, clear end of colour analysis. Its shades are pure rather than dusty, and they arrive at two extremes: full-strength colours such as true red, royal blue, emerald and fuchsia, and icy light ones such as icy pink and icy blue. Held against a winter colouring, a strong clear colour looks ordinary rather than daring, because the contrast in the clothing matches the contrast already in the face.',
      'This is also the one palette that genuinely wears true black and optical white, right up against the skin, with nothing softening them. That matters because most general advice pushes in the opposite direction — wear something gentler, something warmer, something less stark. Followed on a winter colouring, that advice flattens everything. Muted, golden and earthy shades make cool skin look sallow, and a softened version of a winter colour usually looks like a faded one.',
    ],
    suits: {
      lede: 'Winter is likely to be your season if several of these are true at once. One on its own proves nothing.',
      signs: [
        'Your veins look blue or violet in daylight.',
        'Silver or platinum jewellery suits you better than gold.',
        'A pure white shirt looks crisp on you rather than harsh.',
        'There is a marked difference in depth between your hair and your skin.',
        'Terracotta, warm beige and mustard near your face make your skin look sallow.',
      ],
    },
    wearing: [
      {
        heading: 'Use true black and true white as they are',
        body: 'No other palette can do this. A black coat, a white shirt and one clear colour between them is a complete winter outfit, and the two neutrals need no warming, greying or dulling to become wearable. Charcoal and cool navy behave the same way when black feels too final.',
      },
      {
        heading: 'One strong colour with one neutral',
        body: 'The colours here are at full strength, so they compete with each other rather than blending. True red with black, or emerald with pure white, reads as deliberate; three clear colours at once reads as noise. The restraint is what makes it work.',
      },
      {
        heading: 'Take the light notes icy rather than warm',
        body: 'When an outfit needs something pale, use icy blue or icy pink instead of cream, oatmeal or warm beige. They carry the same lightness while staying on the cool side, and they sit beside the strong colours without introducing a golden cast.',
      },
    ],
    mistakes: [
      'Softening the palette to seem less severe. Dusty, heathered and chalky versions of winter colours drain the contrast the colouring depends on, and the result looks faded rather than gentle.',
      'Assuming cool means pale. Winter runs to both ends — pine green and deep violet at one, icy blue at the other — and a mid-toned dusty shade fits neither.',
      'Letting warm neutrals in through accessories. A warm beige scarf, or a bag and shoes in terracotta, will undo an otherwise cool outfit, because they sit closest to the face and hands.',
    ],
    faq: [
      {
        question: 'What is the difference between winter and summer?',
        answer:
          'Both are cool, so silver suits either one and both look wrong in mustard — the difference is strength. Winter colours are clear and undiluted, summer colours have grey softened into them. If a pure fuchsia looks natural on you rather than startling, you are in winter territory.',
      },
      {
        question: 'Can I really wear black right next to my face?',
        answer:
          'Yes, and winter is the only season where that is true without qualification. A cool, high-contrast colouring meets black on its own terms instead of being flattened by it. The same applies to pure white, which is why the plain white shirt that defeats most people works here.',
      },
      {
        question: 'I am very fair. Is winter not meant for darker colouring?',
        answer:
          'Winter is not about how light or dark your skin is. Undertone and skin depth are separate, and very fair, mid and deep skin all occur within this season — what they share is coolness and clear contrast. Contrast is the gap between your hair, your eyes and your skin, not the depth of any one of them.',
      },
      {
        question: 'Do I have to wear bright colours every day?',
        answer:
          'No. The palette rests on its neutrals — black, charcoal, cool navy and pure white — and those can be most of a wardrobe. One clear colour at the neckline, worn a couple of times a week, is enough to keep the effect.',
      },
      {
        question: 'How do I confirm that winter is my season?',
        answer:
          'In daylight, hold an optical white shirt to your face, then a cream one. Winter is the season where the cold white wins outright and the cream one looks slightly dirty against the skin. The free colour report, from a photo or from seven questions, will give you the full palette to check against this page.',
      },
    ],
  },
};

export const SEASON_PAGE_LIST = Object.values(SEASON_PAGES);
