module.exports = {
  ci: {
    collect: {
      // Static site analysis
      staticDistDir: './out',
      // Or collect from a running server
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/templates',
        'http://localhost:3000/editor',
        'http://localhost:3000/dashboard',
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          disabled: true,
        },
      },
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Bundle size
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }],
        
        // Best practices
        'errors-in-console': ['error', { minScore: 0 }],
        'no-vulnerable-libraries': 'error',
        'uses-http2': 'warn',
        'uses-text-compression': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};