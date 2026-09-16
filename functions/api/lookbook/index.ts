import { consumeDailyBudget, json } from '../../_shared';

/**
 * The lookbook is the only thing on this site that sends a photograph
 * anywhere. Everything about this endpoint follows from that:
 *
 *  - it runs only for a token that has been paid for, and only when the visitor
 *    has agreed to it in this very request;
 *  - the photograph is read into memory, passed to the image model and dropped.
 *    It is never written to R2, to D1, or to a log;
 *  - what comes back is stored under the token and can be deleted by whoever
 *    holds that token, which is the buyer and nobody else;
 *  - if the key or the bucket is missing the whole feature reports itself as
 *    unavailable rather than half-working.
 */

/** The wording someone agrees to. Bump the suffix whenever the wording changes. */
export const CONSENT_WORDING = 'lookbook-2026-09-a';

interface Look {
  id: string;
  /** What the picture is of, in the visitor's language and in the prompt. */
  label: string;
  garment: string;
}

export const LOOKS: Look[] = [
  { id: 'knit', label: 'An everyday knit', garment: 'a plain fine-knit crew-neck jumper' },
  { id: 'shirt', label: 'A shirt for work', garment: 'a plain collared shirt' },
  { id: 'coat', label: 'A coat over a top', garment: 'an unbuttoned wool coat over a plain top' },
  { id: 'scarf', label: 'One accent, at the neck', garment: 'a plain silk scarf tied at the neck' },
];

const MAX_PHOTO_BYTES = 12 * 1024 * 1024;

interface Row {
  paid_at: string | null;
  palette_json: string | null;
}

interface Swatch {
  name: string;
  hex: string;
}

const isToken = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{32}$/.test(value);

const isHex = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

/** Picks the colour a look is built around, from the palette frozen at purchase. */
function swatchFor(paletteJson: string | null, lookId: string): Swatch | null {
  if (!paletteJson) return null;
  let card: { wear?: Swatch[]; neutrals?: Swatch[] };
  try {
    card = JSON.parse(paletteJson) as { wear?: Swatch[]; neutrals?: Swatch[] };
  } catch {
    return null;
  }
  const wear = Array.isArray(card.wear) ? card.wear.filter((s) => isHex(s?.hex)) : [];
  const neutrals = Array.isArray(card.neutrals) ? card.neutrals.filter((s) => isHex(s?.hex)) : [];
  const index = LOOKS.findIndex((look) => look.id === lookId);
  if (index < 0) return null;
  // The coat is the one garment people buy in a neutral, so it is drawn from
  // the neutrals; the rest carry the palette itself.
  const pool = lookId === 'coat' && neutrals.length ? neutrals : wear;
  return pool.length ? (pool[index % pool.length] ?? null) : null;
}

/**
 * The prompt says what to change and, at greater length, what not to. An image
 * model asked for "a portrait" will happily return a different person; asked to
 * keep the face, the hair and the light, it returns the same one in a jumper.
 */
function promptFor(look: Look, swatch: Swatch): string {
  return [
    `Replace only the clothing in this photograph with ${look.garment} in ${swatch.name} (${swatch.hex.toUpperCase()}).`,
    'Keep the same person exactly as they are: the same face, skin tone, freckles, hair, hairline and expression, unretouched and unsmoothed.',
    'Keep the pose and the lighting of the original photograph, and the framing too — unless the clothing would barely be in shot, in which case pull back just far enough to show the shoulders and upper chest.',
    'The garment must be one flat colour with no pattern, no print and no logo.',
    'Plain, softly lit background. No text, no watermark, no border.',
  ].join(' ');
}

async function generate(
  apiKey: string,
  model: string,
  photo: Blob,
  prompt: string,
): Promise<{ ok: true; png: ArrayBuffer } | { ok: false; reason: string; status: number }> {
  const body = new FormData();
  body.append('model', model);
  body.append('prompt', prompt);
  body.append('image', photo, 'photo.png');
  body.append('size', '1024x1024');
  body.append('quality', 'medium');
  body.append('n', '1');
  body.append('output_format', 'png');

  // The model can take a minute or more. This is the ceiling before the edge
  // would close the connection anyway, and a clear failure beats a hung page.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}` },
      body,
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    return {
      ok: false,
      status: 504,
      reason: (err as Error)?.name === 'AbortError' ? 'timeout' : 'network',
    };
  }
  clearTimeout(timer);

  if (!response.ok) {
    // A refusal is worth telling apart from an outage: one is about the photo,
    // the other is about us.
    return { ok: false, status: response.status === 400 ? 422 : 502, reason: 'model' };
  }

  const payload = (await response.json()) as { data?: { b64_json?: string }[] };
  const b64 = payload.data?.[0]?.b64_json;
  if (!b64) return { ok: false, status: 502, reason: 'empty' };

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return { ok: true, png: bytes.buffer };
}

