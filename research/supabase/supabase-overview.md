# Supabase Overview for Email Template Builder

## Introduction
Supabase is an open-source Firebase alternative that provides a complete backend solution with PostgreSQL database, authentication, real-time subscriptions, and file storage. This document provides a comprehensive overview tailored for building an email template builder application.

## Core Components

### 1. Database Setup and Schema Design

#### PostgreSQL Foundation
- Full PostgreSQL database with "postgres" level access
- Managed database backups (Note: backups don't include Storage API objects)
- Spreadsheet-like table view for easy management
- Integrated SQL Editor with query saving capabilities

#### Best Practices for Schema Design
- Use lowercase with underscores for table names (e.g., `email_templates`)
- Every table should have a primary key
- Choose appropriate data types (bigint, text, uuid, timestamp, jsonb)
- Plan relationships carefully using foreign keys

#### Recommended Schema for Email Template Builder

```sql
-- Users table (managed by Supabase Auth)
-- This is automatically created when you enable Auth

-- Email templates table
CREATE TABLE email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  json_content JSONB, -- For storing template structure/blocks
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template categories
CREATE TABLE template_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template to category relationship
CREATE TABLE template_category_mappings (
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  category_id UUID REFERENCES template_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, category_id)
);

-- Template variables for personalization
CREATE TABLE template_variables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  variable_name TEXT NOT NULL,
  default_value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared templates
CREATE TABLE shared_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'edit')) DEFAULT 'view',
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, shared_with_user_id)
);

-- Template usage analytics
CREATE TABLE template_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT CHECK (action IN ('view', 'edit', 'duplicate', 'send')),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Authentication System

#### Available Methods
- Email/Password authentication
- Magic links (passwordless)
- OAuth providers (Google, GitHub, etc.)
- Phone authentication (OTP)
- Anonymous sign-ins
- Single Sign-On (SSO)

#### Implementation with TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Sign up new user
const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // Custom user metadata
        full_name: 'John Doe',
        company: 'Acme Corp'
      }
    }
  })
  return { data, error }
}

// Sign in with email/password
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

// Sign in with OAuth
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

// Sign out
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

### 3. Row Level Security (RLS)

RLS provides granular authorization rules at the database level, ensuring users can only access their own data.

#### Enable RLS on Tables

```sql
-- Enable RLS on email_templates table
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own templates
CREATE POLICY "Users can view own templates" ON email_templates
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert own templates" ON email_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates" ON email_templates
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON email_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Policy: Users can view public templates
CREATE POLICY "Anyone can view public templates" ON email_templates
  FOR SELECT USING (is_public = true);

-- Policy for shared templates
CREATE POLICY "Users can view shared templates" ON email_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_templates
      WHERE shared_templates.template_id = email_templates.id
      AND shared_templates.shared_with_user_id = auth.uid()
    )
  );
```

#### Performance Optimization for RLS
- Add indexes on columns used in policies:
```sql
CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX idx_email_templates_is_public ON email_templates(is_public);
CREATE INDEX idx_shared_templates_shared_with ON shared_templates(shared_with_user_id);
```

### 4. Real-time Subscriptions

Real-time functionality allows users to see live updates when templates are modified or shared.

#### TypeScript Implementation

```typescript
// Subscribe to template changes
const subscribeToTemplateChanges = (userId: string) => {
  const subscription = supabase
    .channel('template-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'email_templates',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Template change:', payload)
        // Handle the change (update UI, show notification, etc.)
      }
    )
    .subscribe()

  return subscription
}

// Broadcast presence (show who's editing)
const broadcastPresence = (templateId: string, userName: string) => {
  const channel = supabase.channel(`template:${templateId}`)
  
  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      console.log('Users currently editing:', state)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', leftPresences)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user: userName,
          online_at: new Date().toISOString()
        })
      }
    })

  return channel
}

