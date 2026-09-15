import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ANALYSIS_FAILURE_MESSAGE, AnalysisError, analyzeImageSource } from '../lib/analyze-image';
import { ACCEPT_ATTRIBUTE, checkFile, FILE_PROBLEM_MESSAGE } from '../lib/image-input';
import {
  clearResult,
  getResultSnapshot,
  getServerResultSnapshot,
  readResult,
  saveResult,
  subscribeResult,
} from '../lib/result-storage';
import type { AnalysisResult } from '../lib/season';
import type { SeasonId } from '../lib/seasons-data';
import { ResultView } from './ResultView';

type Status = 'idle' | 'working';

const SAMPLES = [
  { src: '/samples/light-warm.svg', label: 'Light skin, warm tone' },
  { src: '/samples/light-cool.svg', label: 'Light skin, cool tone' },
  { src: '/samples/deep-warm.svg', label: 'Deep skin, warm tone' },
  { src: '/samples/deep-cool.svg', label: 'Deep skin, cool tone' },
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
  const objectUrlRef = useRef<string | null>(null);
  // Guards a second click landing while the first run is still going.
  const busyRef = useRef(false);

  const releasePreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => releasePreview, [releasePreview]);

  const finish = useCallback((result: AnalysisResult) => {
    setStatus('idle');
    saveResult({
      season: result.season,
      undertone: result.undertone,
      confidence: result.confidence,
      source: 'photo',
    });
    reportAnonymously(result.season, 'photo');
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
        finish(await analyzeImageSource(src));
      } catch (err) {
        setStatus('idle');
        setError(
          err instanceof AnalysisError
            ? ANALYSIS_FAILURE_MESSAGE[err.kind]
            : 'Something went wrong while reading the photo. Please try again.',
        );
      } finally {
        busyRef.current = false;
      }
    },
    [finish],
  );

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      const problem = checkFile(file);
      if (problem) {
        setError(FILE_PROBLEM_MESSAGE[problem]);
        setStatus('idle');
        return;
      }
      releasePreview();
      const url = URL.createObjectURL(file!);
      objectUrlRef.current = url;
      void run(url, 'The photo you chose');
    },
    [releasePreview, run],
  );

  const reset = useCallback(() => {
    releasePreview();
    clearResult();
    setPreview(null);
    setPreviewLabel('');
    setError(null);
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
    inputRef.current?.focus();
  }, [releasePreview]);

  useEffect(() => {
    if (shown) resultRef.current?.focus();
  }, [shown]);

  if (shown) {
    return (
      <div className="analyzer" ref={resultRef} tabIndex={-1} aria-label="Your colour result">
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
          {status === 'working' ? 'Reading your photo…' : 'Upload a photo'}
        </label>
        <input
          ref={inputRef}
          id="photo-input"
          className="visually-hidden"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          disabled={status === 'working'}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <p className="dropzone__hint">
          Or drag a photo here. JPG, PNG or WEBP, up to 10 MB. Your photo stays on your device — it is
          never uploaded.
        </p>
      </div>

      <div className="samples">
        <p className="samples__title" id="samples-title">
          No photo to hand? Try one of these drawings:
        </p>
        <ul className="samples__row" aria-labelledby="samples-title">
          {SAMPLES.map((sample) => (
            <li key={sample.src}>
              <button
                type="button"
                className="samples__item"
                disabled={status === 'working'}
                onClick={() => run(sample.src, sample.label)}
              >
                <img src={sample.src} alt="" width={120} height={120} loading="lazy" />
                <span>{sample.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p aria-live="polite" className="analyzer__status">
        {status === 'working' ? 'Reading the colours in your photo. This takes a second.' : ''}
      </p>

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
