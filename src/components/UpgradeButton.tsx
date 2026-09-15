import { useCallback, useEffect, useState } from 'react';

type State = 'checking' | 'ready' | 'unavailable' | 'error';

/**
 * The paid plan is switched on by setting POLAR_CHECKOUT_URL. Until it is set,
 * the button says plainly that the plan is not open yet instead of leading
 * somewhere broken.
 */
export function UpgradeButton() {
  const [state, setState] = useState<State>('checking');
  const [url, setUrl] = useState<string | null>(null);

  // Starts from the 'checking' state it is already in, so nothing is set
  // synchronously while the effect is running.
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/checkout', { signal });
      if (!response.ok) throw new Error('bad status');
      const body = (await response.json()) as { available?: boolean; url?: string };
      if (body.available && typeof body.url === 'string') {
        setUrl(body.url);
        setState('ready');
      } else {
        setState('unavailable');
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setState('error');
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // The rule cannot see that every setState inside `load` happens after an
    // await. Fetching on mount is the point of this effect: whether checkout is
    // open lives in a Worker environment variable, and the page is prerendered.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (state === 'ready' && url) {
    return (
      <a className="btn btn--primary btn--block" href={url}>
        Continue to checkout
      </a>
    );
  }

  return (
    <div className="stack">
      <button type="button" className="btn btn--primary btn--block" disabled={state === 'checking'} aria-disabled="true">
        {state === 'checking' ? 'Checking…' : 'Not open yet'}
      </button>
      <p className="note" aria-live="polite">
        {state === 'error'
          ? 'We could not check the plan just now. The free colour report works as usual.'
          : state === 'checking'
            ? 'Checking whether the paid plan is open.'
            : 'The paid plan is not open yet. Everything on the free plan stays free.'}
      </p>
      {state === 'error' ? (
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            setState('checking');
            void load();
          }}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
