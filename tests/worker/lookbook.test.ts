// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CONSENT_WORDING,
  LOOKS,
  onRequestDelete as lookbookDelete,
  onRequestGet as lookbookGet,
  onRequestPost as lookbookPost,
} from '../../functions/api/lookbook/index';

const TOKEN = 'a'.repeat(32);

const PALETTE = JSON.stringify({
  wear: [
    { name: 'Powder Blue', hex: '#8fb3d1' },
    { name: 'Soft Rose', hex: '#d4939f' },
    { name: 'Lavender', hex: '#a294c4' },
    { name: 'Dusty Pink', hex: '#c98f9c' },
  ],
  neutrals: [{ name: 'Cool Grey', hex: '#9aa1a9' }],
});

/** Enough D1 to answer the two questions this endpoint asks of it. */
function fakeDb(row: { paid_at: string | null; palette_json: string | null } | null, made = 0) {
  const writes: string[] = [];
  return {
    writes,
    binding: {
      prepare(sql: string) {
        return {
          bind() {
            return this;
          },
          async first() {
            if (sql.includes('COUNT(*)')) return { n: made };
            if (sql.includes('FROM results')) return row;
            if (sql.includes('rate_limits')) return { count: 0 };
            return null;
          },
          async run() {
            writes.push(sql);
            return { success: true };
          },
          async all() {
            return { results: [] };
          },
        };
      },
    } as unknown as D1Database,
  };
}

function fakeBucket() {
  const store = new Map<string, ArrayBuffer>();
  return {
    store,
    binding: {
      async put(key: string, value: ArrayBuffer) {
        store.set(key, value);
        return {};
      },
      async get(key: string) {
        return store.has(key) ? { body: null } : null;
      },
      async delete(key: string) {
        store.delete(key);
      },
    } as unknown as R2Bucket,
  };
}

const onePixelPng = () =>
  new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], 'me.png', {
    type: 'image/png',
  });

function form(overrides: Record<string, string | File> = {}) {
  const body = new FormData();
  body.append('token', TOKEN);
  body.append('look', LOOKS[0]!.id);
  body.append('consent', CONSENT_WORDING);
  body.append('photo', onePixelPng());
  for (const [key, value] of Object.entries(overrides)) {
    body.delete(key);
    body.append(key, value);
  }
  return body;
}

const post = (env: Partial<Env>, body: FormData) =>
  lookbookPost({
    request: new Request('https://getcolormatch.com/api/lookbook', { method: 'POST', body }),
    env: env as Env,
  } as never);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the lookbook endpoint', () => {
  it('reports itself off when the key or the bucket is missing', async () => {
    const response = await lookbookGet({
      request: new Request(`https://getcolormatch.com/api/lookbook?token=${TOKEN}`),
      env: {} as Env,
    } as never);
    expect(await response.json()).toEqual({ available: false, looks: [] });
  });

  it('refuses to send a photo anywhere without consent in the same request', async () => {
    const db = fakeDb({ paid_at: '2026-09-16', palette_json: PALETTE });
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const response = await post(
      { DB: db.binding, LOOKBOOK: fakeBucket().binding, OPENAI_API_KEY: 'sk-test' },
      form({ consent: 'nope' }),
    );

    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refuses a result that has not been paid for', async () => {
    const db = fakeDb({ paid_at: null, palette_json: PALETTE });
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const response = await post(
      { DB: db.binding, LOOKBOOK: fakeBucket().binding, OPENAI_API_KEY: 'sk-test' },
      form(),
    );

    expect(response.status).toBe(402);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('names the palette colour in the prompt and keeps only what comes back', async () => {
    const db = fakeDb({ paid_at: '2026-09-16', palette_json: PALETTE });
    const bucket = fakeBucket();
    let sent: FormData | null = null;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      sent = init.body as FormData;
      return new Response(JSON.stringify({ data: [{ b64_json: btoa('png-bytes') }] }), { status: 200 });
    });

    const response = await post(
      { DB: db.binding, LOOKBOOK: bucket.binding, OPENAI_API_KEY: 'sk-test' },
      form(),
    );

    expect(response.status).toBe(200);
    const prompt = String(sent!.get('prompt'));
    expect(prompt).toContain('#8FB3D1');
    expect(prompt).toContain('the same face');
    // The photograph itself is never written down; only the result is.
    expect([...bucket.store.keys()]).toEqual([`${TOKEN}/${LOOKS[0]!.id}.png`]);
    expect(db.writes.some((sql) => sql.includes('lookbook_consent'))).toBe(true);
  });

  it('stops a report that has already used its allowance', async () => {
    const db = fakeDb({ paid_at: '2026-09-16', palette_json: PALETTE }, 8);
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const response = await post(
      { DB: db.binding, LOOKBOOK: fakeBucket().binding, OPENAI_API_KEY: 'sk-test', LOOKBOOK_MAX_IMAGES: '8' },
      form(),
    );

    expect(response.status).toBe(429);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('deletes every picture it made for a token', async () => {
    const bucket = fakeBucket();
    bucket.store.set(`${TOKEN}/knit.png`, new ArrayBuffer(1));
    const db = {
      prepare() {
        return {
          bind() {
            return this;
          },
          async all() {
            return { results: [{ object_key: `${TOKEN}/knit.png` }] };
          },
          async run() {
            return { success: true };
          },
        };
      },
    } as unknown as D1Database;

    const response = await lookbookDelete({
      request: new Request(`https://getcolormatch.com/api/lookbook?token=${TOKEN}`, { method: 'DELETE' }),
      env: { DB: db, LOOKBOOK: bucket.binding } as Env,
    } as never);

    expect(await response.json()).toEqual({ deleted: true, count: 1 });
    expect(bucket.store.size).toBe(0);
  });
});
