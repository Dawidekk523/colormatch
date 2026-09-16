export interface SubtypePage {
  /** Matches a `Subtype.id` in `subtypes.ts`. */
  id: string;
  title: string;
  description: string;
  lede: string;
  /** Two paragraphs: what it is, and what makes it different from its parent. */
  intro: string[];
  /** The neighbouring subtype it is most often confused with, and how to tell. */
  confusion: string;
  signs: string[];
  wearing: { heading: string; body: string }[];
  faq: { question: string; answer: string }[];
}

/**
 * The twelve-season pages. Each one is short on purpose — the parent season
 * page carries the long explanation, and this page only has to answer what the
 * subtype changes. Anything that would read the same on two of these pages does
 * not belong on either.
 */
export const SUBTYPE_PAGES: Record<string, SubtypePage> = {
  'light-spring': {
    id: 'light-spring',
    title: 'The Light Spring Colour Palette, With Codes | colormatch',
    description:
      'The light spring color palette: the lightest, freshest spring shades plus three borrowed from summer, with names and hex codes, and how light spring differs from warm spring.',
    lede: 'Spring at its lightest, with a little of summer’s coolness let in at the edges.',
    intro: [
      'Light spring is the corner of spring that sits closest to summer. It keeps the warmth — gold still beats silver, cream still beats optical white — but the shades are the delicate ones: peach rather than poppy, aqua rather than turquoise at full strength. Depth is what this colouring cannot carry: a heavy shade next to the face outweighs it.',
      'Because it borders summer, a few genuinely cool shades work here that no other part of spring can wear. Periwinkle and soft rose are the usual examples, and they are why a light spring can shop from summer rails without everything looking wrong.',
    ],
    confusion:
      'The subtype next door is light summer, and the two share almost the same lightness. The difference is warmth, not depth: hold cream against optical white under daylight. If cream wins, you are on the spring side of the border; if the cold white looks cleaner, you are a light summer.',
    signs: [
      'Bright, saturated colours seem to wear you rather than the other way round.',
      'Your colouring is light overall — hair, skin and eyes sit close together in depth.',
      'Cream, ivory and soft peach suit you better than any strong shade.',
      'Gold jewellery suits you, but fine and delicate rather than heavy.',
    ],
    wearing: [
      {
        heading: 'Keep the whole outfit light',
        body: 'Light spring is the one part of spring where a dark anchor works against you. Two light shades together — ivory with peach, warm beige with aqua — hold the balance better than a light top over a very dark trouser.',
      },
      {
        heading: 'Borrow from summer, not from autumn',
        body: 'When a spring shade feels too strong, the useful substitute is the cool, soft one next door: periwinkle, soft rose, lavender. Reaching the other way, into rust or olive, adds the weight this colouring is least able to carry.',
      },
    ],
    faq: [
      {
        question: 'Is light spring the same as warm spring?',
        answer:
          'No. Warm spring is the middle of the season, where warmth is the strongest quality and the shades are at full strength. Light spring trades some of that warmth for lightness, which is why a few cool summer shades appear in this palette and none appear in warm spring.',
      },
      {
        question: 'Why does this palette contain summer colours?',
        answer:
          'Because that is what a twelve-season subtype is: a parent season leaning towards a neighbour. Light spring borders summer, so the three lightest summer shades belong here. They are shown with their names and codes like everything else, so nothing about the borrowing is hidden.',
      },
      {
        question: 'Do I need to know my subtype to use the free report?',
        answer:
          'No. The free colour report gives you one of the four parent seasons, which is enough to shop with. The subtypes are a finer reading for people who already know their season and want to know which edge of it they sit on.',
      },
    ],
  },
  'warm-spring': {
    id: 'warm-spring',
    title: 'The Warm Spring Colour Palette, With Codes | colormatch',
    description:
      'The warm spring color palette, also called true spring: all ten spring shades with names and hex codes, nothing borrowed from a neighbouring season, and how warm spring differs from light spring.',
    lede: 'Spring in the middle, where warmth is the whole of it and nothing has to be borrowed.',
    intro: [
      'Warm spring — true spring in some books — sits at the centre of the season rather than at either edge. Golden warmth is the quality that decides everything here: peach, coral, golden yellow and apple green all read as if the sun is on them. Nothing in this colouring asks for coolness, and nothing asks to be quietened.',
      'That centre position is why this palette is spring’s own ten shades and nothing else. Light spring gives up some warmth in exchange for lightness and bright spring gives up some in exchange for clarity, so both end up holding shades from a neighbouring season. Warm spring keeps the lot, which makes it the clearest example of spring rather than a thinned-out version of one.',
    ],
    confusion:
      'Light spring is the subtype next door, and both are warm, so warmth will not separate them. Depth will: hold coral at full strength under the chin in daylight, then peach. If coral holds the face and looks like the stronger choice, you are a warm spring; if it takes over and peach is the one that flatters, you are a light spring.',
    signs: [
      'Warm colours flatter you across the whole range, light ones and strong ones alike.',
      'Your skin has a golden or peachy cast rather than a pink one.',
      'Gold jewellery is an obvious yes, and silver looks cold against your skin.',
      'Grey and dusty colours make you look tired, whatever their depth.',
    ],
    wearing: [
      {
        heading: 'Use the full range, not one corner of it',
        body: 'This is the one spring palette with no shade held back, so peach and bright poppy are both yours. Pairing a light warm shade with a strong warm one — ivory with coral, warm beige with golden yellow — uses the range this colouring was given.',
      },
      {
        heading: 'Keep warmth in the neutrals as well',
        body: 'The colour near your face matters less if the coat is wrong. Camel, warm beige and soft navy do the work that grey and black do for other people, and they let a warm accent stay warm rather than fighting a cold background.',
      },
    ],
    faq: [
      {
        question: 'Is warm spring the same as true spring?',
        answer:
          'Yes. Warm spring, true spring and pure spring are three names for the same subtype. Different analysts favour different words, but all of them mean the middle of the season, where warmth is the strongest quality and nothing is borrowed from either neighbour.',
      },
      {
        question: 'Why are there no summer or winter shades in this palette?',
        answer:
          'Because warm spring does not lean towards either of them. A subtype borrows only from the season it leans towards, and this one leans nowhere, so all ten shades come from spring itself. That makes the palette more spring, not less.',
      },
      {
        question: 'How do I tell warm spring from warm autumn?',
        answer:
          'Both are warm, so look at depth and clarity instead. Warm spring shades stay light and clear, like coral and golden yellow, while warm autumn shades are deeper and more earthy, like rust and olive. Put coral beside rust in daylight and one of them will look like it belongs to you and the other like fancy dress.',
      },
    ],
  },
  'bright-spring': {
    id: 'bright-spring',
    title: 'The Bright Spring Colour Palette, With Codes | colormatch',
    description:
      'The bright spring color palette, also called clear spring: the seven clearest spring shades plus three borrowed from winter, with names and hex codes, and how bright spring differs from warm spring.',
    lede: 'Spring at its clearest, with three of winter’s strong colours let in.',
    intro: [
      'Bright spring, or clear spring, is the corner of spring that sits closest to winter. Warmth is still there, but clarity is the quality that decides: bright poppy, golden yellow, apple green and coral all keep their full strength, and a dusty or heathered version of the same colour goes flat on this colouring.',
      'Because it borders winter, three cold, saturated shades belong here that no other part of spring can carry — true red, fuchsia and magenta. They are the reason a bright spring can wear a strong shop-window colour and still look warm underneath it.',
    ],
    confusion:
      'Warm spring is the neighbour, and both wear the same corals and yellows. The borrowed cold red separates them. Hold true red at the jaw in daylight, then bright poppy, which is spring’s own warm red. If true red looks like a colour you could own, you are a bright spring; a warm spring finds it too cold and reaches for the poppy every time.',
    signs: [
      'Strong, saturated colours look normal on you rather than daring.',
      'Muted, dusty or heathered knits leave your face looking flat.',
      'There is a clear step between your hair, your eyes and your skin rather than a gentle blend.',
      'Your hair, skin and eyes each read separately rather than blending into one another.',
    ],
    wearing: [
      {
        heading: 'One clear colour is usually enough',
        body: 'These shades are strong on their own, so a single clear colour with a warm neutral reads better than three brights at once. A true red top with warm beige, or apple green with ivory, gives the colour room to work.',
      },
      {
        heading: 'Avoid the softened version of a good colour',
        body: 'Shops sell the same colour in a clear version and a dusty one, season after season. The dusty one is the trap here. When a shade feels too much, the answer is a lighter clear colour rather than a greyed one.',
      },
    ],
    faq: [
      {
        question: 'Why does this palette contain winter colours?',
        answer:
          'Because bright spring leans towards winter, and true red, fuchsia and magenta are the three winter shades that share its clarity. They are the coldest colours in the palette and the strongest, which is exactly what this subtype can carry, and they are the reason a bright spring is not limited to warm reds and pinks.',
      },
      {
        question: 'What is the difference between bright spring and bright winter?',
        answer:
          'The underlying warmth. Bright spring is a warm palette that has borrowed three cold brights, so ivory and camel still suit it. Bright winter is a cold palette that has borrowed three warm brights, so pure white and black still suit it. The brights look similar on a screen; the neutrals around them do not.',
      },
      {
        question: 'Can I still wear denim?',
        answer:
          'Yes, and the wash is what to watch. A clear mid-blue denim behaves like one of your colours, while a faded, dusty or grey-cast wash pulls in the direction this palette avoids. Treat jeans as a colour choice rather than an automatic neutral.',
      },
    ],
  },
  'light-summer': {
    id: 'light-summer',
    title: 'The Light Summer Colour Palette, With Codes | colormatch',
    description:
      'The light summer color palette: the lightest, gentlest summer shades plus three borrowed from spring, with names and hex codes, and how light summer differs from cool summer.',
    lede: 'Summer at its lightest, with a little of spring’s warmth let in at the edges.',
    intro: [
      'Light summer is the corner of summer that sits closest to spring. It stays cool — soft white rather than cream, silver rather than gold — but it takes the gentlest shades of the season: powder blue, seafoam, soft rose and dusty pink rather than anything deep. Weight is what this colouring cannot carry, and a black jumper at the neckline shows that plainly.',
      'Because it borders spring, three warm shades work here that no other summer can wear: golden yellow, peach and light moss. They belong in small amounts, as a scarf or a knit, and they are why a light summer does not have to shop from cold rails alone.',
    ],
    confusion:
      'Cool summer is the neighbour, and both are cool and gentle, so coolness will not tell you apart. The borrowed warmth will: hold peach at the jaw in daylight. On a light summer it lifts the face and looks like a reasonable colour to own; on a cool summer the skin turns slightly yellow and tired around the mouth.',
    signs: [
      'Your hair, skin and eyes are all light, with little contrast between them.',
      'Dark colours near the face look like they are wearing you.',
      'Soft white suits you better than either cream or bright white.',
      'Silver jewellery suits you, and gold looks heavy rather than wrong.',
    ],
    wearing: [
      {
        heading: 'Two light shades beat one dark one',
        body: 'Powder blue with soft white, or dusty pink with cool grey, holds together better than a light top over a black trouser. When you do need a dark piece, keep it below the waist and let the light colour sit by your face.',
      },
      {
        heading: 'Treat the borrowed warm shades as accents',
        body: 'Peach, golden yellow and light moss are real parts of this palette, but they work in the quantity of a scarf rather than a coat. Used that way they warm an outfit without moving it out of summer.',
      },
    ],
    faq: [
      {
        question: 'Is light summer only for fair skin?',
        answer:
          'No. Skin depth and undertone are separate things, and every season occurs across all skin tones. Light here describes how your colouring sits together — hair, skin and eyes close to one another with no great depth between them — which happens on deep skin as readily as on fair skin.',
      },
      {
        question: 'Does going grey change which colours suit me?',
        answer:
          'It changes the depth of your colouring, not its undertone. Hair that lightens takes the contrast out of a face, which is why people who wore stronger colours at forty often find light summer shades kinder at seventy. The cool or warm reading stays as it was.',
      },
      {
        question: 'These shades look weak on the rail. Am I reading them wrong?',
        answer:
          'No, and that is the usual complaint about this palette. Powder blue and dusty pink have nothing to prove against a shop wall; they only start working when there is a face above them. Hold the garment under your chin in daylight before deciding it is too pale.',
      },
    ],
  },
  'cool-summer': {
    id: 'cool-summer',
    title: 'The Cool Summer Colour Palette, With Codes | colormatch',
    description:
      'The cool summer color palette, also called true summer: all ten summer shades with names and hex codes, nothing borrowed from a neighbouring season, and how cool summer differs from soft summer.',
    lede: 'Summer in the middle, cool the whole way through, with nothing borrowed at either edge.',
    intro: [
      'Cool summer — true summer elsewhere — sits at the centre of the season. Coolness is the quality that decides here, not lightness and not softness: slate blue, soft rose, lavender and soft plum all have a blue or grey cast, and a shade with any gold in it looks out of place beside them.',
      'Nothing in this palette has been borrowed, which is unusual and worth saying plainly: all ten shades are summer’s own. A subtype only takes shades from the season it leans towards, and this one leans nowhere. Far from making it a thinner version of summer, that is what makes it the clearest example of one, and it means a cool summer never has to judge whether a borrowed colour is warm enough to risk.',
    ],
    confusion:
      'Soft summer is the neighbour, and both are cool, so the test is clarity rather than temperature. Hold slate blue at the neckline in daylight, then mauve. On a cool summer the clear grey-blue looks cleaner and mauve looks slightly muddy; on a soft summer it is the other way round, and the clear shade looks a little loud.',
    signs: [
      'Cool colours suit you at every depth this palette offers, light and medium alike.',
      'Your skin has a pink, rose or blue cast rather than a golden one.',
      'Silver jewellery is an obvious yes, and gold looks yellow against your skin.',
      'Warm colours such as rust or mustard make your face look sallow immediately.',
    ],
    wearing: [
      {
        heading: 'Keep the contrast low',
        body: 'This colouring is gentle even at its strongest, so two shades of similar depth work better than one very light and one very dark. Slate blue with cool grey, or soft plum with taupe, sits at the level your face can match.',
      },
      {
        heading: 'Check the denim as well as the top',
        body: 'A warm, orange-cast wash undoes an otherwise cool outfit, and it is easy to miss because jeans feel neutral. A blue-cast or grey-cast denim keeps the whole outfit on the cool side.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between cool summer and soft summer?',
        answer:
          'Cool summer is decided by temperature and soft summer by how much grey a colour carries. Cool summer wears summer’s clearer shades at their own strength, while soft summer wears the quietest of them and borrows three deep autumn shades. A cool summer looks slightly washed out in the softest colours; a soft summer looks overpowered by the clearer ones.',
      },
      {
        question: 'Why are there no spring or autumn shades in this palette?',
        answer:
          'Because cool summer does not lean towards either neighbour. Borrowing happens only in the direction a subtype leans, and this one leans nowhere, so all ten shades are summer’s own. That is what makes it the purest version of the season.',
      },
      {
        question: 'Can cool summer wear black?',
        answer:
          'Not well, and pure black is on the list of shades to avoid for a reason. Navy and charcoal give you the same weight without the hard edge that black puts along the jaw. Keep black to shoes and bags if you own a lot of it.',
      },
    ],
  },
  'soft-summer': {
    id: 'soft-summer',
    title: 'The Soft Summer Colour Palette, With Codes | colormatch',
    description:
      'The soft summer color palette, also called muted summer: the quietest summer shades plus three deep shades borrowed from autumn, with names and hex codes, and how soft summer differs from soft autumn.',
    lede: 'Summer at its quietest, with three of autumn’s deep shades let in.',
    intro: [
      'Soft summer, or muted summer, is the corner of summer that sits closest to autumn. It stays cool, but muting is what decides here: sage green, mauve, soft plum and seafoam all read as if a little grey has been stirred through them, and a clear, saturated colour looks loud on this colouring rather than cheerful.',
      'Because it borders autumn, three deep shades belong here that the rest of summer does not have — warm aubergine, deep teal and forest green. They give this palette an anchor for a coat or a trouser, which is something no other summer subtype is offered.',
    ],
    confusion:
      'Soft autumn is the neighbour, and the two are muted to almost the same degree, so softness will not separate them. Temperature will: hold sage green beside olive green in daylight. If sage settles on your face and olive lays a yellow cast over it, you are a soft summer; a soft autumn gets the opposite result.',
    signs: [
      'Muted colours look right on you, and clear ones look like they are shouting.',
      'Your colouring is medium overall, with no strong break between hair and skin.',
      'Grey suits you, which is unusual, and it does not drain your face.',
      'Very bright and very dark shades both feel like too much next to you.',
    ],
    wearing: [
      {
        heading: 'Let the deep shades carry the weight',
        body: 'Warm aubergine, deep teal and forest green are the darkest colours you have, and they work as the coat, the trouser or the jacket. Putting the quiet summer shades above them gives an outfit shape without any hard contrast.',
      },
      {
        heading: 'Choose fabric that softens the colour',
        body: 'Wool, heathered knits and washed cotton hold muted shades better than anything with a sheen. The same colour in a shiny fabric reads clearer than it is, which is the one direction this palette does not want to go.',
      },
    ],
    faq: [
      {
        question: 'Do I need to know my subtype to use the free report?',
        answer:
          'No. The free report tells you that you are a summer, and that alone rules out most of what goes wrong in a shop. Soft only adds how much grey your colouring wants in a colour, which matters once you are already choosing between two cool blues rather than between blue and rust.',
      },
      {
        question: 'Is soft summer the same as muted summer?',
        answer:
          'Yes, they are two names for one subtype. Muted is the older word and soft the more common one now, and both describe summer pulled towards autumn. If an analyst has called you a muted summer, this is your palette.',
      },
      {
        question: 'Is muted the same as boring?',
        answer:
          'No, though it can look that way on a rail. Muted shades are quiet next to each other but do their work next to a face, which is where you will be wearing them. A soft plum or a deep teal reads as rich on this colouring in a way that a clear purple or turquoise does not.',
      },
    ],
  },
  'soft-autumn': {
    id: 'soft-autumn',
    title: 'The Soft Autumn Colour Palette, With Codes | colormatch',
    description:
      'The soft autumn color palette, also called muted autumn: the quietest autumn shades plus three cool shades borrowed from summer, with names and hex codes, and how soft autumn differs from warm autumn.',
    lede: 'Autumn at its quietest, with three of summer’s cool, greyed shades let in.',
    intro: [
      'Soft autumn, or muted autumn, is the corner of autumn that sits closest to summer. The warmth is still there, but it is held back: olive, moss, warm aubergine and forest green suit this colouring far better than pumpkin or mustard at full strength, which look loud against it.',
      'Because it borders summer, three cool shades belong here that no other part of autumn can wear — sage green, mauve and seafoam. They sit close to the greyed autumn shades without breaking the palette, and they are the reason a soft autumn can wear a grey-green or a dusty mauve and still look warm.',
    ],
    confusion:
      'Warm autumn is the neighbour, and both are warm and earthy. The difference is strength. Hold pumpkin near your face in daylight, then sage green. If pumpkin seems to shout and sage settles quietly, you are a soft autumn; a warm autumn wears pumpkin as an ordinary colour.',
    signs: [
      'Rich, saturated warm colours look heavier on you than you expect.',
      'Your hair, eyes and skin are close in depth, with a blended rather than striking look.',
      'Khaki, olive and bronze are the colours you already own most of.',
      'Gold jewellery suits you, but brushed or antique rather than polished.',
    ],
    wearing: [
      {
        heading: 'Build the outfit from two quiet colours',
        body: 'Olive with khaki, or warm aubergine with mauve, gives the low contrast this colouring wants. A strong colour against a pale one puts the attention on the join rather than on your face.',
      },
      {
        heading: 'Use the cool borrowed shades near the face',
        body: 'Sage, mauve and seafoam are the gentlest things in the palette, which makes them useful for shirts and scarves. Keep the deeper earth colours for the layers further out.',
      },
    ],
    faq: [
      {
        question: 'Why does this palette contain summer colours?',
        answer:
          'Because soft autumn leans towards summer, and the three borrowed shades are the most muted that summer has: sage green, mauve and seafoam. They are cooler than anything else here, which is what the lean means in practice, and they are the shades to reach for when the earth colours feel heavy.',
      },
      {
        question: 'What is the difference between soft autumn and deep autumn?',
        answer:
          'Softness against depth. Soft autumn takes autumn’s quietest shades and borrows from summer, so the whole palette stays medium. Deep autumn takes autumn’s darkest shades and borrows from winter, so it goes the other way. Both are warm; they part company on how much weight the colouring can carry.',
      },
      {
        question: 'Why do so many colours look almost right on me?',
        answer:
          'Because a muted colouring sits near the middle of the range, where few shades clash outright and few lift the face either. That is what makes soft autumn hard to pin down without a palette. The reliable check is the shadow under the eyes: the right shade settles it, and the wrong one deepens it.',
      },
    ],
  },
  'warm-autumn': {
    id: 'warm-autumn',
    title: 'The Warm Autumn Colour Palette, With Codes | colormatch',
    description:
      'The warm autumn color palette, also called true autumn: all ten autumn shades with names and hex codes, nothing borrowed from a neighbouring season, and how warm autumn differs from deep autumn.',
    lede: 'Autumn in the middle, golden all the way through, with nothing borrowed at either edge.',
    intro: [
      'Warm autumn — true autumn in most books — sits at the centre of the season. Golden warmth decides everything here, and it shows in the shades that suit best: terracotta, rust, mustard, moss and pumpkin, colours that look as though they have been left in the sun.',
      'Ten shades, all of them autumn’s, and not one taken from summer or winter. Borrowing is what a subtype does when it leans towards a neighbour, and this one does not lean, so there is nothing to borrow. That makes warm autumn the clearest example of the season rather than a weakened one — in practice it means anything sold as an autumn colour is worth trying on, which is not true of its two siblings.',
    ],
    confusion:
      'Deep autumn is the neighbour, and both are warm and rich, so the question is how much depth your face can take. Hold terracotta at the neckline in daylight, then warm aubergine. If terracotta lifts your face and the darker shade weighs it down, you are a warm autumn; a deep autumn gains from the darker one.',
    signs: [
      'Warm, earthy colours suit you across the range, mid-depth and dark alike.',
      'Your skin has a golden or olive cast rather than a pink one.',
      'Gold, copper and bronze all suit you, and silver looks cold.',
      'Cool pastels such as icy pink leave your face looking washed out.',
    ],
    wearing: [
      {
        heading: 'Use the whole spice range',
        body: 'Nothing has been held back from this palette, so mustard, rust and terracotta are all yours at full strength. Two warm shades together — rust with khaki, mustard with chocolate brown — is the arrangement this colouring was built for.',
      },
      {
        heading: 'Replace black with brown at every level',
        body: 'Chocolate brown, bronze and deep olive do the job black does for other people, and they do it without hardening your face. That means shoes, belts and bags as well as the coat.',
      },
    ],
    faq: [
      {
        question: 'Is warm autumn the same as true autumn?',
        answer:
          'Yes. Warm autumn, true autumn and pure autumn all name the same subtype. The word changes with the system, but each one describes the middle of the season, where warmth is at its strongest and nothing is borrowed from either side.',
      },
      {
        question: 'Why are there no summer or winter shades in this palette?',
        answer:
          'Because warm autumn leans in neither direction. A subtype only borrows from the season it leans towards, and this one stands in the middle, so all ten shades are autumn’s own. The palette is more autumn than its siblings, not less.',
      },
      {
        question: 'Can I wear a cool colour if I like it?',
        answer:
          'Yes, with one condition: keep it away from your face. A cool blue skirt or bag causes no problem at all. It is the shirt, scarf or jumper at your neckline that gets compared with your skin in the mirror.',
      },
    ],
  },
  'deep-autumn': {
    id: 'deep-autumn',
    title: 'The Deep Autumn Colour Palette, With Codes | colormatch',
    description:
      'The deep autumn color palette, also called dark autumn: the darkest autumn shades plus three borrowed from winter, with names and hex codes, and how deep autumn differs from deep winter.',
    lede: 'Autumn at its deepest, with three cold winter shades let in.',
    intro: [
      'Deep autumn, or dark autumn, is the corner of autumn that sits closest to winter. The warmth remains — brown still beats black, cream still beats pure white — but depth is what decides: warm aubergine, brick red, forest green and rust suit this colouring far better than the lighter, softer end of the season.',
      'Because it borders winter, three genuinely cold shades work here that no other part of autumn can carry: deep violet, pine green and sapphire. They are dark enough to match the rest of the palette, and they are why a deep autumn can wear a cold colour without looking drained.',
    ],
    confusion:
      'Deep winter is the neighbour, and both wear very dark colours, so depth will not separate them. Warmth will: hold mustard at the neckline in daylight. On a deep autumn it warms the face rather than draining it; on a deep winter the skin goes sallow and slightly grey around the eyes.',
    signs: [
      'Dark, rich colours suit you, and pale ones look insubstantial next to you.',
      'Your hair is noticeably darker than your skin, giving clear contrast.',
      'Cream and off-white sit better on you than any cool white.',
      'Light, dusty shades leave your face looking unfinished.',
    ],
    wearing: [
      {
        heading: 'Dark with dark, rather than dark with pale',
        body: 'Forest green with chocolate brown, or warm aubergine with deep teal, gives the richness this colouring holds well. A very pale shade next to a very dark one splits the outfit and takes attention off your face.',
      },
      {
        heading: 'Use the cold shades as the strong note',
        body: 'Deep violet, pine green and sapphire are the only cold colours you have, so they stand out even at the same depth as everything else. One of them near the face, with warm neutrals around it, is a useful change from another brown.',
      },
    ],
    faq: [
      {
        question: 'Is deep autumn only for people with dark skin?',
        answer:
          'No. Skin depth and undertone are separate questions, and every season occurs across all skin tones. Deep describes the contrast and weight in your colouring as a whole — usually dark hair and eyes against your own skin — which appears on fair skin as often as on deep skin.',
      },
      {
        question: 'Do these dark colours work in summer clothing?',
        answer:
          'Yes, and the fabric does most of the work. Forest green linen, brick red cotton and a rust shirt read as light for the season while keeping the depth your face wants. Depth is a property of the colour, not of the weight of the cloth.',
      },
      {
        question: 'Should I wear black or not?',
        answer:
          'Chocolate brown, deep olive and forest green all do the job better. Black is not a disaster on a deep autumn the way it is on a light colouring, but it stays a little harder than your own contrast. If you wear it, break it at the neckline with cream or a warm shade.',
      },
    ],
  },
  'deep-winter': {
    id: 'deep-winter',
    title: 'The Deep Winter Colour Palette, With Codes | colormatch',
    description:
      'The deep winter color palette, also called dark winter: the darkest winter shades plus three borrowed from autumn, with names and hex codes, and how deep winter differs from cool winter.',
    lede: 'Winter at its deepest, with three of autumn’s darkest shades let in.',
    intro: [
      'Deep winter, or dark winter, is the corner of winter that sits closest to autumn. It stays cool and clear — black and pure white both work here — but depth decides: deep violet, pine green, sapphire and royal blue do more for this colouring than winter’s icy pastels.',
      'Because it borders autumn, three warm shades work here that no other winter can wear: warm aubergine, brick red and forest green. They are dark enough to keep the palette’s weight, and they are why a deep winter is not restricted to cold colours alone.',
    ],
    confusion:
      'Cool winter is the neighbour, and both are cold and strong. The pale end tells them apart: hold icy pink under the chin in daylight. On a cool winter it lifts the face and reads as a proper colour; on a deep winter it looks thin and leaves the face drained, and a charcoal or pine green next to it puts everything back.',
    signs: [
      'Very dark colours suit you, and pale ones make you look unwell.',
      'People tend to call your look striking rather than gentle.',
      'Black near your face looks deliberate rather than harsh.',
      'Golden and muted colours such as mustard or khaki turn your skin sallow.',
    ],
    wearing: [
      {
        heading: 'One dark shade and one strong colour',
        body: 'Charcoal or cool navy with sapphire, or black with true red, gives this colouring the weight and clarity it wants at the same time. Three colours at once is more than the palette needs.',
      },
      {
        heading: 'Keep the borrowed warm shades deep',
        body: 'Warm aubergine, brick red and forest green work because they are dark. A lighter version of the same warmth — rust or terracotta — sits outside what this colouring can carry, even though it looks like a near relation on the rail.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between deep winter and bright winter?',
        answer:
          'Deep winter is decided by darkness and bright winter by clarity. Deep winter takes winter’s darkest shades and borrows three dark ones from autumn; bright winter takes the most saturated shades and borrows three warm brights from spring. A deep winter looks overtaken by the clearest colours, and a bright winter looks slightly dulled by the darkest.',
      },
      {
        question: 'Why is there no brown in this palette?',
        answer:
          'Because the neutrals here are pure white, black, charcoal and cool navy, and brown carries the golden warmth that flattens a cold colouring. What brown normally offers — weight without the starkness of black — comes instead from warm aubergine and forest green. Those give you the warmth at a depth your face can take.',
      },
      {
        question: 'Does deep winter mean I should wear black all the time?',
        answer:
          'No, though black is genuinely yours. A wardrobe of nothing but black wastes the strongest part of this palette, which is the colour: sapphire, true red, pine green and deep violet all hold their own at the same depth. Use black as the neutral it is, not as the whole outfit.',
      },
    ],
  },
  'cool-winter': {
    id: 'cool-winter',
    title: 'The Cool Winter Colour Palette, With Codes | colormatch',
    description:
      'The cool winter color palette, also called true winter: all ten winter shades with names and hex codes, nothing borrowed from a neighbouring season, and how cool winter differs from bright winter.',
    lede: 'Winter in the middle, cold and clear, with nothing borrowed at either edge.',
    intro: [
      'Cool winter — true winter in most systems — sits at the centre of the season. Coldness decides here, at every depth the palette offers: emerald, sapphire, magenta and deep violet at one end, icy pink and icy blue at the other, with nothing golden anywhere between them.',
      'That middle position is why this palette is winter’s own ten shades and nothing else. Deep winter gives up some coldness in exchange for depth and bright winter gives some up in exchange for brightness, so both hold shades from a neighbour. Cool winter gives up none, which makes it the clearest example of winter rather than a softened one.',
    ],
    confusion:
      'Bright winter is the neighbour, and both are cold and strong. The borrowed warmth separates them: hold apple green at the jaw in daylight, a bright with yellow in it. A bright winter carries it as one more strong colour; on a cool winter the same shade turns the skin sallow, however bright it is.',
    signs: [
      'Cool colours suit you at both extremes, the icy pastels and the deep shades.',
      'Pure white and true black both look right next to your face.',
      'Silver and platinum suit you, and gold looks yellow against your skin.',
      'Warm neutrals such as camel and warm beige make you look tired.',
    ],
    wearing: [
      {
        heading: 'Use the icy shades as your pale colour',
        body: 'Icy pink and icy blue take the place beige holds in other wardrobes: the light shade that goes under everything. They are the part of this palette most people never think to buy, and they suit you better than any warm pale colour.',
      },
      {
        heading: 'One clear colour with one neutral',
        body: 'True red with charcoal, emerald with pure white, magenta with cool navy. This colouring reads as considered when the colour stands alone, and as busy when three strong shades compete.',
      },
    ],
    faq: [
      {
        question: 'Is cool winter the same as true winter?',
        answer:
          'Yes. Cool winter, true winter and pure winter are the same subtype under three names. Each describes the centre of the season, where coldness is the strongest quality and nothing is borrowed from autumn or spring.',
      },
      {
        question: 'Why are there no autumn or spring shades in this palette?',
        answer:
          'Because cool winter leans neither way. Borrowing only happens in the direction of the lean, and this subtype stands in the middle, so all ten shades belong to winter itself. That makes the palette the purest winter of the three, not a smaller one.',
      },
      {
        question: 'Is grey a good neutral for me?',
        answer:
          'Charcoal is, and it is one of this palette’s four neutrals. A mid grey with any warmth in it is less useful, because it neither matches the clarity of your colours nor gives your face the contrast that black and pure white do. When in doubt, go darker with grey rather than lighter.',
      },
    ],
  },
  'bright-winter': {
    id: 'bright-winter',
    title: 'The Bright Winter Colour Palette, With Codes | colormatch',
    description:
      'The bright winter color palette, also called clear winter or vivid winter: the most saturated winter shades plus three borrowed from spring, with names and hex codes, and how bright winter differs from bright spring.',
    lede: 'Winter at its clearest, with three of spring’s warm brights let in.',
    intro: [
      'Bright winter — clear winter, or vivid winter — is the corner of winter that sits closest to spring. It stays cold, but saturation is what decides: true red, fuchsia, magenta and royal blue at full strength suit this colouring, and the same colours in a greyed version go flat against it.',
      'Because it borders spring, three warm brights belong here that no other winter can wear: bright poppy, golden yellow and apple green. They keep the clarity the palette runs on while bringing a warmth the rest of winter does not have.',
    ],
    confusion:
      'Bright spring is the neighbour, and their brights look nearly identical on a screen. The neutrals decide it: hold a black scarf at the jaw in daylight, then camel. If black looks clean and camel looks muddy, you are a bright winter; a bright spring gets the reverse, with camel flattering and black hardening the face.',
    signs: [
      'Clear, saturated colours suit you, and dusty ones fall flat.',
      'Your eyes are bright and clearly marked against the white of the eye.',
      'There is a strong break between the depth of your hair and your skin.',
      'Muted, heathered fabrics look duller on you than on the hanger.',
    ],
    wearing: [
      {
        heading: 'Put the strong colour at the neckline',
        body: 'The brights are what this palette is for, so they belong where your face can benefit: a fuchsia or true red shirt, a royal blue jumper. A dark neutral above the waist wastes the one thing this colouring does better than any other.',
      },
      {
        heading: 'Warm brights, not warm neutrals',
        body: 'Bright poppy, golden yellow and apple green suit you because they are clear, not because they are warm. Camel, khaki and warm beige share the warmth without the clarity, and they are the shades to leave alone.',
      },
    ],
    faq: [
      {
        question: 'Why does this palette contain spring colours?',
        answer:
          'Because bright winter leans towards spring, and bright poppy, golden yellow and apple green are the three clearest shades spring has. Clarity is what they share with the rest of this palette; their warmth is what makes them borrowed rather than native. Used one at a time they are the quickest way to lift an outfit built from black and charcoal.',
      },
      {
        question: 'Is bright winter the same as clear winter?',
        answer:
          'Yes. Bright winter, clear winter and vivid winter are three names for the same subtype, and you will meet all three depending on whose system you are reading. Each one means winter pulled towards spring, where saturation rather than depth is the deciding quality.',
      },
      {
        question: 'These colours feel too loud for me. What then?',
        answer:
          'Wear one of them and keep everything else neutral. A single clear colour against black, charcoal or pure white is far quieter than an outfit built from muted shades that leave your face looking grey. Loudness is usually a matter of quantity rather than of the colour itself.',
      },
    ],
  },
};
