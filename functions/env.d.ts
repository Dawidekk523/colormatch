export {};

declare global {
  interface Env {
    /** D1 binding for anonymous counters. Optional at runtime: the app works without it. */
    DB?: D1Database;
    /** Standard Webhooks secret from the Polar dashboard, `whsec_`-prefixed base64. */
    POLAR_WEBHOOK_SECRET?: string;
    /** Hosted checkout link used by the upgrade button. */
    POLAR_CHECKOUT_URL?: string;
    /** Resend API key. When unset, the email endpoint reports "not configured". */
    RESEND_API_KEY?: string;
    /** Verified sender, e.g. `colormatch <hello@getcolormatch.com>`. */
    RESEND_FROM?: string;
    /** Max anonymous analyses recorded per IP per day. */
    ANALYSIS_DAILY_LIMIT?: string;
  }

  type PagesFn = PagesFunction<Env>;
}
