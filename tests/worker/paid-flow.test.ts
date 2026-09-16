// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { onRequestGet as checkoutGet, onRequestPost as checkoutPost } from '../../functions/api/checkout';
import { onRequestPost as resultPost } from '../../functions/api/result/index';
import { onRequestGet as resultGet } from '../../functions/api/result/[token]';
import { onRequestPost as polarPost } from '../../functions/api/webhooks/polar';

interface Row {
  token: string;
  season: string;
  undertone: string;
  source: string;
  confidence: number;
  palette_json: string | null;
  paid_at: string | null;
  email: string | null;
  checkout_id: string | null;
}

/**
 * A stand-in for D1 that actually remembers rows, because the whole point of
 * this flow is that a token written in one request is found again in another.
 */
function fakeDb(seed: Partial<Row>[] = [], budget = 0) {
  const rows = new Map<string, Row>();
  for (const row of seed) {
    const full: Row = {
      token: 'x',
      season: 'autumn',
      undertone: 'warm',
      source: 'quiz',
      confidence: 0.5,
      palette_json: null,
      paid_at: null,
      email: null,
      checkout_id: null,
      ...row,
    };
    rows.set(full.token, full);
  }
  const events = new Set<string>();

  const statement = (sql: string) => ({
    bound: [] as unknown[],
    bind(...args: unknown[]) {
      this.bound = args;
      return this;
    },
    async first() {
      if (sql.includes('FROM rate_limits')) return budget ? { count: budget } : null;
      if (sql.includes('FROM results WHERE token = ?')) return rows.get(String(this.bound[0])) ?? null;
      if (sql.includes('FROM results WHERE checkout_id = ?')) {
        return [...rows.values()].find((row) => row.checkout_id === this.bound[0]) ?? null;
      }
      return null;
    },
    async run() {
      if (sql.includes('INSERT INTO results')) {
        const [token, season, undertone, source, confidence, paletteJson] = this.bound as [
          string,
          string,
          string,
          string,
          number,
          string | null,
        ];
        rows.set(token, {
          token,
          season,
          undertone,
          source,
          confidence,
          palette_json: paletteJson ?? null,
          paid_at: null,
          email: null,
          checkout_id: null,
        });
      }
      if (sql.includes('UPDATE results SET checkout_id')) {
        const row = rows.get(String(this.bound[1]));
        if (row) row.checkout_id = String(this.bound[0]);
      }
      if (sql.includes('UPDATE results SET paid_at')) {
        const row = rows.get(String(this.bound[2]));
        if (row) {
          row.paid_at = row.paid_at ?? '2026-09-16 00:00:00';
          row.email = (this.bound[0] as string | null) ?? row.email;
          row.checkout_id = (this.bound[1] as string | null) ?? row.checkout_id;
        }
      }
      if (sql.includes('INSERT OR IGNORE INTO billing_events')) {
        const id = String(this.bound[0]);
        const fresh = !events.has(id);
        events.add(id);
        return { success: true, meta: { changes: fresh ? 1 : 0 } };
      }
      return { success: true, meta: { changes: 1 } };
    },
    async all() {
      return { results: [] };
    },
  });

  return { rows, binding: { prepare: (sql: string) => statement(sql) } as unknown as D1Database };
}

const ctx = (request: Request, env: Env, params: Record<string, string> = {}) =>
  ({ request, env, params }) as unknown as Parameters<PagesFunction<Env>>[0];

const post = (body: unknown) =>
  new Request('https://getcolormatch.com/api/x', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': '203.0.113.7' },
    body: JSON.stringify(body),
  });

const RESULT = { season: 'autumn', undertone: 'warm', source: 'quiz', confidence: 0.7 };
const TOKEN = 'a'.repeat(32);

/** Signs a body the way Polar does, so the webhook accepts it. */
async function signed(body: string, id = 'msg_1') {
  const secretBytes = 'key-material-here';
  const secret = `whsec_${btoa(secretBytes)}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const bytes = new Uint8Array([...secretBytes].map((c) => c.charCodeAt(0)));
  const key = await crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`));
  const signature = btoa(String.fromCharCode(...new Uint8Array(mac)));
  const request = new Request('https://getcolormatch.com/api/webhooks/polar', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'webhook-id': id,
      'webhook-timestamp': String(timestamp),
      'webhook-signature': `v1,${signature}`,
    },
    body,
  });
  return { request, secret };
}

