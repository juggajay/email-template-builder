/**
 * Input Validation and Sanitization Utilities
 * Provides comprehensive validation for all user inputs
 */

import { z } from 'zod';

// Email validation schema
export const emailSchema = z.string().email('Invalid email address').min(3).max(255);

// Common validation schemas
export const schemas = {
  // User input schemas
  email: emailSchema,
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  
  // Template schemas
  templateName: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name must be less than 100 characters')
    .regex(/^[^<>]+$/, 'Template name cannot contain < or > characters'),
  
  templateHtml: z.string()
    .min(1, 'Template HTML is required')
    .max(1000000, 'Template HTML must be less than 1MB'),
  
  // API key schema
  apiKey: z.string()
    .regex(/^[a-zA-Z0-9_-]{20,}$/, 'Invalid API key format'),
  
  // URL schema
  url: z.string().url('Invalid URL format').max(2048, 'URL too long'),
  
  // Shopify domain schema
  shopifyDomain: z.string()
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/, 'Invalid Shopify domain format'),
  
  // UUID schema
  uuid: z.string().uuid('Invalid ID format'),
  
  // Pagination schemas
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  page: z.coerce.number().int().min(1).default(1),
  
  // Search query
  searchQuery: z.string().max(100).optional(),
  
  // Date schemas
  date: z.string().datetime('Invalid date format'),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }).refine(data => new Date(data.start) <= new Date(data.end), {
    message: 'Start date must be before end date'
  })
};

// HTML Sanitization
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// SQL injection prevention
export function escapeSql(input: string): string {
  if (typeof input !== 'string') return '';
  return input.replace(/['";\\]/g, '\\$&');
}

// XSS prevention
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
}

// Validate and sanitize request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { data: validated, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        data: null, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { data: null, error: 'Invalid request body' };
  }
}

// Validate query parameters
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data: T | null; error: string | null } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const validated = schema.parse(params);
    return { data: validated, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { 
        data: null, 
        error: `${firstError.path.join('.')}: ${firstError.message}` 
      };
    }
    return { data: null, error: 'Invalid query parameters' };
  }
}

// File upload validation
export const fileValidation = {
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  },
  document: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['.pdf', '.doc', '.docx']
  },
  csv: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['text/csv', 'application/csv'],
    allowedExtensions: ['.csv']
  }
};

export function validateFile(
  file: File,
  type: keyof typeof fileValidation
): { valid: boolean; error?: string } {
  const rules = fileValidation[type];
  
  // Check file size
  if (file.size > rules.maxSize) {
    return { 
      valid: false, 
      error: `File size must be less than ${rules.maxSize / 1024 / 1024}MB` 
    };
  }
  
  // Check file type
  if (!rules.allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type must be one of: ${rules.allowedTypes.join(', ')}` 
    };
  }
  
  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!rules.allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: `File extension must be one of: ${rules.allowedExtensions.join(', ')}` 
    };
  }
  
  return { valid: true };
}

// Rate limit validation for user inputs
export function validateRateLimit(value: string, maxLength: number = 1000): string {
  if (value.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  return value;
}

// Validate environment variables
export function validateEnvVar(name: string, required: boolean = true): string | undefined {
  const value = process.env[name];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}