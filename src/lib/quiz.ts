import { seasonFromTraits, type ColourTraits } from './season';
import type { SeasonId, Undertone } from './seasons-data';

export interface QuizScore {
  /** Positive leans warm, negative leans cool. */
  warm: number;
  /** Positive leans light, negative leans deep. */
  light: number;
  /** Positive leans clear, negative leans soft. */
  clear: number;
}

export interface QuizOption {
  id: string;
  label: string;
  score: Partial<QuizScore>;
}

export interface QuizQuestion {
  id: string;
  question: string;
  help?: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'veins',
    question: 'Look at the veins on the inside of your wrist in daylight. What colour are they?',
    help: 'Daylight near a window works better than a lamp.',
    options: [
      { id: 'green', label: 'Mostly green or olive', score: { warm: 2 } },
      { id: 'blue', label: 'Mostly blue or purple', score: { warm: -2 } },
      { id: 'mixed', label: 'A mix of both, or hard to tell', score: {} },
    ],
  },
  {
    id: 'jewellery',
    question: 'Which jewellery looks better against your skin?',
    options: [
      { id: 'gold', label: 'Gold', score: { warm: 2 } },
      { id: 'silver', label: 'Silver', score: { warm: -2 } },
      { id: 'both', label: 'Both look about the same', score: {} },
    ],
  },
  {
    id: 'shirt',
    question: 'You hold a bright white shirt and a cream shirt next to your face. Which one suits you better?',
    options: [
      { id: 'cream', label: 'The cream one', score: { warm: 2 } },
      { id: 'white', label: 'The bright white one', score: { warm: -2 } },
      { id: 'either', label: 'I cannot see a difference', score: {} },
    ],
  },
  {
    id: 'sun',
    question: 'What happens to your skin after time in the sun?',
    options: [
      { id: 'tans', label: 'It tans easily and rarely burns', score: { warm: 1, light: -1 } },
      { id: 'burns-then-tans', label: 'It burns first, then tans', score: {} },
      { id: 'burns', label: 'It burns easily and rarely tans', score: { warm: -1, light: 1 } },
    ],
  },
  {
    id: 'hair',
    question: 'What is your natural hair colour? If it has gone grey, think of the colour you had before.',
    options: [
      { id: 'light', label: 'Light blonde or light brown', score: { light: 2 } },
      { id: 'medium', label: 'Medium brown, red or auburn', score: { warm: 1 } },
      { id: 'dark', label: 'Dark brown or black', score: { light: -2, clear: 1 } },
      { id: 'grey', label: 'Grey or white now, and I want to use that', score: { light: 2, warm: -1, clear: -1 } },
    ],
  },
  {
    id: 'eyes',
    question: 'What colour are your eyes?',
    options: [
      { id: 'light-cool', label: 'Light blue, grey or soft green', score: { light: 1, warm: -1, clear: -1 } },
      { id: 'warm', label: 'Hazel, amber or light brown', score: { warm: 2 } },
      { id: 'bright', label: 'Bright blue or strong green', score: { clear: 2, warm: -1 } },
      { id: 'dark', label: 'Dark brown or almost black', score: { light: -2, clear: 1 } },
    ],
  },
  {
    id: 'contrast',
    question: 'Standing in front of a mirror, how different are your hair and your skin in lightness?',
    options: [
      { id: 'strong', label: 'Very different — dark hair, light skin, or the other way round', score: { clear: 2 } },
      { id: 'medium', label: 'Somewhat different', score: {} },
      { id: 'soft', label: 'Quite similar, they blend together', score: { clear: -2 } },
    ],
  },
];

export type QuizAnswers = Record<string, string>;

export function unansweredQuestionIds(answers: QuizAnswers): string[] {
  return QUIZ_QUESTIONS.filter((q) => {
    const chosen = answers[q.id];
    return !chosen || !q.options.some((o) => o.id === chosen);
  }).map((q) => q.id);
}

export function scoreQuiz(answers: QuizAnswers): QuizScore {
  const total: QuizScore = { warm: 0, light: 0, clear: 0 };
  for (const question of QUIZ_QUESTIONS) {
    const option = question.options.find((o) => o.id === answers[question.id]);
    if (!option) continue;
    total.warm += option.score.warm ?? 0;
    total.light += option.score.light ?? 0;
    total.clear += option.score.clear ?? 0;
  }
  return total;
}

/** A clear warm or cool lean needs at least two points; anything closer is neutral. */
export function undertoneFromScore(warm: number): Undertone {
  if (warm >= 2) return 'warm';
  if (warm <= -2) return 'cool';
  return 'neutral';
}

export function traitsFromScore(score: QuizScore): ColourTraits {
  return {
    undertone: undertoneFromScore(score.warm),
    depth: score.light >= 0 ? 'light' : 'deep',
    clarity: score.clear > 0 ? 'clear' : 'soft',
  };
}

export interface QuizResult extends ColourTraits {
  season: SeasonId;
  score: QuizScore;
  confidence: number;
}

export function resolveQuiz(answers: QuizAnswers): QuizResult {
  const score = scoreQuiz(answers);
  const traits = traitsFromScore(score);
  // The further the undertone answers pull in one direction, the more settled
  // the result is. Decisive answers on the other two axes help a little too.
  const undertoneStrength = Math.min(1, Math.abs(score.warm) / 5);
  const axisStrength = Math.min(1, (Math.abs(score.light) + Math.abs(score.clear)) / 8);
  return {
    ...traits,
    season: seasonFromTraits(traits),
    score,
    confidence: Math.round((0.65 * undertoneStrength + 0.35 * axisStrength) * 100) / 100,
  };
}