/** Says whether the feature is switched on at all, and what has been made. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const token = new URL(request.url).searchParams.get('token');
  const available = Boolean(env.LOOKBOOK && env.OPENAI_API_KEY && env.DB);
  if (!available) return json({ available: false, looks: [] });
  if (!isToken(token)) return json({ available: true, looks: [] });

  const made = await env.DB!.prepare(
    'SELECT look_id, label, hex FROM lookbook_images WHERE token = ? ORDER BY created_at',
  )
    .bind(token)
    .all<{ look_id: string; label: string; hex: string }>();

  return json({
    available: true,
    catalogue: LOOKS.map(({ id, label }) => ({ id, label })),
    looks: (made.results ?? []).map((row) => ({
      id: row.look_id,
      label: row.label,
      hex: row.hex,
      src: `/api/lookbook/${token}/${row.look_id}`,
    })),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.LOOKBOOK || !env.OPENAI_API_KEY || !env.DB) {
    return json({ error: 'The lookbook is not switched on.' }, 503);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: 'Expected a form.' }, 400);
  }

  const token = form.get('token');
  const lookId = form.get('look');
  const consent = form.get('consent');
  const photo = form.get('photo');

  if (!isToken(token)) return json({ error: 'Unknown result.' }, 400);
  if (consent !== CONSENT_WORDING) return json({ error: 'Consent is required.' }, 400);
  const look = LOOKS.find((item) => item.id === lookId);
  if (!look) return json({ error: 'Unknown look.' }, 400);
  if (!(photo instanceof File) || photo.size === 0) return json({ error: 'A photo is required.' }, 400);
  if (photo.size > MAX_PHOTO_BYTES) return json({ error: 'That photo is too large to send.' }, 413);

  const row = await env.DB.prepare('SELECT paid_at, palette_json FROM results WHERE token = ?')
    .bind(token)
    .first<Row>();
  if (!row) return json({ error: 'Unknown result.' }, 404);
  if (!row.paid_at) return json({ error: 'This report has not been paid for.' }, 402);

  const swatch = swatchFor(row.palette_json, look.id);
  if (!swatch) return json({ error: 'This report has no palette to dress you in.' }, 409);

  // Two ceilings: what one purchase may spend, and what one address may start
  // in a day. The first is about cost, the second about someone else's cost.
  const cap = Number.parseInt(env.LOOKBOOK_MAX_IMAGES ?? '8', 10) || 8;
  const made = await env.DB.prepare('SELECT COUNT(*) AS n FROM lookbook_images WHERE token = ?')
    .bind(token)
    .first<{ n: number }>();
  if ((made?.n ?? 0) >= cap) return json({ error: 'This report has used all of its pictures.' }, 429);
  if (!(await consumeDailyBudget(env.DB, request, 'lookbook', cap))) {
    return json({ error: 'Too many pictures from this connection today.' }, 429);
  }

  await env.DB.prepare(
    'INSERT OR IGNORE INTO lookbook_consent (token, wording) VALUES (?, ?)',
  )
    .bind(token, CONSENT_WORDING)
    .run();

  const result = await generate(
    env.OPENAI_API_KEY,
    env.LOOKBOOK_MODEL ?? 'gpt-image-2.5-flare',
    photo,
    promptFor(look, swatch),
  );

  if (!result.ok) {
    const message =
      result.reason === 'timeout'
        ? 'The picture took too long to come back. Please try again.'
        : result.reason === 'model'
          ? 'The image service would not work with that photo. A clear, front-facing photo of one person works best.'
          : 'The picture could not be made just now. Please try again in a moment.';
    return json({ error: message, reason: result.reason }, result.status);
  }

  const key = `${token}/${look.id}.png`;
  await env.LOOKBOOK.put(key, result.png, { httpMetadata: { contentType: 'image/png' } });
  await env.DB.prepare(
    `INSERT INTO lookbook_images (token, look_id, object_key, label, hex) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(token, look_id) DO UPDATE SET object_key = excluded.object_key, created_at = datetime('now')`,
  )
    .bind(token, look.id, key, look.label, swatch.hex)
    .run();

  return json({
    look: { id: look.id, label: look.label, hex: swatch.hex, src: `/api/lookbook/${token}/${look.id}` },
  });
};

/** Everything generated for one token, gone — pictures first, then the rows. */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.LOOKBOOK || !env.DB) return json({ deleted: false }, 503);

  const token = new URL(request.url).searchParams.get('token');
  if (!isToken(token)) return json({ deleted: false }, 400);

  const rows = await env.DB.prepare('SELECT object_key FROM lookbook_images WHERE token = ?')
    .bind(token)
    .all<{ object_key: string }>();

  for (const row of rows.results ?? []) {
    await env.LOOKBOOK.delete(row.object_key);
  }
  await env.DB.prepare('DELETE FROM lookbook_images WHERE token = ?').bind(token).run();

  return json({ deleted: true, count: (rows.results ?? []).length });
};
