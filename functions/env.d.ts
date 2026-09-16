export {};

declare global {
  interface Env {
    /** D1 binding for anonymous counters. Optional at runtime: the app works without it. */
    DB?: D1Database;
    /** Standard Webhooks secret from the Polar dashboard, `whsec_`-prefixed base64. */
    POLAR_WEBHOOK_SECRET?: string;
    /** Hosted checkout link. Legacy fallback: it cannot carry a result token. */
    POLAR_CHECKOUT_URL?: string;
    /** Organization access token, used to create a checkout server-side. */
    POLAR_ACCESS_TOKEN?: string;
    /** The product being sold. */
    POLAR_PRODUCT_ID?: string;
    /** `https://sandbox-api.polar.sh` while testing; defaults to production. */
    POLAR_API_BASE?: string;
    /** SES region holding the verified `getcolormatch.com` identity. */
    EMAIL_SES_REGION?: string;
    EMAIL_SES_ACCESS_KEY_ID?: string;
    EMAIL_SES_SECRET_ACCESS_KEY?: string;
    /** Optional SES configuration set, for bounce and complaint tracking. */
    EMAIL_SES_CONFIGURATION_SET?: string;
    /** Verified sender, e.g. `colormatch <hello@getcolormatch.com>`. */
    EMAIL_FROM?: string;
    /** Resend API key. Fallback sender when SES is unset or unavailable. */
    RESEND_API_KEY?: string;
    /** Sender used by the Resend fallback when EMAIL_FROM is unset. */
    RESEND_FROM?: string;
    /** Max anonymous analyses recorded per IP per day. */
    ANALYSIS_DAILY_LIMIT?: string;
    /** Max results parked for checkout per IP per day. */
    RESULT_DAILY_LIMIT?: string;
    /** Bucket holding generated lookbook images. Absent means the feature is off. */
    LOOKBOOK?: R2Bucket;
    /** OpenAI key for the image model. Absent means the feature is off. */
    OPENAI_API_KEY?: string;
    /** Image model id, e.g. `gpt-image-2.5-flare`. */
    LOOKBOOK_MODEL?: string;
    /** How many images one purchase may generate in total. */
    LOOKBOOK_MAX_IMAGES?: string;
  }

  type PagesFn = PagesFunction<Env>;
}
