import * as Sentry from '@sentry/react'

const frontendSentryDSN =
  'https://b92ee638e21f852d20cf45df43d65cc8@o4512313935527936.ingest.us.sentry.io/4512313978126336'
const productionHostname = 'fitpro-germorini-front-prod.onrender.com'

export function initMonitoring(hostname = window.location.hostname) {
  if (hostname !== productionHostname) return

  Sentry.init({
    dsn: frontendSentryDSN,
    environment: hostname,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0,
  })
}

initMonitoring()
