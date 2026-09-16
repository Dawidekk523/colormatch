import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { QUIZ_QUESTIONS, resolveQuiz, unansweredQuestionIds, type QuizAnswers } from '../lib/quiz';
import { metricsFromQuiz } from '../lib/report';
import {
  clearResult,
  getResultSnapshot,
  getServerResultSnapshot,
  readResult,
  saveResult,
  subscribeResult,
} from '../lib/result-storage';
import type { SeasonId } from '../lib/seasons-data';
import { AnalysisProgress } from './AnalysisProgress';
import { ResultView } from './ResultView';

function reportAnonymously(season: SeasonId) {
  void fetch('/api/analysis', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ season, source: 'quiz' }),
    keepalive: true,
  }).catch(() => {
    /* optional */
  });
}

/**
 * One question per screen: less scrolling, larger targets, and only one thing to
 * decide at a time.
 */
/** The same order the scoring works in, one line per pass. */
const STAGES = [
  'Adding up your answers',
  'Reading warm against cool',
  'Placing depth and contrast',
  'Choosing the season those three point to',
  'Building your palette',
];

export function Quiz() {
  const [step, setStep] = useState(0);
  const [working, setWorking] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [warning, setWarning] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const snapshot = useSyncExternalStore(subscribeResult, getResultSnapshot, getServerResultSnapshot);
  const stored = useMemo(() => readResult(snapshot), [snapshot]);
  const shown = stored?.source === 'quiz' ? stored : null;

  useEffect(() => {
    if (shown) return;
    // Each question is a new screen, so the question itself has to be the thing
    // in view — without the browser scrolling to wherever the old one sat.
    const node = headingRef.current;
    node?.focus({ preventScroll: true });
    node?.scrollIntoView?.({ block: 'nearest' });
  }, [step, shown]);

  useEffect(() => {
    if (!shown) return;
    const node = resultRef.current;
    node?.focus({ preventScroll: true });
    node?.scrollIntoView?.({ block: 'start' });
  }, [shown]);

  const submit = useCallback(
    (finalAnswers: QuizAnswers) => {
      if (unansweredQuestionIds(finalAnswers).length > 0) {
        setWarning('Please choose one answer before you continue.');
        return;
      }
      setWorking(true);
    },
    [],
  );

  /** Held until the stages on screen finish, so the answer is not thrown at you. */
  const reveal = useCallback(
    (finalAnswers: QuizAnswers) => {
      setWorking(false);
      const result = resolveQuiz(finalAnswers);
      saveResult({
        season: result.season,
        undertone: result.undertone,
        confidence: result.confidence,
        source: 'quiz',
        metrics: metricsFromQuiz(result.score),
      });
      reportAnonymously(result.season);
    },
    [],
  );

  const restart = useCallback(() => {
    clearResult();
    setWorking(false);
    setAnswers({});
    setStep(0);
    setWarning(null);
  }, []);

  if (working) {
    return (
      <div className="quiz panel stack">
        <AnalysisProgress steps={STAGES} onComplete={() => reveal(answers)} />
      </div>
    );
  }

  if (shown) {
    return (
      <div className="quiz quiz--result" ref={resultRef} tabIndex={-1} aria-label="Your colour result">
        <ResultView
          season={shown.season}
          undertone={shown.undertone}
          source="quiz"
          confidence={shown.confidence}
          onRestart={restart}
          restartLabel="Take the quiz again"
        />
      </div>
    );
  }

  const question = QUIZ_QUESTIONS[step]!;
  const isLast = step === QUIZ_QUESTIONS.length - 1;
  const chosen = answers[question.id];
  const progress = Math.round(((step + 1) / QUIZ_QUESTIONS.length) * 100);

  const next = () => {
    if (!chosen) {
      setWarning('Please choose one answer before you continue.');
      return;
    }
    setWarning(null);
    if (isLast) {
      submit(answers);
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="quiz panel stack">
      <p className="quiz__progress">
        Question {step + 1} of {QUIZ_QUESTIONS.length}
        <span className="quiz__bar" aria-hidden="true">
          <span className="quiz__bar-fill" style={{ width: `${progress}%` }} />
        </span>
      </p>

      <fieldset className="quiz__field">
        <legend>
          <h2 className="quiz__question" tabIndex={-1} ref={headingRef}>
            {question.question}
          </h2>
        </legend>
        {question.help ? <p className="note">{question.help}</p> : null}

        <div className="quiz__options">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={chosen === option.id ? 'quiz__option quiz__option--on' : 'quiz__option'}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={chosen === option.id}
                onChange={() => {
                  setWarning(null);
                  setAnswers((prev) => ({ ...prev, [question.id]: option.id }));
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {warning ? (
        <p className="error" role="alert">
          {warning}
        </p>
      ) : null}

      <div className="cluster">
        <button type="button" className="btn btn--primary" onClick={next}>
          {isLast ? 'Show my colours' : 'Next question'}
        </button>
        {step > 0 ? (
          <button
            type="button"
            className="btn btn--quiet"
            onClick={() => {
              setWarning(null);
              setStep((s) => s - 1);
            }}
          >
            Go back
          </button>
        ) : null}
        <button type="button" className="btn btn--quiet" onClick={restart}>
          Start over
        </button>
      </div>
    </div>
  );
}