// Broadcast custom events (e.g., cursor position)
const broadcastCursorPosition = (templateId: string, position: { x: number, y: number }) => {
  const channel = supabase.channel(`template:${templateId}`)
  
  channel.send({
    type: 'broadcast',
    event: 'cursor-move',
    payload: { position }
  })
}
```

### 5. Storage for Images

Supabase Storage is perfect for handling template thumbnails, embedded images, and other assets.

#### Storage Setup and Usage

```typescript
// Create storage buckets (one-time setup)
const createStorageBuckets = async () => {
  // Public bucket for template thumbnails
  await supabase.storage.createBucket('template-thumbnails', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
  })

  // Private bucket for user uploads
  await supabase.storage.createBucket('template-assets', {
    public: false,
    fileSizeLimit: 10485760 // 10MB
  })
}

// Upload template thumbnail
const uploadThumbnail = async (templateId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${templateId}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('template-thumbnails')
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('template-thumbnails')
    .getPublicUrl(fileName)

  return publicUrl
}

// Upload template asset with image optimization
const uploadTemplateAsset = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from('template-assets')
    .upload(fileName, file)

  if (error) throw error

  // Generate optimized URL with transformations
  const { data: signedUrl } = await supabase.storage
    .from('template-assets')
    .createSignedUrl(fileName, 3600, {
      transform: {
        width: 800,
        height: 600,
        resize: 'contain',
        format: 'webp'
      }
    })

  return signedUrl
}

// Delete asset
const deleteAsset = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
    
  if (error) throw error
}
```

#### Storage RLS Policies

```sql
-- Allow users to upload their own assets
CREATE POLICY "Users can upload own assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'template-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to view their own assets
CREATE POLICY "Users can view own assets" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'template-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own assets
CREATE POLICY "Users can delete own assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'template-assets' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Public access to thumbnails
CREATE POLICY "Anyone can view thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'template-thumbnails');
```

### 6. TypeScript Client Usage

#### Installation and Setup

```bash
npm install @supabase/supabase-js
```

#### Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -D supabase

# Login and generate types
npx supabase login
npx supabase gen types typescript --project-id "your-project-ref" > database.types.ts
```

#### Complete TypeScript Client Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: { 'x-application-name': 'email-template-builder' }
    }
  }
)

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Example usage with types
export type EmailTemplate = Tables<'email_templates'>
export type NewEmailTemplate = InsertTables<'email_templates'>
export type UpdateEmailTemplate = UpdateTables<'email_templates'>
```

#### CRUD Operations with TypeScript

```typescript
// services/templates.service.ts
import { supabase, EmailTemplate, NewEmailTemplate, UpdateEmailTemplate } from '@/lib/supabase'

export class TemplateService {
  // Create template
  static async createTemplate(template: NewEmailTemplate): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert(template)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get user templates
  static async getUserTemplates(userId: string): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get template by ID
  static async getTemplate(templateId: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (error) throw error
    return data
  }

  // Update template
  static async updateTemplate(
    templateId: string, 
    updates: UpdateEmailTemplate
  ): Promise<EmailTemplate> {
    const { data, error } = await supabase
      .from('email_templates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', templateId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Delete template
  static async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', templateId)

    if (error) throw error
  }

  // Search templates
  static async searchTemplates(query: string, userId: string): Promise<EmailTemplate[]> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) throw error
    return data || []
  }

  // Get public templates
  static async getPublicTemplates(
    categoryId?: string, 
    limit: number = 20
  ): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select(`
        *,
        template_category_mappings!inner (
          category_id
        )
      `)
      .eq('is_public', true)

    if (categoryId) {
      query = query.eq('template_category_mappings.category_id', categoryId)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }
}
```

## Advanced Features and Best Practices

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_templates_updated_at ON email_templates(updated_at DESC);
CREATE INDEX idx_templates_public ON email_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_template_search ON email_templates USING gin(to_tsvector('english', name || ' ' || subject));

-- Full-text search function
CREATE OR REPLACE FUNCTION search_templates(search_query TEXT, user_uuid UUID)
RETURNS SETOF email_templates AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM email_templates
  WHERE (user_id = user_uuid OR is_public = true)
    AND to_tsvector('english', name || ' ' || subject) @@ plainto_tsquery('english', search_query)
  ORDER BY ts_rank(to_tsvector('english', name || ' ' || subject), plainto_tsquery('english', search_query)) DESC;
END;
$$ LANGUAGE plpgsql;
```

### 2. Error Handling and Retry Logic

