import * as Sentry from '@sentry/react'

const frontendSentryDSN =
  'https://d5e3e4e48575b548a6639e5ea28f167f@o4512313935527936.ingest.us.sentry.io/4512319084036096'
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
