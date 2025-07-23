import { config } from './environment';
import { createClient } from '@/lib/supabase/client';

/**
 * Feature flag definitions
 */
export const FEATURE_FLAGS = {
  // Core features
  AI_ASSISTANT: 'ai_assistant',
  ADVANCED_EDITOR: 'advanced_editor',
  TEMPLATE_MARKETPLACE: 'template_marketplace',
  COLLABORATION: 'collaboration',
  
  // Beta features
  BETA_UI: 'beta_ui',
  BETA_ANALYTICS: 'beta_analytics',
  BETA_AUTOMATION: 'beta_automation',
  
  // Performance features
  VIRTUAL_SCROLLING: 'virtual_scrolling',
  PROGRESSIVE_IMAGES: 'progressive_images',
  WORKER_THREADS: 'worker_threads',
  
  // Experimental
  EXPERIMENTAL_CACHE: 'experimental_cache',
  EXPERIMENTAL_BUILD: 'experimental_build',
} as const;

export type FeatureFlag = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

/**
 * Feature flag storage interface
 */
interface FeatureFlagStore {
  flags: Map<string, boolean>;
  userOverrides: Map<string, boolean>;
  lastFetch: number;
}

/**
 * In-memory feature flag store
 */
class FeatureFlagManager {
  private store: FeatureFlagStore = {
    flags: new Map(),
    userOverrides: new Map(),
    lastFetch: 0,
  };
  
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    // Initialize with config defaults
    this.initializeDefaults();
    
    // Load user overrides from localStorage
    if (typeof window !== 'undefined') {
      this.loadUserOverrides();
    }
  }
  
  /**
   * Initialize with default flags from config
   */
  private initializeDefaults() {
    this.store.flags.set(FEATURE_FLAGS.AI_ASSISTANT, config.features.aiAssistant);
    this.store.flags.set(FEATURE_FLAGS.ADVANCED_EDITOR, config.features.advancedEditor);
    this.store.flags.set(FEATURE_FLAGS.TEMPLATE_MARKETPLACE, config.features.templateMarketplace);
    this.store.flags.set(FEATURE_FLAGS.COLLABORATION, config.features.collaboration);
    this.store.flags.set(FEATURE_FLAGS.BETA_UI, config.features.betaFeatures);
    this.store.flags.set(FEATURE_FLAGS.VIRTUAL_SCROLLING, true);
    this.store.flags.set(FEATURE_FLAGS.PROGRESSIVE_IMAGES, true);
  }
  
  /**
   * Load user overrides from localStorage
   */
  private loadUserOverrides() {
    try {
      const stored = localStorage.getItem('feature-flags-overrides');
      if (stored) {
        const overrides = JSON.parse(stored);
        Object.entries(overrides).forEach(([flag, enabled]) => {
          this.store.userOverrides.set(flag, enabled as boolean);
        });
      }
    } catch (error) {
      console.error('Failed to load feature flag overrides:', error);
    }
  }
  
  /**
   * Save user overrides to localStorage
   */
  private saveUserOverrides() {
    if (typeof window === 'undefined') return;
    
    try {
      const overrides = Object.fromEntries(this.store.userOverrides);
      localStorage.setItem('feature-flags-overrides', JSON.stringify(overrides));
    } catch (error) {
      console.error('Failed to save feature flag overrides:', error);
    }
  }
  
  /**
   * Fetch feature flags from remote source
   */
  async fetchRemoteFlags(userId?: string): Promise<void> {
    const now = Date.now();
    
    // Skip if recently fetched
    if (now - this.store.lastFetch < this.CACHE_DURATION) {
      return;
    }
    
    try {
      const supabase = createClient();
      
      // Fetch global feature flags
      const { data: globalFlags } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('enabled', true)
        .or('target_type.eq.all,target_type.is.null');
        
      if (globalFlags) {
        globalFlags.forEach((flag: any) => {
          this.store.flags.set(flag.flag_name, flag.enabled);
        });
      }
      
      // Fetch user-specific flags if userId provided
      if (userId) {
        const { data: userFlags } = await supabase
          .from('feature_flags')
          .select('*')
          .eq('enabled', true)
          .or(`target_type.eq.user,target_users.cs.{${userId}}`);
          
        if (userFlags) {
          userFlags.forEach((flag: any) => {
            this.store.flags.set(flag.flag_name, flag.enabled);
          });
        }
      }
      
      this.store.lastFetch = now;
    } catch (error) {
      console.error('Failed to fetch remote feature flags:', error);
    }
  }
  
  /**
   * Check if a feature flag is enabled
   */
  isEnabled(flag: FeatureFlag, userId?: string): boolean {
    // Check user override first
    if (this.store.userOverrides.has(flag)) {
      return this.store.userOverrides.get(flag)!;
    }
    
    // Check fetched/default flags
    return this.store.flags.get(flag) || false;
  }
  
  /**
   * Set user override for a feature flag
   */
  setOverride(flag: FeatureFlag, enabled: boolean): void {
    this.store.userOverrides.set(flag, enabled);
    this.saveUserOverrides();
  }
  
  /**
   * Clear user override for a feature flag
   */
  clearOverride(flag: FeatureFlag): void {
    this.store.userOverrides.delete(flag);
    this.saveUserOverrides();
  }
  
  /**
   * Clear all user overrides
   */
  clearAllOverrides(): void {
    this.store.userOverrides.clear();
    this.saveUserOverrides();
  }
  
  /**
   * Get all feature flags with their current states
   */
  getAllFlags(): Record<string, boolean> {
    const allFlags: Record<string, boolean> = {};
    
    // Start with default flags
    this.store.flags.forEach((enabled, flag) => {
      allFlags[flag] = enabled;
    });
    
    // Apply overrides
    this.store.userOverrides.forEach((enabled, flag) => {
      allFlags[flag] = enabled;
    });
    
    return allFlags;
  }
  
  /**
   * Check multiple flags at once
   */
  areEnabled(...flags: FeatureFlag[]): boolean {
    return flags.every(flag => this.isEnabled(flag));
  }
  
  /**
   * Check if any of the flags are enabled
   */
  anyEnabled(...flags: FeatureFlag[]): boolean {
    return flags.some(flag => this.isEnabled(flag));
  }
}