```typescript
// utils/supabase-helpers.ts
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
  }

  throw lastError!
}

// Usage example
const template = await withRetry(() => 
  TemplateService.getTemplate(templateId)
)
```

### 3. Batch Operations

```typescript
// Batch insert templates
const batchInsertTemplates = async (templates: NewEmailTemplate[]) => {
  const { data, error } = await supabase
    .from('email_templates')
    .insert(templates)
    .select()

  if (error) throw error
  return data
}

// Batch update with transaction-like behavior
const batchUpdateWithRollback = async (updates: Array<{ id: string; data: UpdateEmailTemplate }>) => {
  const originalData: EmailTemplate[] = []
  
  try {
    // Get original data for rollback
    for (const update of updates) {
      const original = await TemplateService.getTemplate(update.id)
      if (original) originalData.push(original)
    }

    // Perform updates
    const results = []
    for (const update of updates) {
      const result = await TemplateService.updateTemplate(update.id, update.data)
      results.push(result)
    }

    return results
  } catch (error) {
    // Rollback on error
    for (const original of originalData) {
      await TemplateService.updateTemplate(original.id, original)
    }
    throw error
  }
}
```

### 4. Caching Strategy

```typescript
// Simple in-memory cache for templates
class TemplateCache {
  private cache = new Map<string, { data: EmailTemplate; timestamp: number }>()
  private readonly TTL = 5 * 60 * 1000 // 5 minutes

  get(id: string): EmailTemplate | null {
    const cached = this.cache.get(id)
    if (!cached) return null

    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(id)
      return null
    }

    return cached.data
  }

  set(id: string, data: EmailTemplate): void {
    this.cache.set(id, { data, timestamp: Date.now() })
  }

  invalidate(id: string): void {
    this.cache.delete(id)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const templateCache = new TemplateCache()
```

### 5. Security Best Practices

1. **Environment Variables**: Never expose your service role key in client-side code
2. **RLS Policies**: Always enable RLS on tables exposed to the client
3. **Input Validation**: Validate all user inputs before database operations
4. **Rate Limiting**: Implement rate limiting for API-heavy operations
5. **Audit Logging**: Track important operations in the template_analytics table

### 6. Migration Strategy

```sql
-- migrations/001_initial_schema.sql
BEGIN;

-- Create all tables
CREATE TABLE IF NOT EXISTS email_templates (...);
CREATE TABLE IF NOT EXISTS template_categories (...);
-- ... other tables

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
-- ... other RLS enables

-- Create policies
CREATE POLICY "Users can view own templates" ON email_templates ...;
-- ... other policies

-- Create indexes
CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
-- ... other indexes

COMMIT;
```

## Deployment Considerations

### Environment Setup

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server-side only!
```

### Edge Functions for Complex Operations

```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { templateId, recipients, variables } = await req.json()
  
  // Create Supabase client with service role key
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get template
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  // Process and send emails
  // ... email sending logic

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## Monitoring and Analytics

```typescript
// Track template usage
const trackTemplateUsage = async (
  templateId: string,
  userId: string,
  action: 'view' | 'edit' | 'duplicate' | 'send',
  metadata?: Record<string, any>
) => {
  await supabase
    .from('template_analytics')
    .insert({
      template_id: templateId,
      user_id: userId,
      action,
      metadata
    })
}

// Get template analytics
const getTemplateAnalytics = async (templateId: string) => {
  const { data } = await supabase
    .from('template_analytics')
    .select('action, count(*)')
    .eq('template_id', templateId)
    .group('action')

  return data
}
```

## Conclusion

This comprehensive overview provides all the necessary information to build a robust email template builder using Supabase. The combination of PostgreSQL, real-time subscriptions, authentication, storage, and TypeScript support makes Supabase an excellent choice for this type of application. Remember to:

1. Enable RLS on all client-exposed tables
2. Use TypeScript types for type safety
3. Implement proper error handling and retry logic
4. Optimize database queries with appropriate indexes
5. Use real-time features for collaborative editing
6. Leverage storage for efficient image handling
7. Monitor usage with analytics

For the latest updates and more detailed information, always refer to the official Supabase documentation at https://supabase.com/docs.