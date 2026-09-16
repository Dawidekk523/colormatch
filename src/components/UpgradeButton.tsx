import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { buildCard } from '../lib/card';
import {
  getResultSnapshot,
  getServerResultSnapshot,
  readResult,
  subscribeResult,
} from '../lib/result-storage';

type Plan =
  | { kind: 'checking' }
  | { kind: 'open' }
  | { kind: 'hosted'; url: string }
  | { kind: 'closed' }
  | { kind: 'error' };

/**
 * The paid plan opens as soon as Polar is configured. Buying is tied to a
 * result rather than an account: the result is parked server-side first, and
 * the token it comes back with rides through checkout so the receipt email can
 * lead back to the same card on any device.
 */
export function UpgradeButton() {
  const [plan, setPlan] = useState<Plan>({ kind: 'checking' });
  const [starting, setStarting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const snapshot = useSyncExternalStore(subscribeResult, getResultSnapshot, getServerResultSnapshot);
  const stored = useMemo(() => readResult(snapshot), [snapshot]);

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/checkout', { signal });
      if (!response.ok) throw new Error('bad status');
      const body = (await response.json()) as { available?: boolean; url?: string; tokenless?: boolean };
      if (body.available && body.tokenless && typeof body.url === 'string') {
        setPlan({ kind: 'hosted', url: body.url });
      } else if (body.available) {
        setPlan({ kind: 'open' });
      } else {
        setPlan({ kind: 'closed' });
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setPlan({ kind: 'error' });
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

  const start = useCallback(async () => {
    if (!stored) return;
    setStarting(true);
    setProblem(null);
    try {
      const parked = await fetch('/api/result', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...stored, card: buildCard(stored.season, stored.undertone, stored.metrics) }),
      });
      const parkedBody = (await parked.json()) as { token?: string };
      if (!parked.ok || typeof parkedBody.token !== 'string') throw new Error('not parked');

      const checkout = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token: parkedBody.token }),
      });
      const checkoutBody = (await checkout.json()) as { url?: string };
      if (!checkout.ok || typeof checkoutBody.url !== 'string') throw new Error('no checkout');

      window.location.href = checkoutBody.url;
    } catch {
      setStarting(false);
      setProblem('We could not open checkout just now. Please try again in a moment.');
    }
  }, [stored]);

  if (plan.kind === 'hosted') {
    return (
      <a className="btn btn--primary btn--block" href={plan.url}>
        Continue to checkout
      </a>
    );
  }

  if (plan.kind === 'open' && !stored) {
    return (
      <div className="stack">
        <a className="btn btn--primary btn--block" href="/">
          Get your colours first
        </a>
        <p className="note">
          The report is made from your own result, so the free one comes first. It takes about a minute.
        </p>
      </div>
    );
  }

  if (plan.kind === 'open') {
    return (
      <div className="stack">
        <button type="button" className="btn btn--primary btn--block" onClick={() => void start()} disabled={starting}>
          {starting ? 'Opening checkout…' : 'Get the full report'}
        </button>
        <p className="note" aria-live="polite">
          {problem ?? 'One payment. Your report arrives by email, and the link in it works on any device.'}
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <button
        type="button"
        className="btn btn--primary btn--block"
        disabled={plan.kind === 'checking'}
        aria-disabled="true"
      >
        {plan.kind === 'checking' ? 'Checking…' : 'Not open yet'}
      </button>
      <p className="note" aria-live="polite">
        {plan.kind === 'error'
          ? 'We could not check the plan just now. The free colour report works as usual.'
          : plan.kind === 'checking'
            ? 'Checking whether the paid plan is open.'
            : 'The paid plan is not open yet. Everything on the free plan stays free.'}
      </p>
      {plan.kind === 'error' ? (
        <button
          type="button"
          className="btn btn--quiet"
          onClick={() => {
            setPlan({ kind: 'checking' });
            void load();
          }}
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