afterEach(() => vi.restoreAllMocks());

describe('POST /api/result', () => {
  it('refuses a result it cannot make sense of', async () => {
    const db = fakeDb();
    for (const bad of [{ ...RESULT, season: 'monsoon' }, { ...RESULT, undertone: 'beige' }, { ...RESULT, source: 'x' }]) {
      const res = await resultPost(ctx(post(bad), { DB: db.binding }));
      expect(res.status).toBe(400);
    }
  });

  it('parks a result under a token that cannot be guessed', async () => {
    const db = fakeDb();
    const res = await resultPost(ctx(post(RESULT), { DB: db.binding }));
    const body = (await res.json()) as { stored: boolean; token: string };
    expect(body.stored).toBe(true);
    expect(body.token).toMatch(/^[0-9a-f]{32}$/);
    expect(db.rows.get(body.token)?.season).toBe('autumn');
    expect(db.rows.get(body.token)?.email).toBeNull();
  });

  it('keeps the card the browser sent, and drops one that is absurdly large', async () => {
    const db = fakeDb();
    const card = { version: 1, season: 'autumn', wear: [] };
    const first = (await (await resultPost(ctx(post({ ...RESULT, card }), { DB: db.binding }))).json()) as {
      token: string;
    };
    expect(JSON.parse(db.rows.get(first.token)?.palette_json ?? 'null')).toEqual(card);

    const huge = { version: 1, filler: 'x'.repeat(9000) };
    const second = (await (await resultPost(ctx(post({ ...RESULT, card: huge }), { DB: db.binding }))).json()) as {
      token: string;
    };
    expect(db.rows.get(second.token)?.palette_json).toBeNull();
  });

  it('says plainly that there is nowhere to park it without a database', async () => {
    const res = await resultPost(ctx(post(RESULT), {}));
    expect(res.status).toBe(503);
  });

  it('stops a visitor from filling the table', async () => {
    const db = fakeDb([], 20);
    const res = await resultPost(ctx(post(RESULT), { DB: db.binding, RESULT_DAILY_LIMIT: '20' }));
    expect(res.status).toBe(429);
  });
});

describe('GET /api/result/:token', () => {
  it('does not confirm whether an unknown token ever existed', async () => {
    const db = fakeDb();
    const res = await resultGet(ctx(new Request('https://getcolormatch.com'), { DB: db.binding }, { token: TOKEN }));
    expect(res.status).toBe(404);
  });

  it('gives back the season before payment, but not the card', async () => {
    const db = fakeDb([{ token: TOKEN, palette_json: '{"card":true}' }]);
    const res = await resultGet(ctx(new Request('https://getcolormatch.com'), { DB: db.binding }, { token: TOKEN }));
    await expect(res.json()).resolves.toMatchObject({ found: true, paid: false, card: null });
  });

  it('gives back the card once the order is paid', async () => {
    const db = fakeDb([{ token: TOKEN, paid_at: '2026-09-16', palette_json: '{"card":true}' }]);
    const res = await resultGet(ctx(new Request('https://getcolormatch.com'), { DB: db.binding }, { token: TOKEN }));
    await expect(res.json()).resolves.toMatchObject({ found: true, paid: true, card: { card: true } });
  });
});

describe('POST /api/checkout', () => {
  const env = (db: D1Database): Env => ({
    DB: db,
    POLAR_ACCESS_TOKEN: 'polar_oat_x',
    POLAR_PRODUCT_ID: 'prod_1',
    POLAR_API_BASE: 'https://sandbox-api.polar.sh',
  });

  it('will not open a checkout for a result that was never parked', async () => {
    const db = fakeDb();
    const res = await checkoutPost(ctx(post({ token: TOKEN }), env(db.binding)));
    expect(res.status).toBe(404);
  });

  it('sends the token through as metadata and remembers the checkout id', async () => {
    const db = fakeDb([{ token: TOKEN }]);
    const seen: { url?: string; body?: string } = {};
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      seen.url = String(input);
      seen.body = init?.body as string;
      return new Response(JSON.stringify({ id: 'checkout_9', url: 'https://polar.sh/c/9' }), { status: 200 });
    });

    const res = await checkoutPost(ctx(post({ token: TOKEN }), env(db.binding)));
    await expect(res.json()).resolves.toEqual({ available: true, url: 'https://polar.sh/c/9' });
    expect(seen.url).toBe('https://sandbox-api.polar.sh/v1/checkouts/');
    const sent = JSON.parse(seen.body ?? '{}');
    expect(sent.metadata).toEqual({ token: TOKEN });
    expect(sent.products).toEqual(['prod_1']);
    expect(sent.success_url).toContain(`t=${TOKEN}`);
    expect(db.rows.get(TOKEN)?.checkout_id).toBe('checkout_9');
  });

  it('does not pretend to sell when Polar is down', async () => {
    const db = fakeDb([{ token: TOKEN }]);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    const res = await checkoutPost(ctx(post({ token: TOKEN }), env(db.binding)));
    expect(res.status).toBe(502);
  });

  it('reports the plan as open once Polar and the database are configured', async () => {
    const db = fakeDb();
    const res = await checkoutGet(ctx(new Request('https://getcolormatch.com'), env(db.binding)));
    await expect(res.json()).resolves.toEqual({ available: true });
  });
});

