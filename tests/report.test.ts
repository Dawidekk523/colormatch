import { describe, expect, it } from 'vitest';
import { QUIZ_QUESTIONS, resolveQuiz, type QuizAnswers } from '../src/lib/quiz';
import {
  buildReport,
  metricsFromPhoto,
  metricsFromQuiz,
  seasonMatches,
  subtypeFor,
} from '../src/lib/report';
import { analyseSkinReading } from '../src/lib/season';
import { SEASONS, type SeasonId } from '../src/lib/seasons-data';

/** Every combination of answers, so no path through the quiz is untested. */
function* everyAnswerSet(): Generator<QuizAnswers> {
  const counters = QUIZ_QUESTIONS.map(() => 0);
  const total = QUIZ_QUESTIONS.reduce((count, question) => count * question.options.length, 1);
  for (let step = 0; step < total; step += 1) {
    const answers: QuizAnswers = {};
    QUIZ_QUESTIONS.forEach((question, index) => {
      answers[question.id] = question.options[counters[index]!]!.id;
    });
    yield answers;
    for (let index = QUIZ_QUESTIONS.length - 1; index >= 0; index -= 1) {
      counters[index] = (counters[index]! + 1) % QUIZ_QUESTIONS[index]!.options.length;
      if (counters[index] !== 0) break;
    }
  }
}

describe('the report the reading pays for', () => {
  it('never contradicts the season the result already named', () => {
    for (const answers of everyAnswerSet()) {
      const result = resolveQuiz(answers);
      const matches = seasonMatches(metricsFromQuiz(result.score));
      expect(matches[0]!.season).toBe(result.season);
    }
  });

  it('gives a subtype that belongs to the season it came from', () => {
    for (const answers of everyAnswerSet()) {
      const result = resolveQuiz(answers);
      const subtype = subtypeFor(result.season, metricsFromQuiz(result.score));
      expect(subtype.parent).toBe(result.season);
    }
  });

  it('turns a photo reading into axes that agree with the verdict', () => {
    const reading = analyseSkinReading({ skin: { r: 226, g: 182, b: 150 }, coverage: 0.35, contrast: 60 });
    expect(reading).not.toBeNull();
    const metrics = metricsFromPhoto(reading!);
    expect(metrics.warm > 0).toBe(reading!.undertone === 'warm');
    expect(metrics.light >= 0).toBe(reading!.depth === 'light');
    expect(metrics.clear >= 0).toBe(reading!.clarity === 'clear');
    expect(seasonMatches(metrics)[0]!.season).toBe(reading!.season);
  });

  it('measures every colour it prints', () => {
    for (const season of Object.keys(SEASONS) as SeasonId[]) {
      const report = buildReport({ season, undertone: SEASONS[season].undertone, source: 'quiz', confidence: 0.8 });
      const all = [...report.wear, ...report.neutrals, ...report.avoid];
      expect(all.length).toBeGreaterThan(15);
      for (const swatch of all) {
        expect(swatch.lightness).toBeGreaterThanOrEqual(0);
        expect(swatch.lightness).toBeLessThanOrEqual(100);
        expect(swatch.chroma).toBeGreaterThanOrEqual(0);
      }
      expect(report.matches.reduce((sum, match) => sum + match.percent, 0)).toBeGreaterThan(95);
      expect(report.wardrobe.metals.length).toBeGreaterThan(20);
    }
  });

  it('still opens a card that was bought before readings were kept', () => {
    const report = buildReport({ season: 'summer', undertone: 'cool', source: 'photo', confidence: 0.5 });
    expect(report.measured).toBe(false);
    expect(report.axes).toHaveLength(3);
  });
});