// Global instance
export const featureFlags = new FeatureFlagManager();

/**
 * React hook for feature flags
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [enabled, setEnabled] = React.useState(() => featureFlags.isEnabled(flag));
  
  React.useEffect(() => {
    // Re-check on mount in case flags were updated
    setEnabled(featureFlags.isEnabled(flag));
    
    // Listen for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'feature-flags-overrides') {
        setEnabled(featureFlags.isEnabled(flag));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [flag]);
  
  return enabled;
}

/**
 * React hook for multiple feature flags
 */
export function useFeatureFlags(...flags: FeatureFlag[]): Record<FeatureFlag, boolean> {
  const [states, setStates] = React.useState(() => {
    const initial: Record<string, boolean> = {};
    flags.forEach(flag => {
      initial[flag] = featureFlags.isEnabled(flag);
    });
    return initial;
  });
  
  React.useEffect(() => {
    // Re-check on mount
    const newStates: Record<string, boolean> = {};
    flags.forEach(flag => {
      newStates[flag] = featureFlags.isEnabled(flag);
    });
    setStates(newStates);
    
    // Listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'feature-flags-overrides') {
        const updatedStates: Record<string, boolean> = {};
        flags.forEach(flag => {
          updatedStates[flag] = featureFlags.isEnabled(flag);
        });
        setStates(updatedStates);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [flags.join(',')]);
  
  return states as Record<FeatureFlag, boolean>;
}

// Import React for hooks
import React from 'react';

/**
 * Component for conditionally rendering based on feature flags
 */
export function FeatureFlag({ 
  flag, 
  children, 
  fallback = null 
}: { 
  flag: FeatureFlag | FeatureFlag[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const flags = Array.isArray(flag) ? flag : [flag];
  const enabled = flags.every(f => featureFlags.isEnabled(f));
  
  return <>{enabled ? children : fallback}</>;
}