describe('the paid webhook', () => {
  const body = (extra: Record<string, unknown> = {}) =>
    JSON.stringify({
      type: 'order.paid',
      data: {
        checkout_id: 'checkout_9',
        customer: { email: 'buyer@example.com' },
        metadata: { token: TOKEN },
        ...extra,
      },
    });

  it('marks the result paid, keeps the buyer email and sends the link', async () => {
    const db = fakeDb([{ token: TOKEN }]);
    const { request, secret } = await signed(body());
    const sent: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      sent.push(init?.body as string);
      return new Response(JSON.stringify({ id: 'email_1' }), { status: 200 });
    });

    const res = await polarPost(
      ctx(request, {
        DB: db.binding,
        POLAR_WEBHOOK_SECRET: secret,
        RESEND_API_KEY: 're_x',
        EMAIL_FROM: 'colormatch <hello@getcolormatch.com>',
      }),
    );

    await expect(res.json()).resolves.toMatchObject({ matched: true, emailed: true });
    expect(db.rows.get(TOKEN)?.paid_at).toBeTruthy();
    expect(db.rows.get(TOKEN)?.email).toBe('buyer@example.com');
    expect(sent[0]).toContain(`/result/?t=${TOKEN}`);
  });

  it('finds the result by checkout id when the metadata did not survive', async () => {
    const db = fakeDb([{ token: TOKEN, checkout_id: 'checkout_9' }]);
    const { request, secret } = await signed(
      JSON.stringify({
        type: 'order.paid',
        data: { checkout_id: 'checkout_9', customer: { email: 'buyer@example.com' } },
      }),
    );
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const res = await polarPost(
      ctx(request, { DB: db.binding, POLAR_WEBHOOK_SECRET: secret, RESEND_API_KEY: 're_x', EMAIL_FROM: 'a@b.co' }),
    );
    await expect(res.json()).resolves.toMatchObject({ matched: true });
    expect(db.rows.get(TOKEN)?.paid_at).toBeTruthy();
  });

  it('does not email twice when Polar retries the same event', async () => {
    const db = fakeDb([{ token: TOKEN }]);
    const calls: string[] = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      calls.push('sent');
      return new Response('{}', { status: 200 });
    });

    const env: Env = {
      DB: db.binding,
      RESEND_API_KEY: 're_x',
      EMAIL_FROM: 'a@b.co',
      POLAR_WEBHOOK_SECRET: '',
    };
    const first = await signed(body(), 'msg_dup');
    env.POLAR_WEBHOOK_SECRET = first.secret;
    await polarPost(ctx(first.request, env));
    const again = await signed(body(), 'msg_dup');
    await polarPost(ctx(again.request, env));

    expect(calls).toHaveLength(1);
  });

  it('ignores a checkout that has not been paid for', async () => {
    const db = fakeDb([{ token: TOKEN }]);
    const { request, secret } = await signed(
      JSON.stringify({ type: 'checkout.updated', data: { status: 'open', metadata: { token: TOKEN } } }),
    );
    const res = await polarPost(ctx(request, { DB: db.binding, POLAR_WEBHOOK_SECRET: secret }));
    await expect(res.json()).resolves.toEqual({ received: true, type: 'checkout.updated' });
    expect(db.rows.get(TOKEN)?.paid_at).toBeNull();
  });
});
