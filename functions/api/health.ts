/**
 * What is wired up, as booleans. Never values: this is a public address, and
 * the point is to be able to see from outside that a deployment picked up its
 * configuration without anyone having to guess from a broken checkout.
 */
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({
    ok: true,
    database: Boolean(env.DB),
    checkout: Boolean(env.POLAR_ACCESS_TOKEN && env.POLAR_PRODUCT_ID),
    webhook: Boolean(env.POLAR_WEBHOOK_SECRET),
    email: Boolean(
      (env.EMAIL_SES_ACCESS_KEY_ID && env.EMAIL_SES_SECRET_ACCESS_KEY) || env.RESEND_API_KEY,
    ),
    sender: Boolean(env.EMAIL_FROM ?? env.RESEND_FROM),
    lookbook: Boolean(env.LOOKBOOK && env.OPENAI_API_KEY),
  });
};
