import { json } from '../_shared';

/**
 * The upgrade button asks here for the hosted Polar checkout link. Keeping the
 * link in an environment variable means the paid plan can be switched on
 * without a code change, and nothing secret ships in the bundle.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.POLAR_CHECKOUT_URL) {
    return json({ available: false, reason: 'checkout-not-configured' });
  }
  return json({ available: true, url: env.POLAR_CHECKOUT_URL });
};
