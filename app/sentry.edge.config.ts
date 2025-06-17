// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fe3b9c48f6054b7f0e19e933a59b1472@o4509006708867072.ingest.us.sentry.io/4509357885227008",

  // Enable error capturing with full sample rate (consistent with client/server configs)
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring

  // Enable debug mode to see if Sentry is working (consistent with client/server configs)
  debug: true,
});
