import type { UndertoneId } from './undertones';

export interface UndertonePage {
  id: UndertoneId;
  title: string;
  description: string;
  heading: string;
  lede: string;
  intro: string[];
  /** How to check, at home, that this is the undertone you have. */
  tests: { heading: string; body: string }[];
  wearing: string[];
  faq: { question: string; answer: string }[];
}

/**
 * The undertone pages answer a different question from the season pages. A
 * season is a whole colouring — undertone, depth and contrast together — while
 * an undertone is only the first of those three. Someone searching for "warm
 * skin tone colours" has usually worked out that much and no more, so these
 * pages start there and point at the season pages for the rest.
 */
export const UNDERTONE_PAGES: Record<UndertoneId, UndertonePage> = {
  warm: {
    id: 'warm',
    title: 'Colours for a Warm Skin Tone, With Codes | colormatch',
    description:
      'The colors that suit a warm skin tone, with names and hex codes: which shades to wear near your face, which to be careful with, and how to check your undertone at home.',
    heading: 'Colours for a warm skin tone',
    lede: 'Gold suits you, cream beats optical white, and the shades that work have yellow somewhere inside them.',
    intro: [
      'A warm undertone means your skin has gold, peach or yellow underneath it, whatever its depth. It is not the same thing as being tanned or being dark: very fair skin is often warm, and deep skin is often cool. Undertone is the direction your colouring leans, and it does not change with the seasons.',
      'Two of the four colour seasons are warm — spring and autumn — so a warm undertone gives you both of their palettes to shop from. Spring supplies the clear, light shades and autumn the deep, earthy ones. The colours below are the five strongest from each, because those are the ones that make the undertone unmistakable.',
    ],
    tests: [
      {
        heading: 'The jewellery test',
        body: 'Hold gold against one side of your face and silver against the other, in daylight. On a warm undertone the gold looks like it belongs and the silver looks slightly hard, as if it has been laid on top of the skin rather than sitting with it.',
      },
      {
        heading: 'The white test',
        body: 'Hold an optical white shirt under your chin, then a cream or ivory one. Warm skin looks flushed or tired beside the cold white and settles beside the cream. This is the test people find most convincing, because the difference is easy to see even when you are not sure what you are looking for.',
      },
      {
        heading: 'The vein test',
        body: 'Look at the inside of your wrist by a window. Veins that read green point warm, veins that read blue or violet point cool. Take it as one vote of three rather than a verdict — lighting and skin depth both interfere with it.',
      },
    ],
    wearing: [
      'Keep the warm colour at the neckline, where the light bounces from the fabric onto your face. Below the waist it makes almost no difference.',
      'Replace optical white with ivory or cream in the pieces you wear most: shirts, collars, scarves.',
      'If you want a dark neutral, take camel, chocolate brown or soft navy before black.',
      'Gold, copper and bronze jewellery all sit with a warm undertone. Silver is not forbidden, but it works better away from the face.',
    ],
    faq: [
      {
        question: 'Does a warm skin tone mean dark skin?',
        answer:
          'No. Depth and undertone are two separate things. Skin can be very fair and warm, or deep and cool, and every combination occurs. Undertone describes which way the colour leans, not how much of it there is.',
      },
      {
        question: 'Is warm the same as being a spring or an autumn?',
        answer:
          'Warm is what spring and autumn have in common, so knowing you are warm narrows it to those two. Which of them you are depends on whether the shades that suit you are clear and light or muted and deep, and the free colour report works that out from a photo or seven questions.',
      },
      {
        question: 'My veins look green in one light and blue in another. What now?',
        answer:
          'That happens often, which is why the vein test is the weakest of the three. Use the jewellery and white tests instead, both by a window rather than under a bulb, and take whichever answer two of the three agree on.',
      },
      {
        question: 'Can a warm skin tone wear pink or blue?',
        answer:
          'Yes, in their warm versions. Salmon pink and warm turquoise sit in the spring palette, and coral does the work most people want from pink. What tends not to work is the icy version of either, because the coldness is the problem rather than the colour family.',
      },
    ],
  },
  cool: {
    id: 'cool',
    title: 'Colours for a Cool Skin Tone, With Codes | colormatch',
    description:
      'The colors that suit a cool skin tone, with names and hex codes: silver over gold, optical white over cream, and how to check your undertone at home.',
    heading: 'Colours for a cool skin tone',
    lede: 'Silver suits you, optical white beats cream, and the shades that work have blue or pink somewhere inside them.',
    intro: [
      'A cool undertone means your skin has pink, red or blue underneath it. Depth and undertone are counted separately, and every undertone occurs at every depth: cool colouring turns up in the palest skin and in the deepest, and being cool says nothing about how light or dark you are. It is the direction your colouring leans, and sun does not change it.',
      'Two of the four colour seasons are cool — summer and winter — so knowing you are cool narrows four palettes down to two. Summer holds the soft, greyed shades and winter the clear, strong ones. The ten below are the five strongest from each, because a strong shade is where the undertone shows most plainly, and the free colour report settles which of the two seasons is yours.',
    ],
    tests: [
      {
        heading: 'Silver against gold',
        body: 'Put a silver chain at one side of your jaw and a gold one at the other, by a window. On a cool undertone the silver settles into the face while the gold sits on top of it, looking slightly orange against the skin rather than part of it.',
      },
      {
        heading: 'Paper against cream',
        body: 'Hold a sheet of plain copier paper under your chin, then a cream envelope or an ivory shirt. Cool skin looks clean and even beside the paper white and slightly yellow or muddy beside the cream, which is the reverse of what a warm colouring does.',
      },
      {
        heading: 'How you flush',
        body: 'Notice what your face does after a brisk walk or a cold morning. Cool skin flushes pink or red, sometimes blotchily; warm skin deepens towards gold or peach. It is a slow test rather than a quick one, but it does not depend on the lighting you happen to be standing in.',
      },
    ],
    wearing: [
      'The colour only has to be right where light reflects up into your face — a top, a collar, a scarf, a frame. Skirts, trousers and shoes are free.',
      'Optical white is open to you, with one caveat: a winter colouring takes it at full strength, while a summer is usually better in soft white or oyster.',
      'Navy and charcoal work for both cool seasons. True black belongs to winter and tends to sit heavily on a summer, which is why it appears in the shades to be careful with above.',
      'Silver, platinum and white gold sit with a cool undertone. Gold is not forbidden, but it does less damage away from the face.',
    ],
    faq: [
      {
        question: 'Summer and winter both look plausible. Which am I?',
        answer:
          'Judge strength rather than temperature, since you already have the temperature. Winter takes colour at full clarity — true red, royal blue, fuchsia — next to pure white or black. Summer wants those same colours with grey mixed in: soft rose, slate blue, lavender. If strong colours seem to wear you rather than the other way round, you are a summer, and the free colour report decides it from a photo or from seven questions.',
      },
      {
        question: 'Is black a cool colour that every cool person can wear?',
        answer:
          'Black is cool, but it belongs to winter rather than to cool skin in general. On a softer cool colouring it pulls attention away from the face and leaves it looking drained. Navy and charcoal do the same job in an outfit without that cost.',
      },
      {
        question: 'Can a cool skin tone wear brown and beige?',
        answer:
          'Yes, in their cool versions. Taupe is already in the summer palette and does everything most people want from a neutral brown. Golden camel is the one that fights a cool undertone, and it sits in the shades to be careful with above; warm beige is the same problem in a lighter coat.',
      },
      {
        question: 'What about orange and coral?',
        answer:
          'Those are the hardest two, which is why orange and tomato red appear in the warnings above. Away from the face — a bag, a skirt, a coat lining — they cause no trouble at all. At the neckline, true red and fuchsia give you the same lift that people usually want from a warm bright.',
      },
    ],
  },
  neutral: {
    id: 'neutral',
    title: 'Colours for a Neutral Skin Tone, With Codes | colormatch',
    description:
      'The colors that suit a neutral skin tone, with names and hex codes: why the usual tests come back split, what a split result means, and the softened shades that work.',
    heading: 'Colours for a neutral skin tone',
    lede: 'Gold and silver both look acceptable, your veins read neither green nor blue, and the shades that work lean least in either direction.',
    intro: [
      'A neutral undertone means your skin carries warmth and coolness in roughly equal measure, with neither taking the lead. How deep your skin is has no bearing on it: depth and undertone are two different measurements, and every undertone, neutral included, is found at every depth there is. What neutral changes is which shades sit comfortably near your face, not how much colour you have.',
      'Because neutral sits between, it is not served by a palette built to make an undertone obvious. The ten shades below are the five quietest from spring, a warm season, and the five quietest from summer, a cool one — aqua blue, salmon pink and periwinkle on the warm side, sage green, seafoam and powder blue on the cool side. Softened colour is the common ground. A shade at full strength picks a side your skin has not picked.',
    ],
    tests: [
      {
        heading: 'When both metals pass',
        body: 'Hold gold near one cheek and silver near the other in daylight and look for the one that fails. On a neutral undertone neither does: both look reasonable and you end up choosing on preference. That non-result is itself the result, not a test you have muddled.',
      },
      {
        heading: 'When neither white wins',
        body: 'Try an optical white shirt under your chin and then a cream one. A warm colouring goes visibly tired beside the cold white and a cool one goes yellow beside the cream. A neutral colouring does neither strongly — both are wearable, and the difference is small enough that you have to look twice.',
      },
      {
        heading: 'When the wrist says nothing',
        body: 'Veins on a neutral wrist tend to read grey, or as a mixture, or to swap answers between one window and another. People usually repeat this one hoping it will resolve. A mixed reading taken twice on two different days is worth more than a confident reading taken once under a bulb.',
      },
    ],
    wearing: [
      'Take the middle of a colour rather than either end: a mid slate blue rather than an icy or an electric one, a soft rose rather than a coral or a fuchsia.',
      'Both metals are open to you, so choose by outfit instead of by rule. Wearing the two together is easier on a neutral undertone than on any other.',
      'For white, soft white and oyster split the difference between optical white and cream and cause no trouble in either direction.',
      'Navy is the safe dark neutral. Black is in the warnings above for a reason, so if you wear it, break it with a lighter colour at the collar rather than flat to the jaw.',
    ],
    faq: [
      {
        question: 'My results came back split. Have I done the tests wrong?',
        answer:
          'Almost certainly not. A split result is what a neutral undertone looks like from the outside, because the tests are built to detect a lean and you do not have much of one. If gold and silver both pass and your veins read neither colour, record that as the answer rather than as a failure and move on to depth and contrast.',
      },
      {
        question: 'Does neutral mean I can wear anything?',
        answer:
          'No, and that is the usual misreading. Neutral skin has no strong lean for a colour to clash with, but it is easily overwhelmed: a shade at full strength takes the attention and the face comes second. What you gain is breadth across the colour wheel. What you give up is the brightest and the iciest version of each shade.',
      },
      {
        question: 'Which season is a neutral undertone?',
        answer:
          'Neutral is not a season of its own. The palette here is drawn from spring and summer because they pair a warm season with a cool one, but the season that actually fits you is decided by depth and contrast rather than by undertone. The free colour report works that out from a photo or from seven questions.',
      },
      {
        question: 'Is neutral the same thing as olive?',
        answer:
          'No. Neutral describes an undertone that leans neither warm nor cool. Olive describes a green or grey cast sitting over the skin, which can appear on warm-leaning and cool-leaning colouring alike. You can be both at once, and the olive page deals with the cast.',
      },
    ],
  },
  olive: {
    id: 'olive',
    title: 'Colours for an Olive Skin Tone, With Codes | colormatch',
    description:
      'The colors that suit olive skin, with names and hex codes: why olive is a cast rather than an undertone, and the muted shades that sit alongside the green instead of fighting it.',
    heading: 'Colours for an olive skin tone',
    lede: 'Olive is a green or grey cast across the skin, and the shades that suit it are muted rather than clear.',
    intro: [
      'Olive is not a fifth undertone. It is a cast — a faint green or grey laid over the skin — and it sits across the warm-and-cool question rather than inside it, so olive skin can be warm-leaning or cool-leaning and still be olive. The cast is equally independent of how light or deep the skin is, because depth is measured on its own and any undertone can arrive at any depth.',
      'That is why this page borrows from autumn and summer, two seasons that share no undertone but do share softness. The ten shades are the five quietest from each: olive green, moss, forest green, deep teal and warm aubergine from autumn, then sage green, seafoam, powder blue, soft plum and mauve from summer. A clear, bright colour fights the green in the skin and the skin loses. A muted one sits alongside it instead.',
    ],
    tests: [
      {
        heading: 'A white sheet at the jaw',
        body: 'Hold a plain white sheet of paper flat against your jaw in daylight and look at the skin immediately above the edge. An olive cast shows as a faint green or grey where other skin reads pink, peach or golden. This check finds the cast and says nothing about warm or cool.',
      },
      {
        heading: 'Beside a clear yellow',
        body: 'Bring something strongly yellow up near your face — a lemon, a bright tea towel. An olive cast turns sallow beside a clear yellow, and your eye goes to the skin rather than to the colour. Beside mustard or moss the same face settles down.',
      },
      {
        heading: 'What happens at the foundation counter',
        body: 'If you have repeatedly been told that base makeup looks orange or pink on you, and the shade that matches your depth still sits wrong, that is the cast showing rather than a mistake in matching. Shades built for pink or golden skin are visibly off on a green one.',
      },
    ],
    wearing: [
      'Muted matters more here than warm or cool. Olive green, moss and sage green all work because they meet the cast instead of arguing with it.',
      'Keep pure white and true black away from the face; both push the green forward. Cream, oatmeal or navy at the collar do the same job without that effect.',
      'If you want one bright colour in an outfit, put it below the waist or carry it, and leave the softened shade at the neckline.',
      'Both metals can work, since olive occurs on warm-leaning and cool-leaning skin alike. Try each at the jaw in daylight rather than assuming one is ruled out.',
    ],
    faq: [
      {
        question: 'Is olive an undertone in its own right?',
        answer:
          'Not in the way warm, cool and neutral are. Those three describe which way the colour in your skin leans, while olive describes a cast lying over it. You still have a lean underneath, warm or cool, and the cast sits on top of whichever one it is.',
      },
      {
        question: 'Which season does olive skin usually land in?',
        answer:
          'Olive skin occurs in all four seasons, so the cast does not decide the answer on its own. This page draws on autumn and summer because both are muted, and a muted shade is the one most likely to sit alongside a green cast rather than fight it. The free colour report names one of the four seasons from a photo or from seven questions, and it reads your whole colouring rather than the cast alone.',
      },
      {
        question: 'Why does grey look wrong on me when it suits everybody else?',
        answer:
          'Cool grey in particular pulls the green in olive skin forward, which is why it appears in the shades to be careful with above. Warmer greys and taupe are easier to wear, and navy does the job of grey in most outfits without the same effect.',
      },
      {
        question: 'Can olive skin wear green, or does it clash?',
        answer:
          'Green is among the easiest colours for olive skin, provided it is muted. Olive green, moss and sage green carry the same greyed quality the skin does, so they read as agreement rather than comparison. What does clash is a clear bright green such as emerald or apple green, because it sets up a comparison the skin cannot win.',
      },
    ],
  },
};
