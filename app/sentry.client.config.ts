import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fe3b9c48f6054b7f0e19e933a59b1472@o4509006708867072.ingest.us.sentry.io/4509357885227008",
  debug: true, // Enable debug mode to see if Sentry is working
  // Enable error capturing with full sample rate
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  // Add optional integrations for additional features
  integrations: [
    Sentry.replayIntegration(),
  ],
  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,
});  