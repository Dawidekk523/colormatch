// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { verifyStandardWebhook, TOLERANCE_SECONDS } from '../../functions/standard-webhooks';

const SECRET_BYTES = 'a-test-signing-key-for-webhooks!';
const SECRET = `whsec_${btoa(SECRET_BYTES)}`;
const NOW = 1_760_000_000;

async function sign(id: string, timestamp: number, body: string, secret = SECRET) {
  const raw = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const binary = atob(raw);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  return btoa(String.fromCharCode(...new Uint8Array(mac)));
}

const headersFor = (id: string, timestamp: number, signature: string) =>
  new Headers({
    'webhook-id': id,
    'webhook-timestamp': String(timestamp),
    'webhook-signature': `v1,${signature}`,
  });

const BODY = JSON.stringify({ type: 'order.created', data: { id: 'ord_1' } });

describe('verifyStandardWebhook', () => {
  it('accepts a correctly signed delivery', async () => {
    const headers = headersFor('msg_1', NOW, await sign('msg_1', NOW, BODY));
    await expect(verifyStandardWebhook(headers, BODY, SECRET, NOW)).resolves.toEqual({
      ok: true,
      id: 'msg_1',
    });
  });

  it('accepts a secret given without the whsec_ prefix', async () => {
    const bare = btoa(SECRET_BYTES);
    const headers = headersFor('msg_1', NOW, await sign('msg_1', NOW, BODY, bare));
    await expect(verifyStandardWebhook(headers, BODY, bare, NOW)).resolves.toEqual({
      ok: true,
      id: 'msg_1',
    });
  });

  it('accepts when one of several offered signatures matches', async () => {
    const good = await sign('msg_1', NOW, BODY);
    const headers = new Headers({
      'webhook-id': 'msg_1',
      'webhook-timestamp': String(NOW),
      'webhook-signature': `v1,AAAA ${`v1,${good}`}`,
    });
    const result = await verifyStandardWebhook(headers, BODY, SECRET, NOW);
    expect(result.ok).toBe(true);
  });

  it('refuses everything when no secret is configured', async () => {
    const headers = headersFor('msg_1', NOW, await sign('msg_1', NOW, BODY));
    await expect(verifyStandardWebhook(headers, BODY, undefined, NOW)).resolves.toEqual({
      ok: false,
      reason: 'not-configured',
    });
  });

  it('rejects a body that was changed after signing', async () => {
    const headers = headersFor('msg_1', NOW, await sign('msg_1', NOW, BODY));
    const tampered = JSON.stringify({ type: 'order.created', data: { id: 'ord_999' } });
    await expect(verifyStandardWebhook(headers, tampered, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'no-match',
    });
  });

  it('rejects a signature made with a different secret', async () => {
    const headers = headersFor('msg_1', NOW, await sign('msg_1', NOW, BODY, `whsec_${btoa('another-key-entirely-here!!')}`));
    await expect(verifyStandardWebhook(headers, BODY, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'no-match',
    });
  });

  it('rejects a replay that reuses a signature under a new id', async () => {
    const headers = headersFor('msg_2', NOW, await sign('msg_1', NOW, BODY));
    await expect(verifyStandardWebhook(headers, BODY, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'no-match',
    });
  });

  it('rejects a delivery older than the tolerance window', async () => {
    const old = NOW - TOLERANCE_SECONDS - 1;
    const headers = headersFor('msg_1', old, await sign('msg_1', old, BODY));
    await expect(verifyStandardWebhook(headers, BODY, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'stale-timestamp',
    });
  });

  it('accepts a delivery just inside the tolerance window', async () => {
    const edge = NOW - TOLERANCE_SECONDS;
    const headers = headersFor('msg_1', edge, await sign('msg_1', edge, BODY));
    const result = await verifyStandardWebhook(headers, BODY, SECRET, NOW);
    expect(result.ok).toBe(true);
  });

  it('rejects missing headers and unreadable timestamps', async () => {
    await expect(verifyStandardWebhook(new Headers(), BODY, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'missing-headers',
    });
    const headers = headersFor('msg_1', NOW, 'x');
    headers.set('webhook-timestamp', 'yesterday');
    await expect(verifyStandardWebhook(headers, BODY, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'bad-timestamp',
    });
  });

  it('rejects a signature that is not offered as v1', async () => {
    const good = await sign('msg_1', NOW, BODY);
    const headers = new Headers({
      'webhook-id': 'msg_1',
      'webhook-timestamp': String(NOW),
      'webhook-signature': `v2,${good}`,
    });
    await expect(verifyStandardWebhook(headers, BODY, SECRET, NOW)).resolves.toEqual({
      ok: false,
      reason: 'no-match',
    });
  });

  it('rejects an empty secret', async () => {
    const headers = headersFor('msg_1', NOW, await sign('msg_1', NOW, BODY));
    await expect(verifyStandardWebhook(headers, BODY, 'whsec_', NOW)).resolves.toEqual({
      ok: false,
      reason: 'bad-secret',
    });
  });
});
