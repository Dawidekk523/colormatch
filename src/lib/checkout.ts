import { track, visitorId } from './analytics';
import { buildCard } from './card';
import type { StoredResult } from './result-storage';

/**
 * Parks the result server-side and opens a Polar checkout for it, returning the
 * checkout URL. The token rides through checkout so the receipt email can lead
 * back to the same card on any device. Throws when either step fails.
 */
export async function openCheckout(stored: StoredResult, from: 'result' | 'pricing'): Promise<string> {
  track('checkout_started', { plan: 'full_report', from, season: stored.season, source: stored.source });
  const parked = await checkoutFetch('/api/result', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...stored, card: buildCard(stored.season, stored.undertone, stored.metrics) }),
  });
  const parkedBody = (await parked.json()) as { token?: string };
  if (!parked.ok || typeof parkedBody.token !== 'string') throw new Error('not parked');

  const checkout = await checkoutFetch('/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token: parkedBody.token, visitor: await visitorId() }),
  });
  const checkoutBody = (await checkout.json()) as { url?: string };
  if (!checkout.ok || typeof checkoutBody.url !== 'string') throw new Error('no checkout');

  return checkoutBody.url;
}

// Safari reuses a closed keep-alive connection; a rejected fetch never reached the server,
// so one retry is safe. HTTP errors are not retried.
function checkoutFetch(input: string, init: RequestInit): Promise<Response> {
  return fetch(input, init).catch(() => fetch(input, init));
}
