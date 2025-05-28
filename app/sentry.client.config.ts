import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://fe3b9c48f6054b7f0e19e933a59b1472@o4509006708867072.ingest.us.sentry.io/4509357885227008",
  debug: false,
  // Disable performance monitoring
  tracesSampleRate: 0,
  // Disable OpenTelemetry
  integrations: [],
}); 