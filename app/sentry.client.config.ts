import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fe3b9c48f6054b7f0e19e933a59b1472@o4509006708867072.ingest.us.sentry.io/4509357885227008",
  debug: true, // Enable debug mode to see if Sentry is working
  // Enable error capturing with full sample rate
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  // Add optional integrations for additional features
  // Define how likely Replay events are sampled.
  replaysSessionSampleRate: 1.0,
  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
    // NOTE: This will disable built-in masking. Only use this if your site has no sensitive data, or if you've already set up other options for masking or blocking relevant data, such as 'ignore', 'block', 'mask' and 'maskFn'.
    maskAllText: false,
    blockAllMedia: false,
    }),
  ],
}); 