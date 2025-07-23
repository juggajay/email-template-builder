import { z } from 'zod';
import { config as envConfig } from './environment';

/**
 * Runtime configuration schema
 */
const runtimeConfigSchema = z.object({
  maintenance: z.object({
    enabled: z.boolean().default(false),
    message: z.string().optional(),
    allowedIPs: z.array(z.string()).default([]),
    endTime: z.string().datetime().optional(),
  }),
  
  rateLimit: z.object({
    api: z.object({
      requests: z.number().default(100),
      window: z.number().default(60000), // 1 minute
    }),
    auth: z.object({
      requests: z.number().default(5),
      window: z.number().default(900000), // 15 minutes
    }),
  }),
  
  performance: z.object({
    maxUploadSize: z.number().default(10 * 1024 * 1024), // 10MB
    maxBatchSize: z.number().default(50),
    requestTimeout: z.number().default(30000),
    slowQueryThreshold: z.number().default(1000),
  }),
  
  features: z.record(z.boolean()).default({}),
  
  alerts: z.object({
    errorThreshold: z.number().default(10),
    errorWindow: z.number().default(300000), // 5 minutes
    notificationEmail: z.string().email().optional(),
  }),
});

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema>;

/**
 * Runtime configuration manager
 */
class RuntimeConfigManager {
  private config: RuntimeConfig;
  private listeners: Set<(config: RuntimeConfig) => void> = new Set();
  private fetchInterval: NodeJS.Timeout | null = null;
  
  constructor() {
    // Initialize with defaults
    this.config = runtimeConfigSchema.parse({});
    
    // Start periodic fetch in production
    if (envConfig.app.url.includes('zebamail.com')) {
      this.startPeriodicFetch();
    }
  }
  
  /**
   * Get current runtime configuration
   */
  get(): RuntimeConfig {
    return { ...this.config };
  }
  
  /**
   * Get a specific configuration value
   */
  getValue<K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K] {
    return this.config[key];
  }
  
  /**
   * Update runtime configuration
   */
  async update(updates: Partial<RuntimeConfig>): Promise<void> {
    try {
      // Validate updates
      const validated = runtimeConfigSchema.partial().parse(updates);
      
      // Merge with existing config
      this.config = {
        ...this.config,
        ...validated,
      };
      
      // Notify listeners
      this.notifyListeners();
      
      // Persist to storage
      await this.persist();
    } catch (error) {
      console.error('Failed to update runtime config:', error);
      throw error;
    }
  }
  
  /**
   * Fetch configuration from remote source
   */
  async fetchRemote(): Promise<void> {
    try {
      const response = await fetch(`${envConfig.api.baseUrl}/api/config/runtime`, {
        headers: {
          'x-api-key': process.env.RUNTIME_CONFIG_API_KEY || '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch runtime config: ${response.statusText}`);
      }
      
      const data = await response.json();
      const validated = runtimeConfigSchema.parse(data);
      
      // Update config
      this.config = validated;
      this.notifyListeners();
      
      // Persist locally
      await this.persist();
    } catch (error) {
      console.error('Failed to fetch runtime config:', error);
      // Fall back to local config
      await this.loadLocal();
    }
  }
  
  /**
   * Subscribe to configuration changes
   */
  subscribe(listener: (config: RuntimeConfig) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.get());
      } catch (error) {
        console.error('Error in runtime config listener:', error);
      }
    });
  }
  
  /**
   * Persist configuration to local storage
   */
  private async persist(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('runtime-config', JSON.stringify(this.config));
      localStorage.setItem('runtime-config-timestamp', Date.now().toString());
    } catch (error) {
      console.error('Failed to persist runtime config:', error);
    }
  }
  
  /**
   * Load configuration from local storage
   */
  private async loadLocal(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('runtime-config');
      const timestamp = localStorage.getItem('runtime-config-timestamp');
      
      if (stored && timestamp) {
        const age = Date.now() - parseInt(timestamp, 10);
        
        // Use local config if less than 1 hour old
        if (age < 60 * 60 * 1000) {
          const parsed = JSON.parse(stored);
          this.config = runtimeConfigSchema.parse(parsed);
          this.notifyListeners();
        }
      }
    } catch (error) {
      console.error('Failed to load local runtime config:', error);
    }
  }
  
  /**
   * Start periodic configuration fetch
   */
  private startPeriodicFetch(): void {
    // Fetch every 5 minutes
    this.fetchInterval = setInterval(() => {
      this.fetchRemote();
    }, 5 * 60 * 1000);
    
    // Initial fetch
    this.fetchRemote();
  }
  
  /**
   * Stop periodic configuration fetch
   */
  stopPeriodicFetch(): void {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
      this.fetchInterval = null;
    }
  }
  
  /**
   * Check if maintenance mode is active
   */
  isMaintenanceMode(clientIP?: string): boolean {
    const maintenance = this.config.maintenance;
    
    if (!maintenance.enabled) return false;
    
    // Check if client IP is allowed
    if (clientIP && maintenance.allowedIPs.includes(clientIP)) {
      return false;
    }
    
    // Check if maintenance has ended
    if (maintenance.endTime) {
      const endTime = new Date(maintenance.endTime);
      if (new Date() > endTime) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get rate limit configuration for a specific endpoint
   */
  getRateLimit(endpoint: 'api' | 'auth'): { requests: number; window: number } {
    return this.config.rateLimit[endpoint];
  }
}

// Global instance
export const runtimeConfig = new RuntimeConfigManager();

/**
 * React hook for runtime configuration
 */
export function useRuntimeConfig(): RuntimeConfig;
export function useRuntimeConfig<K extends keyof RuntimeConfig>(key: K): RuntimeConfig[K];
export function useRuntimeConfig<K extends keyof RuntimeConfig>(
  key?: K
): RuntimeConfig | RuntimeConfig[K] {
  const [config, setConfig] = React.useState(() => 
    key ? runtimeConfig.getValue(key) : runtimeConfig.get()
  );
  
  React.useEffect(() => {
    // Subscribe to changes
    const unsubscribe = runtimeConfig.subscribe((newConfig) => {
      setConfig(key ? newConfig[key] : newConfig);
    });
    
    return unsubscribe;
  }, [key]);
  
  return config;
}

// Import React for hooks
import React from 'react';

/**
 * HOC for maintenance mode
 */
export function withMaintenanceMode<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function MaintenanceModeWrapper(props: P) {
    const maintenance = useRuntimeConfig('maintenance');
    
    if (maintenance.enabled) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <h1 className="text-2xl font-bold mb-4">Maintenance Mode</h1>
            <p className="text-gray-600 mb-4">
              {maintenance.message || 'We are currently performing maintenance. Please check back later.'}
            </p>
            {maintenance.endTime && (
              <p className="text-sm text-gray-500">
                Expected completion: {new Date(maintenance.endTime).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
}

/**
 * Utility to check runtime feature flags
 */
export function isRuntimeFeatureEnabled(feature: string): boolean {
  const features = runtimeConfig.getValue('features');
  return features[feature] || false;
}