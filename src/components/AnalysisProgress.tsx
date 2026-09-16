import { useEffect, useState } from 'react';
import { Icon } from './Icon';

interface Props {
  /** Named in the order the reading actually goes through them. */
  steps: string[];
  onComplete: () => void;
  stepMs?: number;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The reading itself takes a fraction of a second, which reads as "nothing
 * happened" — so the stages it goes through are shown one at a time instead of
 * a blank wait. Every line names a step the code really performs, and the
 * result appears the moment the list ends; anyone who has asked for less motion
 * gets the same list without the animation.
 */
export function AnalysisProgress({ steps, onComplete, stepMs = 900 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const timer = window.setTimeout(onComplete, 600);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setInterval(() => {
      setIndex((current) => {
        if (current + 1 >= steps.length) {
          window.clearInterval(timer);
          onComplete();
          return current;
        }
        return current + 1;
      });
    }, stepMs);
    return () => window.clearInterval(timer);
  }, [steps.length, stepMs, onComplete]);

  const percent = Math.round(((index + 1) / steps.length) * 100);

  return (
    <div className="progress" role="status" aria-live="polite">
      <p className="progress__now">{steps[index]}</p>
      <span className="progress__bar" aria-hidden="true">
        <span className="progress__fill" style={{ width: `${percent}%` }} />
      </span>
      <ul className="progress__steps">
        {steps.map((step, position) => (
          <li
            key={step}
            className={position < index ? 'progress__step progress__step--done' : 'progress__step'}
            aria-hidden={position === index ? undefined : true}
          >
            {position < index ? (
              <Icon name="included" size={18} />
            ) : (
              <span className="progress__dot" aria-hidden="true" />
            )}
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
