// @vitest-environment jsdom

import * as Sentry from '@sentry/react'
import { initMonitoring } from './monitoring'

vi.mock('@sentry/react', () => ({
  init: vi.fn(),
  browserTracingIntegration: vi.fn(() => ({ name: 'BrowserTracing' })),
}))

describe('initMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes Sentry for production', () => {
    initMonitoring('fitpro-germorini-front-prod.onrender.com')

    expect(Sentry.browserTracingIntegration).toHaveBeenCalledOnce()
    expect(Sentry.init).toHaveBeenCalledWith({
      dsn: 'https://d5e3e4e48575b548a6639e5ea28f167f@o4512313935527936.ingest.us.sentry.io/4512319084036096',
      environment: 'fitpro-germorini-front-prod.onrender.com',
      integrations: [{ name: 'BrowserTracing' }],
      tracesSampleRate: 1.0,
    })
  })

  it.each([
    'localhost',
    'fitpro-germorini-front-qa.onrender.com',
  ])('does not initialize Sentry for %s', (hostname) => {
    initMonitoring(hostname)

    expect(Sentry.init).not.toHaveBeenCalled()
  })
})
