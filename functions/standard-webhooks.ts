import { timingSafeEqual } from './_shared';

export type VerifyFailure =
  | 'not-configured'
  | 'missing-headers'
  | 'bad-timestamp'
  | 'stale-timestamp'
  | 'bad-secret'
  | 'no-match';

export type VerifyResult = { ok: true; id: string } | { ok: false; reason: VerifyFailure };

/** How far a delivery's timestamp may drift before it is refused, in seconds. */
export const TOLERANCE_SECONDS = 5 * 60;

const decodeBase64 = (value: string): Uint8Array => {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const encodeBase64 = (bytes: ArrayBuffer): string =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)));

/**
 * Standard Webhooks verification, which is what Polar signs with. The signature
 * covers `id.timestamp.body`, so replaying an old body with a fresh timestamp
 * does not verify.
 */
export async function verifyStandardWebhook(
  headers: Headers,
  rawBody: string,
  secret: string | undefined,
  now: number = Math.floor(Date.now() / 1000),
): Promise<VerifyResult> {
  if (!secret) return { ok: false, reason: 'not-configured' };

  const id = headers.get('webhook-id');
  const timestamp = headers.get('webhook-timestamp');
  const signatureHeader = headers.get('webhook-signature');
  if (!id || !timestamp || !signatureHeader) return { ok: false, reason: 'missing-headers' };

  const sent = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(sent)) return { ok: false, reason: 'bad-timestamp' };
  if (Math.abs(now - sent) > TOLERANCE_SECONDS) return { ok: false, reason: 'stale-timestamp' };

  let keyBytes: Uint8Array;
  try {
    keyBytes = decodeBase64(secret.startsWith('whsec_') ? secret.slice('whsec_'.length) : secret);
  } catch {
    return { ok: false, reason: 'bad-secret' };
  }
  if (keyBytes.length === 0) return { ok: false, reason: 'bad-secret' };

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signed = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${id}.${sent}.${rawBody}`),
  );
  const expected = encodeBase64(signed);

  // The header carries a space-separated list so a secret can be rotated
  // without dropping deliveries signed by the old one.
  const presented = signatureHeader
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.startsWith('v1,'))
    .map((part) => part.slice(3));

  for (const candidate of presented) {
    if (timingSafeEqual(candidate, expected)) return { ok: true, id };
  }
  return { ok: false, reason: 'no-match' };
}
