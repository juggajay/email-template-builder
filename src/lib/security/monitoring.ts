/**
 * Security Monitoring and Logging
 * Tracks security events and potential threats
 */

import { createClient } from '@/lib/supabase/server';

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_RESET = 'PASSWORD_RESET',
  
  // Authorization events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  
  // Rate limiting events
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Security threats
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  POTENTIAL_ATTACK = 'POTENTIAL_ATTACK',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // API events
  API_KEY_CREATED = 'API_KEY_CREATED',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  WEBHOOK_FAILURE = 'WEBHOOK_FAILURE',
  
  // Data events
  DATA_EXPORT = 'DATA_EXPORT',
  BULK_OPERATION = 'BULK_OPERATION',
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS'
}

export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  result?: 'success' | 'failure';
  metadata?: Record<string, any>;
  timestamp?: Date;
}

// Security event severity levels
const eventSeverity: Record<SecurityEventType, 'info' | 'warning' | 'critical'> = {
  [SecurityEventType.LOGIN_SUCCESS]: 'info',
  [SecurityEventType.LOGIN_FAILURE]: 'warning',
  [SecurityEventType.LOGOUT]: 'info',
  [SecurityEventType.PASSWORD_RESET]: 'info',
  [SecurityEventType.UNAUTHORIZED_ACCESS]: 'warning',
  [SecurityEventType.PERMISSION_DENIED]: 'warning',
  [SecurityEventType.RATE_LIMIT_EXCEEDED]: 'warning',
  [SecurityEventType.SUSPICIOUS_ACTIVITY]: 'critical',
  [SecurityEventType.POTENTIAL_ATTACK]: 'critical',
  [SecurityEventType.INVALID_INPUT]: 'warning',
  [SecurityEventType.API_KEY_CREATED]: 'info',
  [SecurityEventType.API_KEY_REVOKED]: 'info',
  [SecurityEventType.WEBHOOK_FAILURE]: 'warning',
  [SecurityEventType.DATA_EXPORT]: 'info',
  [SecurityEventType.BULK_OPERATION]: 'info',
  [SecurityEventType.SENSITIVE_DATA_ACCESS]: 'warning'
};

// Track failed login attempts
const failedLoginAttempts = new Map<string, number>();

export async function logSecurityEvent(event: SecurityEvent) {
  const severity = eventSeverity[event.type] || 'info';
  
  // Add timestamp if not provided
  if (!event.timestamp) {
    event.timestamp = new Date();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SECURITY-${severity.toUpperCase()}]`, event);
  }

  // Store in database
  try {
    const supabase = createClient();
    await supabase.from('security_logs').insert({
      event_type: event.type,
      severity,
      user_id: event.userId,
      ip_address: event.ip,
      user_agent: event.userAgent,
      resource: event.resource,
      action: event.action,
      result: event.result,
      metadata: event.metadata,
      created_at: event.timestamp
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }

  // Check for security threats
  await checkSecurityThreats(event);
}

async function checkSecurityThreats(event: SecurityEvent) {
  // Check for brute force attacks
  if (event.type === SecurityEventType.LOGIN_FAILURE && event.ip) {
    const attempts = failedLoginAttempts.get(event.ip) || 0;
    failedLoginAttempts.set(event.ip, attempts + 1);

    if (attempts > 5) {
      await logSecurityEvent({
        type: SecurityEventType.POTENTIAL_ATTACK,
        ip: event.ip,
        metadata: { 
          reason: 'Multiple failed login attempts',
          attempts: attempts + 1
        }
      });
    }
  }

  // Reset counter on successful login
  if (event.type === SecurityEventType.LOGIN_SUCCESS && event.ip) {
    failedLoginAttempts.delete(event.ip);
  }

  // Check for suspicious patterns
  if (event.type === SecurityEventType.RATE_LIMIT_EXCEEDED) {
    const supabase = createClient();
    
    // Count rate limit violations in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { count } = await supabase
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', event.ip)
      .eq('event_type', SecurityEventType.RATE_LIMIT_EXCEEDED)
      .gte('created_at', oneHourAgo.toISOString());

    if (count && count > 10) {
      await logSecurityEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        ip: event.ip,
        metadata: { 
          reason: 'Excessive rate limit violations',
          violations: count
        }
      });
    }
  }
}

// Extract request metadata for logging
export function extractRequestMetadata(request: Request): {
  ip?: string;
  userAgent?: string;
  referer?: string;
  method?: string;
  path?: string;
} {
  const headers = request.headers;
  const url = new URL(request.url);

  return {
    ip: headers.get('x-forwarded-for')?.split(',')[0] || 
        headers.get('x-real-ip') || 
        undefined,
    userAgent: headers.get('user-agent') || undefined,
    referer: headers.get('referer') || undefined,
    method: request.method,
    path: url.pathname
  };
}

// Security metrics for monitoring
export async function getSecurityMetrics(timeRange: 'hour' | 'day' | 'week' | 'month' = 'day') {
  const supabase = createClient();
  
  const timeRanges = {
    hour: new Date(Date.now() - 60 * 60 * 1000),
    day: new Date(Date.now() - 24 * 60 * 60 * 1000),
    week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  };

  const since = timeRanges[timeRange];

  // Get event counts by type
  const { data: eventCounts } = await supabase
    .from('security_logs')
    .select('event_type')
    .gte('created_at', since.toISOString());

  // Get events by severity
  const { data: severityCounts } = await supabase
    .from('security_logs')
    .select('severity')
    .gte('created_at', since.toISOString());

  // Get top IPs with security events
  const { data: topIps } = await supabase
    .from('security_logs')
    .select('ip_address')
    .gte('created_at', since.toISOString())
    .not('ip_address', 'is', null);

  return {
    timeRange,
    since,
    eventCounts: countByProperty(eventCounts || [], 'event_type'),
    severityCounts: countByProperty(severityCounts || [], 'severity'),
    topIps: getTopItems(topIps || [], 'ip_address', 10)
  };
}

function countByProperty<T>(items: T[], property: keyof T): Record<string, number> {
  return items.reduce((acc, item) => {
    const key = String(item[property]);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function getTopItems<T>(items: T[], property: keyof T, limit: number): Array<{ value: string; count: number }> {
  const counts = countByProperty(items, property);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }));
}

// Clean up old security logs
export async function cleanupSecurityLogs(daysToKeep: number = 90) {
  const supabase = createClient();
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from('security_logs')
    .delete()
    .lt('created_at', cutoffDate.toISOString());

  if (error) {
    console.error('Failed to cleanup security logs:', error);
  }
}