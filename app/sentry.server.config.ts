// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fe3b9c48f6054b7f0e19e933a59b1472@o4509006708867072.ingest.us.sentry.io/4509357885227008",
  debug: true, // Enable debug mode to see if Sentry is working
  // Enable error capturing with full sample rate
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
  // Remove the empty integrations array to allow default integrations (including error capturing)
});
