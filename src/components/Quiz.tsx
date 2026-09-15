import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { QUIZ_QUESTIONS, resolveQuiz, unansweredQuestionIds, type QuizAnswers } from '../lib/quiz';
import {
  clearResult,
  getResultSnapshot,
  getServerResultSnapshot,
  readResult,
  saveResult,
  subscribeResult,
} from '../lib/result-storage';
import type { SeasonId } from '../lib/seasons-data';
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
export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [warning, setWarning] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const snapshot = useSyncExternalStore(subscribeResult, getResultSnapshot, getServerResultSnapshot);
  const stored = useMemo(() => readResult(snapshot), [snapshot]);
  const shown = stored?.source === 'quiz' ? stored : null;

  useEffect(() => {
    if (!shown) headingRef.current?.focus();
  }, [step, shown]);

  useEffect(() => {
    if (shown) resultRef.current?.focus();
  }, [shown]);

  const submit = useCallback(
    (finalAnswers: QuizAnswers) => {
      if (unansweredQuestionIds(finalAnswers).length > 0) {
        setWarning('Please choose one answer before you continue.');
        return;
      }
      const result = resolveQuiz(finalAnswers);
      saveResult({
        season: result.season,
        undertone: result.undertone,
        confidence: result.confidence,
        source: 'quiz',
      });
      reportAnonymously(result.season);
    },
    [],
  );

  const restart = useCallback(() => {
    clearResult();
    setAnswers({});
    setStep(0);
    setWarning(null);
  }, []);

  if (shown) {
    return (
      <div className="quiz" ref={resultRef} tabIndex={-1} aria-label="Your colour result">
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
