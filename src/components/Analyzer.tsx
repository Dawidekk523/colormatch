import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import {
  ANALYSIS_FAILURE_MESSAGE,
  AnalysisError,
  analyzeImageFile,
  analyzeImageSource,
} from '../lib/analyze-image';
import { ACCEPT_ATTRIBUTE, checkFile, FILE_PROBLEM_MESSAGE } from '../lib/image-input';
import {
  clearResult,
  getResultSnapshot,
  getServerResultSnapshot,
  readResult,
  saveResult,
  subscribeResult,
} from '../lib/result-storage';
import { metricsFromPhoto } from '../lib/report';
import type { AnalysisResult } from '../lib/season';
import type { SeasonId } from '../lib/seasons-data';
import { AnalysisProgress } from './AnalysisProgress';
import { PhotoTips } from './PhotoTips';
import { ResultView } from './ResultView';

type Status = 'idle' | 'working';

/** Named for what the reading is doing while each one is on screen. */
const STAGES = [
  'Opening your photo on this device',
  'Finding the skin, hair and eyes',
  'Measuring undertone, depth and contrast',
  'Comparing the reading with the four seasons',
  'Building your palette',
];

const SAMPLES = [
  { src: '/samples/light-warm.jpg', label: 'Light skin, warm tone' },
  { src: '/samples/light-cool.jpg', label: 'Light skin, cool tone' },
  { src: '/samples/golden-warm.jpg', label: 'Golden skin, warm tone' },
  { src: '/samples/deep-cool.jpg', label: 'Deep skin, cool tone' },
];

/** Records the outcome only. It never blocks the result and never sends the photo. */
function reportAnonymously(season: SeasonId, source: 'photo' | 'quiz') {
  void fetch('/api/analysis', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ season, source }),
    keepalive: true,
  }).catch(() => {
    /* the result is already on screen; analytics are optional */
  });
}

export function Analyzer() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>('');
  const [dragging, setDragging] = useState(false);

  // The saved result is the source of truth, so a refresh and a fresh analysis
  // both arrive through the same path.
  const snapshot = useSyncExternalStore(subscribeResult, getResultSnapshot, getServerResultSnapshot);
  const stored = useMemo(() => readResult(snapshot), [snapshot]);
  const shown = stored?.source === 'photo' ? stored : null;

  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  // Guards a second click landing while the first run is still going.
  const busyRef = useRef(false);
  // The reading finishes long before the stages on screen do, so whichever
  // arrives second releases the result.
  const readyRef = useRef<AnalysisResult | null>(null);
  const stagesDoneRef = useRef(false);

  const finish = useCallback((result: AnalysisResult) => {
    readyRef.current = null;
    stagesDoneRef.current = false;
    setStatus('idle');
    saveResult({
      season: result.season,
      undertone: result.undertone,
      confidence: result.confidence,
      source: 'photo',
      metrics: metricsFromPhoto(result),
    });
    reportAnonymously(result.season, 'photo');
  }, []);

  /** Called by whichever finishes last: the reading, or the stages on screen. */
  const release = useCallback(
    (result: AnalysisResult | null) => {
      if (result) readyRef.current = result;
      else stagesDoneRef.current = true;
      if (readyRef.current && stagesDoneRef.current) finish(readyRef.current);
    },
    [finish],
  );

  const stagesComplete = useCallback(() => release(null), [release]);

  const fail = useCallback((err: unknown) => {
    readyRef.current = null;
    stagesDoneRef.current = false;
    setStatus('idle');
    setError(
      err instanceof AnalysisError
        ? ANALYSIS_FAILURE_MESSAGE[err.kind]
        : 'Something went wrong while reading the photo. Please try again.',
    );
  }, []);

  const run = useCallback(
    async (src: string, label: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setError(null);
      setPreviewLabel(label);
      setPreview(src);
      setStatus('working');
      try {
        release(await analyzeImageSource(src));
      } catch (err) {
        fail(err);
      } finally {
        busyRef.current = false;
      }
    },
    [fail, release],
  );

  const runFile = useCallback(
    async (file: File) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setError(null);
      setPreviewLabel('The photo you chose');
      setStatus('working');
      try {
        // The photo is decoded straight to the sizes we need, so nothing larger
        // than a thumbnail is ever held — any camera file is fair game.
        const { result, preview: thumbnail } = await analyzeImageFile(file);
        setPreview(thumbnail);
        release(result);
      } catch (err) {
        setPreview(null);
        fail(err);
      } finally {
        busyRef.current = false;
      }
    },
    [fail, release],
  );

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      const problem = checkFile(file);
      if (problem) {
        setError(FILE_PROBLEM_MESSAGE[problem]);
        setStatus('idle');
        return;
      }
      void runFile(file!);
    },
    [runFile],
  );

  const reset = useCallback(() => {
    readyRef.current = null;
    stagesDoneRef.current = false;
    clearResult();
    setPreview(null);
    setPreviewLabel('');
    setError(null);
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!shown) return;
    // The page is a different height once the result replaces the upload panel,
    // so the browser is left somewhere in the middle of it. Focus without the
    // scroll it would otherwise do, then put the top of the result on screen.
    const node = resultRef.current;
    node?.focus({ preventScroll: true });
    node?.scrollIntoView?.({ block: 'start' });
  }, [shown]);

  if (status === 'working') {
    return (
      <div className="analyzer analyzer--working stack">
        {preview ? (
          <p className="analyzer__preview-line">
            <img className="analyzer__preview" src={preview} alt="" width={96} height={96} />
            <span>{previewLabel}</span>
          </p>
        ) : null}
        <AnalysisProgress steps={STAGES} onComplete={stagesComplete} />
      </div>
    );
  }

  if (shown) {
    return (
      <div className="analyzer analyzer--result" ref={resultRef} tabIndex={-1} aria-label="Your colour result">
        {preview ? (
          <p className="analyzer__preview-line">
            <img className="analyzer__preview" src={preview} alt="" width={96} height={96} />
            <span>{previewLabel}</span>
          </p>
        ) : null}
        <ResultView
          season={shown.season}
          undertone={shown.undertone}
          source="photo"
          confidence={shown.confidence}
          onRestart={reset}
          restartLabel="Try another photo"
        />
      </div>
    );
  }

  return (
    <div className="analyzer stack">
      <div
        className={dragging ? 'dropzone dropzone--over' : 'dropzone'}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        <label className="btn btn--primary btn--block dropzone__button" htmlFor="photo-input">
          Upload a photo
        </label>
        <input
          ref={inputRef}
          id="photo-input"
          className="visually-hidden"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <PhotoTips />
      </div>

      <div className="samples">
        <p className="samples__title" id="samples-title">
          No photo to hand? Try one of these photos:
        </p>
        <ul className="samples__row" aria-labelledby="samples-title">
          {SAMPLES.map((sample) => (
            <li key={sample.src}>
              <button
                type="button"
                className="samples__item"
                onClick={() => run(sample.src, sample.label)}
              >
                <img src={sample.src} alt="" width={640} height={640} loading="lazy" decoding="async" />
                <span>{sample.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <p className="note">
        Prefer not to use a photo? <a href="/color-analysis-quiz/">Answer seven short questions instead.</a>
      </p>
    </div>
  );
}
