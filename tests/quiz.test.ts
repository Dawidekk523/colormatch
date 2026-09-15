import { describe, expect, it } from 'vitest';
import {
  QUIZ_QUESTIONS,
  resolveQuiz,
  scoreQuiz,
  traitsFromScore,
  undertoneFromScore,
  unansweredQuestionIds,
  type QuizAnswers,
} from '../src/lib/quiz';
import { SEASON_ORDER } from '../src/lib/seasons-data';

const answerAll = (pick: (index: number) => number): QuizAnswers =>
  Object.fromEntries(
    QUIZ_QUESTIONS.map((q, i) => [q.id, q.options[Math.min(pick(i), q.options.length - 1)]!.id]),
  );

describe('quiz shape', () => {
  it('has unique question ids and unique option ids inside each question', () => {
    expect(new Set(QUIZ_QUESTIONS.map((q) => q.id)).size).toBe(QUIZ_QUESTIONS.length);
    for (const q of QUIZ_QUESTIONS) {
      expect(new Set(q.options.map((o) => o.id)).size).toBe(q.options.length);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('validation', () => {
  it('lists every question when nothing is answered', () => {
    expect(unansweredQuestionIds({})).toEqual(QUIZ_QUESTIONS.map((q) => q.id));
  });

  it('lists nothing when everything is answered', () => {
    expect(unansweredQuestionIds(answerAll(() => 0))).toEqual([]);
  });

  it('treats an option id that does not exist as unanswered', () => {
    const answers = { ...answerAll(() => 0), veins: 'purple-spots' };
    expect(unansweredQuestionIds(answers)).toEqual(['veins']);
  });

  it('ignores stray keys that are not questions', () => {
    expect(unansweredQuestionIds({ ...answerAll(() => 0), nickname: 'x' })).toEqual([]);
  });
});

describe('scoring', () => {
  it('scores an empty sheet as all zeroes', () => {
    expect(scoreQuiz({})).toEqual({ warm: 0, light: 0, clear: 0 });
  });

  it('needs a clear lean before it commits to an undertone', () => {
    expect(undertoneFromScore(0)).toBe('neutral');
    expect(undertoneFromScore(1)).toBe('neutral');
    expect(undertoneFromScore(-1)).toBe('neutral');
    expect(undertoneFromScore(2)).toBe('warm');
    expect(undertoneFromScore(-2)).toBe('cool');
  });

  it('defaults an even depth score to light', () => {
    expect(traitsFromScore({ warm: 0, light: 0, clear: 0 }).depth).toBe('light');
    expect(traitsFromScore({ warm: 0, light: -1, clear: 0 }).depth).toBe('deep');
  });
});

describe('resolveQuiz', () => {
  it('sends all-warm answers to a warm season', () => {
    const result = resolveQuiz(answerAll(() => 0));
    expect(result.undertone).toBe('warm');
    expect(['spring', 'autumn']).toContain(result.season);
  });

  it('sends cool answers to a cool season', () => {
    const answers: QuizAnswers = {
      veins: 'blue',
      jewellery: 'silver',
      shirt: 'white',
      sun: 'burns',
      hair: 'light',
      eyes: 'light-cool',
      contrast: 'soft',
    };
    const result = resolveQuiz(answers);
    expect(result.undertone).toBe('cool');
    expect(result.depth).toBe('light');
    expect(result.season).toBe('summer');
  });

  it('sends cool, deep, high-contrast answers to Winter', () => {
    const answers: QuizAnswers = {
      veins: 'blue',
      jewellery: 'silver',
      shirt: 'white',
      sun: 'burns-then-tans',
      hair: 'dark',
      eyes: 'dark',
      contrast: 'strong',
    };
    const result = resolveQuiz(answers);
    expect(result.season).toBe('winter');
  });

  it('sends warm, deep, soft answers to Autumn', () => {
    const answers: QuizAnswers = {
      veins: 'green',
      jewellery: 'gold',
      shirt: 'cream',
      sun: 'tans',
      hair: 'dark',
      eyes: 'warm',
      contrast: 'soft',
    };
    expect(resolveQuiz(answers).season).toBe('autumn');
  });

  it('still returns a season when the sheet is blank, with no confidence', () => {
    const result = resolveQuiz({});
    expect(SEASON_ORDER).toContain(result.season);
    expect(result.confidence).toBe(0);
  });

  it('is more confident about decisive answers than about hedged ones', () => {
    const decisive = resolveQuiz({
      veins: 'green',
      jewellery: 'gold',
      shirt: 'cream',
      sun: 'tans',
      hair: 'dark',
      eyes: 'warm',
      contrast: 'strong',
    });
    const hedged = resolveQuiz({
      veins: 'mixed',
      jewellery: 'both',
      shirt: 'either',
      sun: 'burns-then-tans',
      hair: 'medium',
      eyes: 'warm',
      contrast: 'medium',
    });
    expect(decisive.confidence).toBeGreaterThan(hedged.confidence);
    expect(decisive.confidence).toBeLessThanOrEqual(1);
  });

  it('is a pure function of the answers', () => {
    const answers = answerAll((i) => i % 3);
    expect(resolveQuiz(answers)).toEqual(resolveQuiz(answers));
  });

  it('can reach every season from some set of answers', () => {
    const reached = new Set<string>();
    const optionCounts = QUIZ_QUESTIONS.map((q) => q.options.length);
    const total = optionCounts.reduce((a, b) => a * b, 1);
    for (let n = 0; n < total; n += 1) {
      let rest = n;
      const answers: QuizAnswers = {};
      QUIZ_QUESTIONS.forEach((q, i) => {
        answers[q.id] = q.options[rest % optionCounts[i]!]!.id;
        rest = Math.floor(rest / optionCounts[i]!);
      });
      reached.add(resolveQuiz(answers).season);
    }
    expect([...reached].sort()).toEqual([...SEASON_ORDER].sort());
  });
});
