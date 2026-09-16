// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { onRequestGet as analysisGet, onRequestPost as analysisPost } from '../../functions/api/analysis';
import { onRequestGet as checkoutGet } from '../../functions/api/checkout';
import { onRequestPost as subscribePost } from '../../functions/api/subscribe';
import { onRequestPost as polarPost } from '../../functions/api/webhooks/polar';
import { dayKey, isEmail, sha256Hex, timingSafeEqual } from '../../functions/_shared';

/** Minimal in-memory stand-in for the D1 binding, enough for these handlers. */
function fakeDb(overrides: { count?: number; failOn?: 'select' | 'batch' | 'run' } = {}) {
  const inserted: unknown[][] = [];
  const statement = (sql: string) => ({
    sql,
    bound: [] as unknown[],
    bind(...args: unknown[]) {
      this.bound = args;
      return this;
    },
    async first() {
      if (overrides.failOn === 'select') throw new Error('d1 down');
      return overrides.count === undefined ? null : { count: overrides.count };
    },
    async run() {
      if (overrides.failOn === 'run') throw new Error('d1 down');
      inserted.push([sql, ...this.bound]);
      return { success: true };
    },
    async all() {
      return { results: [{ season: 'spring', total: 3 }] };
    },
  });

  return {
    inserted,
    binding: {
      prepare: (sql: string) => statement(sql),
      async batch(statements: { run: () => Promise<unknown> }[]) {
        if (overrides.failOn === 'batch') throw new Error('d1 down');
        for (const s of statements) await s.run();
        return [];
      },
    } as unknown as D1Database,
  };
}

const ctx = (request: Request, env: Env) => ({ request, env }) as unknown as Parameters<PagesFunction<Env>>[0];

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://getcolormatch.com/api/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

describe('shared helpers', () => {
  it('hashes consistently and not reversibly', async () => {
    const a = await sha256Hex('203.0.113.7|2026-09-15');
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).toBe(await sha256Hex('203.0.113.7|2026-09-15'));
    expect(a).not.toBe(await sha256Hex('203.0.113.8|2026-09-15'));
    expect(a).not.toContain('203.0.113.7');
  });

  it('compares strings without leaking length mismatches as equality', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'abcd')).toBe(false);
  });

  it('produces a UTC day key', () => {
    expect(dayKey(new Date('2026-09-15T23:59:59Z'))).toBe('2026-09-15');
  });

  it('accepts real addresses and rejects junk', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('not an email')).toBe(false);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail(42)).toBe(false);
  });
});

describe('POST /api/analysis', () => {
  it('rejects a body that is not JSON', async () => {
    const res = await analysisPost(ctx(post('nonsense{'), {}));
    expect(res.status).toBe(400);
  });

  it('rejects an unknown season or source', async () => {
    expect((await analysisPost(ctx(post({ season: 'monsoon', source: 'quiz' }), {}))).status).toBe(400);
    expect((await analysisPost(ctx(post({ season: 'spring', source: 'guess' }), {}))).status).toBe(400);
  });

  it('answers cleanly when no database is bound', async () => {
    const res = await analysisPost(ctx(post({ season: 'spring', source: 'quiz' }), {}));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ recorded: false, reason: 'storage-not-configured' });
  });

  it('records the outcome and bumps the visitor counter', async () => {
    const db = fakeDb();
    const res = await analysisPost(ctx(post({ season: 'winter', source: 'photo' }), { DB: db.binding }));
    await expect(res.json()).resolves.toEqual({ recorded: true });
    expect(db.inserted).toHaveLength(2);
    const [insertSql, season, source] = db.inserted[0]!;
    expect(String(insertSql)).toContain('INSERT INTO analyses');
    expect([season, source]).toEqual(['winter', 'photo']);
  });

  it('never writes a raw IP address', async () => {
    const db = fakeDb();
    await analysisPost(ctx(post({ season: 'winter', source: 'photo' }), { DB: db.binding }));
    expect(JSON.stringify(db.inserted)).not.toContain('203.0.113.7');
  });

  it('stops a visitor who is over the daily limit', async () => {
    const db = fakeDb({ count: 50 });
    const res = await analysisPost(
      ctx(post({ season: 'spring', source: 'quiz' }), { DB: db.binding, ANALYSIS_DAILY_LIMIT: '50' }),
    );
    expect(res.status).toBe(429);
    expect(db.inserted).toHaveLength(0);
  });

  it('honours a custom limit and falls back when it is nonsense', async () => {
    const under = fakeDb({ count: 2 });
    expect(
      (await analysisPost(ctx(post({ season: 'spring', source: 'quiz' }), { DB: under.binding, ANALYSIS_DAILY_LIMIT: '3' })))
        .status,
    ).toBe(200);

    const over = fakeDb({ count: 3 });
    expect(
      (await analysisPost(ctx(post({ season: 'spring', source: 'quiz' }), { DB: over.binding, ANALYSIS_DAILY_LIMIT: '3' })))
        .status,
    ).toBe(429);

    const bad = fakeDb({ count: 10 });
    expect(
      (await analysisPost(ctx(post({ season: 'spring', source: 'quiz' }), { DB: bad.binding, ANALYSIS_DAILY_LIMIT: 'lots' })))
        .status,
    ).toBe(200);
  });

  it('still succeeds for the visitor when the database misbehaves', async () => {
    const db = fakeDb({ failOn: 'select' });
    const res = await analysisPost(ctx(post({ season: 'spring', source: 'quiz' }), { DB: db.binding }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ recorded: false, reason: 'storage-unavailable' });
  });
});

