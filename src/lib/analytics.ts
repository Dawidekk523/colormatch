import type { PostHog } from 'posthog-js';

/**
 * PostHog, shared project "Rosnące apki" (every event carries app=getcolormatch.com).
 * The SDK is imported once the page is idle and an event captured earlier waits
 * for the same promise, so it never costs first paint. Only the live host reports.
 * Events carry the season and the route taken, never the photo or anything read from it.
 */
const TOKEN = 'phc_oefH8qAXsjNKGyATiEUBs49yeecsxjUjyqxFVmzdynp8';

const APP = 'getcolormatch.com';

type Props = Record<string, string | number | boolean | null | undefined>;

let posthogPromise: Promise<PostHog | null> | null = null;

const idle = () =>
  new Promise<void>((resolve) => {
    const go = () => ('requestIdleCallback' in window ? requestIdleCallback(() => resolve()) : setTimeout(resolve, 1));
    if (document.readyState === 'complete') go();
    else addEventListener('load', go, { once: true });
  });

export function loadAnalytics(): Promise<PostHog | null> {
  if (typeof window === 'undefined' || !/^(www\.)?getcolormatch\.com$/.test(location.hostname)) {
    return Promise.resolve(null);
  }

  posthogPromise ??= idle()
    .then(() => import('posthog-js'))
    .then(({ default: posthog }) => {
      posthog.init(TOKEN, {
        api_host: '/ev',
        ui_host: 'https://eu.posthog.com',
        defaults: '2026-06-25',
        person_profiles: 'identified_only',
        persistence: 'localStorage',
        capture_pageview: 'history_change',
        capture_pageleave: true,
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        before_send: (event) => {
          if (event) event.properties.app = APP;
          return event;
        },
      });
      return posthog;
    })
    .catch(() => null);

  return posthogPromise;
}

export function track(event: string, props?: Props): void {
  void loadAnalytics().then((posthog) => {
    try {
      posthog?.capture(event, props);
    } catch {
      // Analytics must never interrupt a conversion.
    }
  });
}

/** The anonymous id, handed to checkout so the server-side purchase joins the same funnel. */
export async function visitorId(): Promise<string | undefined> {
  const posthog = await Promise.race([loadAnalytics(), new Promise<null>((r) => setTimeout(() => r(null), 800))]);
  try {
    return posthog?.get_distinct_id() || undefined;
  } catch {
    return undefined;
  }
}
