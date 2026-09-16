import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  getResultSnapshot,
  getServerResultSnapshot,
  readResult,
  type StoredResult,
  subscribeResult,
} from '../lib/result-storage';
import { buildCard, readCard, type CardPayload } from '../lib/card';
import { buildReport } from '../lib/report';
import { SEASONS, type SeasonId } from '../lib/seasons-data';
import { FullReport } from './FullReport';
import { PaletteCard } from './PaletteCard';
import { ResultView } from './ResultView';

type Remote =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'found'; result: StoredResult; paid: boolean; card: CardPayload | null }
  | { kind: 'missing' }
  | { kind: 'error' };

const isToken = (value: string | null): value is string => Boolean(value && /^[0-9a-f]{32}$/.test(value));

/**
 * The page a receipt email links to. There is no account to sign in to: the
 * token in the address is the whole key, which is why it is long and random.
 * A result computed in this very browser is shown immediately, so the page is
 * never blank while the payment is still being confirmed.
 */
const PREVIEW_SEASONS: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];

/**
 * `?preview=summer` draws the bought report from sample figures without a
 * payment. It exists so the page can be looked at while it is being built and
 * changed; it unlocks nothing private, because a report is computed in the
 * browser from a reading that browser already has.
 */
function previewSeason(local: SeasonId | null): SeasonId | null {
  if (typeof window === 'undefined') return null;
  const value = new URLSearchParams(window.location.search).get('preview');
  if (!value) return null;
  // Without a named season the preview follows whatever this browser last
  // worked out, so a photo can be tested end to end in one go.
  if (value === '1' || value === 'true' || value === 'me') return local ?? 'summer';
  return PREVIEW_SEASONS.includes(value as SeasonId) ? (value as SeasonId) : null;
}

export function PaidResult() {
  const [remote, setRemote] = useState<Remote>({ kind: 'idle' });
  const [preview, setPreview] = useState<SeasonId | null>(null);

  const snapshot = useSyncExternalStore(subscribeResult, getResultSnapshot, getServerResultSnapshot);
  const local = useMemo(() => readResult(snapshot), [snapshot]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreview(previewSeason(local?.season ?? null));
  }, [local]);

  const load = useCallback(async (token: string, signal: AbortSignal) => {
    try {
      const response = await fetch(`/api/result/${token}`, { signal });
      if (response.status === 404) {
        setRemote({ kind: 'missing' });
        return;
      }
      if (!response.ok) throw new Error('bad status');
      const body = (await response.json()) as {
        found?: boolean;
        paid?: boolean;
        result?: StoredResult;
        card?: unknown;
      };
      if (!body.found || !body.result) {
        setRemote({ kind: 'missing' });
        return;
      }
      setRemote({
        kind: 'found',
        result: body.result,
        paid: Boolean(body.paid),
        card: readCard(body.card),
      });
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      setRemote({ kind: 'error' });
    }
  }, []);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('t');
    if (!isToken(token)) return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemote({ kind: 'loading' });
    void load(token, controller.signal);
    return () => controller.abort();
  }, [load]);

  const result = remote.kind === 'found' ? remote.result : local;
  const paid = remote.kind === 'found' && remote.paid;

  if (preview) {
    const source = local && local.season === preview ? local : null;
    const report = buildReport({
      season: preview,
      undertone: source?.undertone ?? SEASONS[preview].undertone,
      source: source?.source ?? 'quiz',
      confidence: source?.confidence ?? 0.72,
      metrics: source?.metrics,
    });
    return (
      <div className="stack-lg paid-result">
        <p className="note">
          Preview of the full report{source ? ', built from the result in this browser' : ', built from sample figures'}. Nothing has been paid for.
        </p>
        <FullReport report={report} />
      </div>
    );
  }

  if (!result) {
    if (remote.kind === 'loading') return <p className="note">Opening your report…</p>;
    if (remote.kind === 'error') {
      return (
        <div className="stack">
          <p className="lede">We could not open your report just now.</p>
          <p className="note">
            The link in your email keeps working — please try it again in a few minutes.
          </p>
        </div>
      );
    }
    return (
      <div className="stack">
        <p className="lede">There is nothing to show here yet.</p>
        <p className="note">
          This page opens a colour report that has already been paid for. If you came from an email, use the link in
          it again; otherwise start with the free colour report.
        </p>
        <a className="btn btn--primary" href="/">
          Get your colours
        </a>
      </div>
    );
  }

  const season = SEASONS[result.season];
  // A card bought before a palette revision is served as it was sold; one made
  // in this browser is built from what is on the site today.
  const stored = remote.kind === 'found' ? remote.card : null;
  const card = paid ? (stored ?? buildCard(result.season, result.undertone, result.metrics)) : null;

  return (
    <div className="stack-lg paid-result">
      {paid ? (
        <div className="stack">
          <p className="lede">Your {season.name} report is ready.</p>
          <p className="note">
            Keep the email: its link opens this page on any device, including a phone in a shop.
          </p>

        </div>
      ) : (
        <p className="note">
          {remote.kind === 'found'
            ? 'Payment is still being confirmed. Your colours are below in the meantime, and the card appears here as soon as it clears.'
            : 'This is the free report held in this browser.'}
        </p>
      )}

      {paid ? (
        <FullReport
          report={buildReport({
            season: result.season,
            undertone: result.undertone,
            source: result.source,
            confidence: result.confidence,
            metrics: card?.metrics ?? result.metrics,
            palette: card ? { wear: card.wear, neutrals: card.neutrals, avoid: card.avoid } : undefined,
          })}
        />
      ) : (
        <ResultView
          season={result.season}
          undertone={result.undertone}
          source={result.source}
          confidence={result.confidence}
        />
      )}

      {card ? <PaletteCard card={card} /> : null}
    </div>
  );
}
