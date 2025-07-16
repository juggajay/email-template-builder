# 📋 Project Planning & Architecture

## 🎯 Project Overview

**Product**: E-commerce Email Template Builder  
**Tech Stack**: Next.js 14, TypeScript, Unlayer, Supabase, Stripe, Tailwind CSS  
**Deployment**: Vercel with Supabase backend  
**Timeline**: 16 weeks development + launch  

---

## 🏗️ Architecture Patterns

### 1. File Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth routes group
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── editor/           # Email editor components
│   ├── templates/        # Template preview components
│   └── auth/            # Authentication components
├── lib/                  # Utility libraries
│   ├── supabase/        # Supabase client and types
│   ├── stripe/          # Stripe utilities
│   ├── email/           # Email export utilities
│   └── utils.ts         # General utilities
├── hooks/               # Custom React hooks
├── types/              # TypeScript type definitions
└── styles/             # Additional stylesheets
```

### 2. Component Architecture
- **Atomic Design**: Atoms → Molecules → Organisms → Templates → Pages
- **Feature-based Organization**: Group related components by feature
- **Shared UI Library**: Reusable components with consistent styling
- **Custom Hooks**: Logic extraction for reusability

### 3. State Management
- **Server State**: Supabase with built-in real-time subscriptions
- **Client State**: React hooks (useState, useReducer) for local state
- **Form State**: React Hook Form for complex forms
- **Global State**: React Context for user session and preferences

---

## 🎨 Design System

### 1. Color Palette
```css
/* Primary Colors */
--primary-50: #eff6ff;    /* Light blue backgrounds */
--primary-500: #3b82f6;   /* Primary actions */
--primary-600: #2563eb;   /* Hover states */
--primary-900: #1e3a8a;   /* Dark text */

/* Neutral Colors */
--gray-50: #f9fafb;       /* Background */
--gray-100: #f3f4f6;      /* Light borders */
--gray-500: #6b7280;      /* Secondary text */
--gray-900: #111827;      /* Primary text */

/* Semantic Colors */
--success-500: #10b981;   /* Success states */
--warning-500: #f59e0b;   /* Warning states */
--error-500: #ef4444;     /* Error states */
```

### 2. Typography Scale
```css
/* Font Families */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;       /* 12px */
--text-sm: 0.875rem;      /* 14px */
--text-base: 1rem;        /* 16px */
--text-lg: 1.125rem;      /* 18px */
--text-xl: 1.25rem;       /* 20px */
--text-2xl: 1.5rem;       /* 24px */
--text-3xl: 1.875rem;     /* 30px */
--text-4xl: 2.25rem;      /* 36px */
```

### 3. Component Patterns
- **Button Variants**: primary, secondary, outline, ghost, destructive
- **Input Styles**: Consistent border radius, focus states, error states
- **Card Layouts**: Elevation with subtle shadows, rounded corners
- **Navigation**: Clean sidebar with active states and icons

---

## 🔧 Development Standards

### 1. Code Style
```typescript
// File naming: kebab-case for files, PascalCase for components
// email-template-card.tsx
export function EmailTemplateCard({ template }: EmailTemplateCardProps) {
  // Component logic here
}

// Type definitions: descriptive interfaces
interface EmailTemplateCardProps {
  template: EmailTemplate;
  onSelect?: (template: EmailTemplate) => void;
  className?: string;
}

// Function naming: camelCase with descriptive verbs
const handleTemplateSelect = useCallback((template: EmailTemplate) => {
  // Handler logic
}, []);
```

### 2. Import Organization
```typescript
// 1. React imports
import { useState, useEffect, useCallback } from 'react';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// 3. Internal utilities
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// 4. Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 5. Types
import type { EmailTemplate } from '@/types/email';
```

### 3. Error Handling
```typescript
// API routes: structured error responses
export async function POST(request: Request) {
  try {
    // API logic
    return Response.json({ success: true, data });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Client components: graceful degradation
function EmailBuilder() {
  const [error, setError] = useState<string | null>(null);
  
  const handleSave = async () => {
    try {
      setError(null);
      await saveTemplate(templateData);
      toast.success('Template saved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed';
      setError(message);
      toast.error(message);
    }
  };
}
```

---

## 🗄️ Database Design

### 1. Supabase Schema
```sql
-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

-- User profiles with subscription info
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  brand_colors JSONB DEFAULT '{}',
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'agency')),
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  usage_count INTEGER DEFAULT 0,
  usage_reset_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Email templates with categories
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('abandoned-cart', 'product-launch', 'order-confirmation', 'welcome', 'promotional')),
  tags TEXT[] DEFAULT '{}',
  html_content TEXT,
  json_design JSONB,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User template customizations
CREATE TABLE user_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  customizations JSONB DEFAULT '{}',
  html_content TEXT,
  json_design JSONB,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Export tracking for usage limits
CREATE TABLE template_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES email_templates(id),
  export_type TEXT NOT NULL CHECK (export_type IN ('html', 'klaviyo', 'mailchimp', 'shopify', 'omnisend')),
  destination TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Row Level Security Policies