describe('GET /api/analysis', () => {
  it('returns empty totals with no database', async () => {
    const res = await analysisGet(ctx(new Request('https://getcolormatch.com/api/analysis'), {}));
    await expect(res.json()).resolves.toEqual({ totals: [] });
  });

  it('returns grouped totals when a database is bound', async () => {
    const db = fakeDb();
    const res = await analysisGet(ctx(new Request('https://getcolormatch.com/api/analysis'), { DB: db.binding }));
    await expect(res.json()).resolves.toEqual({ totals: [{ season: 'spring', total: 3 }] });
  });
});

describe('GET /api/checkout', () => {
  it('reports that the paid plan is not switched on yet', async () => {
    const res = await checkoutGet(ctx(new Request('https://getcolormatch.com/api/checkout'), {}));
    await expect(res.json()).resolves.toEqual({ available: false, reason: 'checkout-not-configured' });
  });

  it('falls back to the hosted link, and says it carries no token', async () => {
    const res = await checkoutGet(
      ctx(new Request('https://getcolormatch.com/api/checkout'), { POLAR_CHECKOUT_URL: 'https://polar.sh/x' }),
    );
    await expect(res.json()).resolves.toEqual({ available: true, url: 'https://polar.sh/x', tokenless: true });
  });
});

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects a bad address before doing anything else', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await subscribePost(ctx(post({ email: 'nope', season: 'spring' }), {}));
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects an unknown season', async () => {
    expect((await subscribePost(ctx(post({ email: 'a@b.co', season: 'monsoon' }), {}))).status).toBe(400);
  });

  it('sends no email and says so when Resend is not configured', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await subscribePost(ctx(post({ email: 'a@b.co', season: 'spring' }), {}));
    expect(res.status).toBe(503);
    await expect(res.json()).resolves.toEqual({ sent: false, reason: 'email-not-configured' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('calls Resend with the configured sender once it is set up', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    const res = await subscribePost(
      ctx(post({ email: 'a@b.co', season: 'autumn' }), {
        RESEND_API_KEY: 're_test',
        RESEND_FROM: 'colormatch <hello@getcolormatch.com>',
      }),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: true });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0]!;
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.to).toEqual(['a@b.co']);
    expect(body.from).toBe('colormatch <hello@getcolormatch.com>');
    expect(body.subject).toContain('autumn');
  });

  it('reports a provider failure rather than pretending it sent', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 422 }));
    const res = await subscribePost(
      ctx(post({ email: 'a@b.co', season: 'autumn' }), { RESEND_API_KEY: 're_test', RESEND_FROM: 'x@y.co' }),
    );
    expect(res.status).toBe(502);
  });
});

describe('POST /api/webhooks/polar', () => {
  it('refuses traffic when no secret is configured', async () => {
    const res = await polarPost(ctx(post({ type: 'order.created' }), {}));
    expect(res.status).toBe(503);
  });

  it('refuses an unsigned delivery when a secret is configured', async () => {
    const res = await polarPost(
      ctx(post({ type: 'order.created' }), { POLAR_WEBHOOK_SECRET: `whsec_${btoa('key-material-here')}` }),
    );
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toMatchObject({ reason: 'missing-headers' });
  });

  it('accepts and records a correctly signed delivery exactly once', async () => {
    const secretBytes = 'key-material-here';
    const secret = `whsec_${btoa(secretBytes)}`;
    const body = JSON.stringify({ type: 'order.created' });
    const timestamp = Math.floor(Date.now() / 1000);
    const bin = atob(btoa(secretBytes));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`msg_7.${timestamp}.${body}`));
    const signature = btoa(String.fromCharCode(...new Uint8Array(mac)));

    const db = fakeDb();
    const res = await polarPost(
      ctx(
        post(body, {
          'webhook-id': 'msg_7',
          'webhook-timestamp': String(timestamp),
          'webhook-signature': `v1,${signature}`,
        }),
        { POLAR_WEBHOOK_SECRET: secret, DB: db.binding },
      ),
    );
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ received: true, type: 'order.created' });
    expect(String(db.inserted[0]![0])).toContain('INSERT OR IGNORE INTO billing_events');
    expect(db.inserted[0]!.slice(1)).toEqual(['msg_7', 'order.created']);
  });
});
