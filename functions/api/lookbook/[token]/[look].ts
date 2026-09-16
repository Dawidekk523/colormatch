import { json } from '../../../_shared';

/**
 * Serves one generated picture. The token in the address is the whole key, as
 * it is everywhere else in the paid product, so the bucket itself stays
 * private and nothing is guessable from outside.
 */
export const onRequestGet: PagesFunction<Env, 'token' | 'look'> = async ({ params, env }) => {
  const token = String(params.token ?? '');
  const look = String(params.look ?? '');
  if (!/^[0-9a-f]{32}$/.test(token) || !/^[a-z]{1,16}$/.test(look)) return json({ error: 'Not found' }, 404);
  if (!env.LOOKBOOK) return json({ error: 'Not found' }, 404);

  const object = await env.LOOKBOOK.get(`${token}/${look}.png`);
  if (!object) return json({ error: 'Not found' }, 404);

  return new Response(object.body, {
    headers: {
      'content-type': 'image/png',
      // Private to the holder of the token, and unchanged once made.
      'cache-control': 'private, max-age=86400',
    },
  });
};
