import { z } from 'zod';

/**
 * Environment variable schema for validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Public URLs
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  
  // Shopify
  NEXT_PUBLIC_SHOPIFY_APP_URL: z.string().url().optional(),
  SHOPIFY_API_KEY: z.string().min(1).optional(),
  SHOPIFY_API_SECRET: z.string().min(1).optional(),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_PWA: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_BETA_FEATURES: z.string().transform(val => val === 'true').default('false'),
  
  // Performance
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform(Number).default('30000'),
  NEXT_PUBLIC_API_RETRY_COUNT: z.string().transform(Number).default('3'),
  NEXT_PUBLIC_CACHE_DURATION: z.string().transform(Number).default('300'),
  
  // Build
  ANALYZE: z.string().transform(val => val === 'true').optional(),
  BUNDLE_ANALYZE: z.enum(['server', 'browser', 'both']).optional(),
  
  // Debug
  NEXT_PUBLIC_DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

/**
 * Parse and validate environment variables
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
}

// Validated environment variables
export const env = validateEnv();

// Environment checks
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const isServer = typeof window === 'undefined';
export const isClient = !isServer;

/**
 * Configuration object with environment-specific values
 */
export const config = {
  /**
   * Application metadata
   */
  app: {
    name: 'ZebaMail',
    description: 'AI-powered email marketing for Shopify',
    url: env.NEXT_PUBLIC_SITE_URL,
    version: process.env.npm_package_version || '0.0.0',
  },
  
  /**
   * API Configuration
   */
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL || env.NEXT_PUBLIC_SITE_URL,
    batchSize: isProduction ? 50 : 10,
    timeout: env.NEXT_PUBLIC_API_TIMEOUT,
    retries: env.NEXT_PUBLIC_API_RETRY_COUNT,
    retryDelay: isProduction ? 1000 : 500,
    rateLimitRequests: isProduction ? 100 : 1000,
    rateLimitWindow: 60 * 1000, // 1 minute
  },
  
  /**
   * Performance Configuration
   */
  performance: {
    enablePrefetch: isProduction,
    enableServiceWorker: isProduction && env.NEXT_PUBLIC_ENABLE_PWA,
    enableAnalytics: isProduction && env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    enableOptimisticUI: true,
    imageOptimization: {
      quality: isProduction ? 75 : 90,
      formats: ['image/webp', 'image/avif'] as const,
    },
    lazyLoadThreshold: 0.1, // Intersection observer threshold
  },
  
  /**
   * Cache Configuration
   */
  cache: {
    duration: env.NEXT_PUBLIC_CACHE_DURATION * 1000, // Convert to milliseconds
    staleWhileRevalidate: isProduction,
    maxSize: isProduction ? 1000 : 100,
    ttl: {
      short: 60 * 1000, // 1 minute
      medium: 5 * 60 * 1000, // 5 minutes
      long: 30 * 60 * 1000, // 30 minutes
      day: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  
  /**
   * Feature Flags
   */
  features: {
    analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    pwa: env.NEXT_PUBLIC_ENABLE_PWA,
    betaFeatures: env.NEXT_PUBLIC_ENABLE_BETA_FEATURES,
    debugMode: env.NEXT_PUBLIC_DEBUG_MODE,
    // Add more feature flags as needed
    aiAssistant: isProduction,
    advancedEditor: true,
    templateMarketplace: false,
    collaboration: false,
  },
  
  /**
   * Third-party Services
   */
  services: {
    supabase: {
      url: env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    },
    stripe: {
      publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      apiVersion: '2023-10-16' as const,
    },
    shopify: {
      appUrl: env.NEXT_PUBLIC_SHOPIFY_APP_URL,
      apiKey: env.SHOPIFY_API_KEY,
      apiSecret: env.SHOPIFY_API_SECRET,
      apiVersion: '2024-01' as const,
    },
  },
  
  /**
   * Logging Configuration
   */
  logging: {
    level: env.NEXT_PUBLIC_LOG_LEVEL,
    enableConsole: isDevelopment || env.NEXT_PUBLIC_DEBUG_MODE,
    enableRemote: isProduction && !env.NEXT_PUBLIC_DEBUG_MODE,
    sanitizeErrors: isProduction,
  },
  
  /**
   * Security Configuration
   */
  security: {
    enableCSP: isProduction,
    enableHSTS: isProduction,
    cookieSecure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
  },
} as const;

/**
 * Get a nested config value safely
 */
export function getConfig<T = any>(path: string, defaultValue?: T): T {
  const keys = path.split('.');
  let value: any = config;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return defaultValue as T;
    }
  }
  
  return value;
}

/**
 * Environment-specific logger
 */
export const logger = {
  error: (...args: any[]) => {
    if (config.logging.enableConsole) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (config.logging.enableConsole && ['warn', 'info', 'debug'].includes(config.logging.level)) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (config.logging.enableConsole && ['info', 'debug'].includes(config.logging.level)) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (config.logging.enableConsole && config.logging.level === 'debug') {
      console.debug(...args);
    }
  },
};

// Type exports
export type Environment = z.infer<typeof envSchema>;
export type Config = typeof config;