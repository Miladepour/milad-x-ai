import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/sentry/options";

Sentry.init({
  ...sharedSentryOptions,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