```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Public templates visible to all, private only to owner
CREATE POLICY "Public templates viewable by all" ON email_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

-- User templates only accessible to owner
CREATE POLICY "Users can manage own templates" ON user_templates
  FOR ALL USING (auth.uid() = user_id);
```

---

## 🔌 API Integration Patterns

### 1. Email Platform Integrations
```typescript
// Abstract email provider interface
interface EmailProvider {
  name: string;
  authenticate(credentials: Record<string, string>): Promise<boolean>;
  uploadTemplate(template: EmailTemplate): Promise<string>;
  getTemplates(): Promise<EmailTemplate[]>;
  deleteTemplate(id: string): Promise<boolean>;
}

// Klaviyo implementation
class KlaviyoProvider implements EmailProvider {
  name = 'klaviyo';
  
  async authenticate({ apiKey }: { apiKey: string }) {
    // Klaviyo auth logic
  }
  
  async uploadTemplate(template: EmailTemplate) {
    // Upload to Klaviyo
  }
}

// Provider factory
const createEmailProvider = (type: string): EmailProvider => {
  switch (type) {
    case 'klaviyo': return new KlaviyoProvider();
    case 'mailchimp': return new MailchimpProvider();
    case 'omnisend': return new OmnisendProvider();
    default: throw new Error(`Unknown provider: ${type}`);
  }
};
```

### 2. Subscription Management
```typescript
// Stripe webhook handler
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
  }
  
  return Response.json({ received: true });
}
```

---

## 🧪 Testing Strategy

### 1. Unit Testing
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { EmailTemplateCard } from './email-template-card';

describe('EmailTemplateCard', () => {
  const mockTemplate = {
    id: '1',
    name: 'Abandoned Cart',
    category: 'abandoned-cart',
    thumbnail_url: '/thumb.jpg'
  };
  
  it('renders template information', () => {
    render(<EmailTemplateCard template={mockTemplate} />);
    expect(screen.getByText('Abandoned Cart')).toBeInTheDocument();
  });
  
  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<EmailTemplateCard template={mockTemplate} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockTemplate);
  });
});
```

### 2. Integration Testing
```typescript
// API route testing
import { POST } from '@/app/api/templates/route';

describe('/api/templates', () => {
  it('creates template with valid data', async () => {
    const request = new Request('http://localhost/api/templates', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Template',
        category: 'abandoned-cart',
        html_content: '<html>...</html>'
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
  });
});
```

### 3. E2E Testing (Optional)
```typescript
// Playwright end-to-end tests
import { test, expect } from '@playwright/test';

test('complete template creation flow', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-template"]');
  await page.click('[data-testid="abandoned-cart-template"]');
  await page.fill('[data-testid="template-name"]', 'My Cart Recovery');
  await page.click('[data-testid="save-template"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 🚀 Deployment Strategy

### 1. Environment Configuration
```bash
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
UNLAYER_PROJECT_ID=your_unlayer_project_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
PINECONE_API_KEY=your_pinecone_key
```

### 2. Vercel Deployment
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 3. CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📈 Performance Optimization

### 1. Code Splitting
```typescript
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

const EmailEditor = dynamic(
  () => import('@/components/editor/email-editor'),
  { 
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
);

// Route-based code splitting
const DashboardPage = dynamic(() => import('./dashboard/page'));
```

### 2. Image Optimization
```typescript
// Next.js Image component with Cloudinary
import Image from 'next/image';

function TemplatePreview({ template }: { template: EmailTemplate }) {
  return (
    <Image
      src={template.thumbnail_url}
      alt={template.name}
      width={300}
      height={200}
      className="rounded-lg"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

### 3. Caching Strategy
```typescript
// React Query for server state
import { useQuery } from '@tanstack/react-query';

function useEmailTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
}
```

---

## 🔒 Security Best Practices

### 1. Authentication & Authorization
```typescript
// Middleware for protected routes
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return res;
}
```

### 2. Input Validation
```typescript
// Zod schema validation
import { z } from 'zod';

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['abandoned-cart', 'product-launch', 'order-confirmation']),
  html_content: z.string().min(1),
  json_design: z.object({}).passthrough(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validation = templateSchema.safeParse(body);
  
  if (!validation.success) {
    return Response.json(
      { error: 'Invalid input', details: validation.error.errors },
      { status: 400 }
    );
  }
  
  // Process valid data
}
```

### 3. Rate Limiting
```typescript
// Simple rate limiting with Upstash Redis
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, reset } = await ratelimit.limit(ip);
  
  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded' },
      { 
        status: 429,
        headers: { 'X-RateLimit-Reset': reset.toString() }
      }
    );
  }
  
  // Continue with request
}
```

---

This planning document serves as the architectural foundation for building a scalable, maintainable, and secure e-commerce email template builder. All development should follow these patterns and standards to ensure consistency and quality throughout the project.