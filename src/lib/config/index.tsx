/**
 * Unified configuration module
 * 
 * This module exports all configuration related utilities and constants
 */

// Import React for components
import React from 'react';

// Environment configuration
export {
  config,
  env,
  isDevelopment,
  isProduction,
  isTest,
  isServer,
  isClient,
  getConfig,
  logger,
  type Environment,
  type Config,
} from './environment';

// Feature flags
export {
  FEATURE_FLAGS,
  featureFlags,
  useFeatureFlag,
  useFeatureFlags,
  FeatureFlag,
  type FeatureFlag as FeatureFlagType,
} from './feature-flags';

// Runtime configuration
export {
  runtimeConfig,
  useRuntimeConfig,
  withMaintenanceMode,
  isRuntimeFeatureEnabled,
  type RuntimeConfig,
} from './runtime-config';

// Import the needed functions and types
import { FEATURE_FLAGS, featureFlags, useFeatureFlags, type FeatureFlag as FeatureFlagType } from './feature-flags';
import { runtimeConfig, useRuntimeConfig, type RuntimeConfig } from './runtime-config';
import { config, isDevelopment } from './environment';

/**
 * Combined configuration hook
 * Provides access to all configuration sources
 */
export function useAppConfig() {
  const runtimeConf = useRuntimeConfig();
  const flags = useFeatureFlags(
    ...Object.values(FEATURE_FLAGS) as FeatureFlagType[]
  );
  
  return {
    env: config,
    runtime: runtimeConf,
    features: flags,
    
    // Helper methods
    isFeatureEnabled: (flag: FeatureFlagType) => flags[flag] || false,
    isMaintenanceMode: () => runtimeConf.maintenance.enabled,
    getRateLimit: (endpoint: 'api' | 'auth') => runtimeConf.rateLimit[endpoint],
  };
}

/**
 * Configuration provider for React apps
 */
export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = React.useState(false);
  
  React.useEffect(() => {
    // Initialize configurations
    const init = async () => {
      try {
        // Load runtime config
        await runtimeConfig.fetchRemote();
        
        // Load feature flags
        const user = await getCurrentUser();
        if (user && user.id) {
          await featureFlags.fetchRemoteFlags(user.id);
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize configuration:', error);
        // Continue with defaults
        setIsReady(true);
      }
    };
    
    init();
  }, []);
  
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <>{children}</>;
}

/**
 * Server-side configuration loader
 * Use this in API routes and server components
 */
export async function loadServerConfig() {
  // In server context, we might load from different sources
  // For now, return the static config
  return {
    env: config,
    runtime: runtimeConfig.get(),
    features: featureFlags.getAllFlags(),
  };
}

/**
 * Configuration debugging component
 * Only renders in development mode
 */
export function ConfigDebugger() {
  if (!isDevelopment) return null;
  
  const appConfig = useAppConfig();
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-3 py-1 rounded text-sm"
      >
        Config Debug
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-96 max-h-96 overflow-auto bg-white border rounded shadow-lg p-4">
          <h3 className="font-bold mb-2">Configuration</h3>
          
          <details className="mb-2">
            <summary className="cursor-pointer font-medium">Environment</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(appConfig.env, null, 2)}
            </pre>
          </details>
          
          <details className="mb-2">
            <summary className="cursor-pointer font-medium">Runtime</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(appConfig.runtime, null, 2)}
            </pre>
          </details>
          
          <details>
            <summary className="cursor-pointer font-medium">Feature Flags</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(appConfig.features, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}

// Mock function - replace with actual implementation
async function getCurrentUser(): Promise<{ id: string } | null> {
  // This should be replaced with your actual user fetching logic
  return null;
}