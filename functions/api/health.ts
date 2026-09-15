export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  return Response.json({
    ok: true,
    database: Boolean(env.DB),
    payments: Boolean(env.POLAR_WEBHOOK_SECRET),
    email: Boolean(env.RESEND_API_KEY),
  });
};
