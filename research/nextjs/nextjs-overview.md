# Next.js 14 Documentation Overview

## Introduction

Next.js 14 is a React framework for building full-stack web applications with built-in optimizations for routing, data fetching, rendering, and performance. This document provides a comprehensive overview of key concepts and patterns for building production-ready applications.

## 1. App Router Architecture

The App Router is Next.js 14's modern routing system that leverages React's latest features including Server Components, Suspense, and Server Actions.

### Key Features:
- **File-system based routing**: Routes are defined by the folder structure in the `app` directory
- **Special file conventions**: 
  - `page.tsx` - Defines a route segment and makes it publicly accessible
  - `layout.tsx` - Shared UI that wraps pages and preserves state
  - `loading.tsx` - Loading UI shown while data loads
  - `error.tsx` - Error boundary for error handling
  - `not-found.tsx` - 404 page handling

### Example Page Structure:
```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>
}
```

### Example Layout:
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>Navigation</nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### Dynamic Routes:
```typescript
// app/blog/[slug]/page.tsx
export default function BlogPost({ params }: { params: { slug: string } }) {
  return <h1>Blog Post: {params.slug}</h1>
}
```

## 2. API Routes (Route Handlers)

Route Handlers allow you to create custom request handlers for API endpoints using the Web Request and Response APIs.

### Supported HTTP Methods:
- GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS

### Basic Example:
```typescript
// app/api/hello/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello from Next.js API!' })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  // Process the data
  return NextResponse.json({ success: true, data: body })
}
```

### Dynamic API Routes:
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserById(params.id)
  return NextResponse.json(user)
}
```

### Handling Different Content Types:
```typescript
// Handle form data
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email')
  
  // Handle file uploads
  const file = formData.get('file') as File
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  return NextResponse.json({ success: true })
}
```

## 3. TypeScript Integration

Next.js provides excellent TypeScript support out of the box with automatic setup and configuration.

### Setup:
1. Create a new Next.js app with TypeScript:
   ```bash
   npx create-next-app@latest my-app --typescript
   ```

2. Or add to existing project:
   - Rename files to `.ts` or `.tsx`
   - Run `next dev` to auto-install dependencies
   - `tsconfig.json` will be automatically generated

### Type-Safe Configuration:
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true, // Enable statically typed links
  },
}

export default nextConfig
```

### Common Types:
```typescript
// Page Component Props
interface PageProps {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

// Layout Component Props
interface LayoutProps {
  children: React.ReactNode
  params: { id: string }
}

// Metadata
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js',
}
```

### API Route Types:
```typescript
import { NextRequest, NextResponse } from 'next/server'

type ResponseData = {
  message: string
  data?: any
}

export async function GET(request: NextRequest): Promise<NextResponse<ResponseData>> {
  return NextResponse.json({
    message: 'Success',
    data: { /* your data */ }
  })
}
```

## 4. Server Components

Server Components are the default in Next.js 14 App Router, allowing you to render components on the server with direct access to backend resources.

### Benefits:
- Reduced JavaScript bundle size
- Direct database access
- Secure API key handling
- Improved initial page load performance

### Server Component Example:
```typescript
// This is a Server Component by default
async function BlogPosts() {
  // Direct database access
  const posts = await db.posts.findMany()
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Client Components:
When you need interactivity, use the `"use client"` directive:

```typescript
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Composition Pattern:
```typescript
// Server Component
async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id)
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      {/* Client Component for interactivity */}
      <AddToCartButton productId={id} />
    </div>
  )
}

// Client Component
'use client'
export function AddToCartButton({ productId }: { productId: string }) {
  return <button onClick={() => addToCart(productId)}>Add to Cart</button>
}
```

## 5. Data Fetching Patterns

### Server Components Data Fetching:
```typescript
// Direct fetch in Server Components
async function ProductList() {
  const res = await fetch('https://api.example.com/products', {
    cache: 'force-cache', // Cache indefinitely (default)
    // cache: 'no-store', // Always fetch fresh data
    // next: { revalidate: 3600 } // Revalidate every hour
  })
  
  const products = await res.json()
  
  return <ProductGrid products={products} />
}
```

### Parallel Data Fetching:
```typescript
async function Dashboard() {
  // Fetch data in parallel
  const [users, posts, analytics] = await Promise.all([
    getUsers(),
    getPosts(),
    getAnalytics(),
  ])
  
  return (
    <div>
      <UserList users={users} />
      <PostList posts={posts} />
      <Analytics data={analytics} />
    </div>
  )
}
```

### Loading States:
```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}

// Using Suspense for granular loading
import { Suspense } from 'react'

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading users...</div>}>
        <UserList />
      </Suspense>
      <Suspense fallback={<div>Loading posts...</div>}>
        <PostList />
      </Suspense>
    </div>
  )
}
```

## 6. Deployment to Vercel

Vercel is the recommended platform for deploying Next.js applications with zero-configuration deployment.

### Deployment Steps:
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on Vercel
3. Configure environment variables
4. Deploy with one click

### Environment Variables:
```typescript
// Access environment variables
const apiKey = process.env.API_KEY // Server-side only
const publicUrl = process.env.NEXT_PUBLIC_API_URL // Available client-side
```

### Production Build Commands:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Vercel-Specific Features:
- Automatic HTTPS
- Global CDN
- Preview deployments for pull requests
- Analytics and Web Vitals monitoring
- Edge Functions support

## 7. Best Practices for Production Apps

### Performance Optimization:
1. **Image Optimization**:
```typescript
import Image from 'next/image'

export function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={500}
      height={300}
      loading="lazy"
      placeholder="blur"
    />
  )
}
```

2. **Font Optimization**:
```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  )
}
```

3. **Code Splitting**:
```typescript
// Dynamic imports for code splitting
import dynamic from 'next/dynamic'

const DynamicChart = dynamic(() => import('./Chart'), {
  loading: () => <p>Loading chart...</p>,
  ssr: false, // Disable SSR for client-only components
})
```

### Security Best Practices:
1. **Environment Variables**:
   - Use `NEXT_PUBLIC_` prefix only for client-side variables
   - Keep sensitive data server-side only

2. **Content Security Policy**:
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
  )
  
  return response
}
```

### Error Handling:
```typescript
// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Metadata and SEO:
```typescript
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
  description: 'Build amazing email templates',
  openGraph: {
    title: 'My App',
    description: 'Build amazing email templates',
    url: 'https://myapp.com',
    siteName: 'My App',
    images: [
      {
        url: 'https://myapp.com/og.png',
        width: 1200,
        height: 630,
      },
    ],
  },
}
```

## Email Template Builder Specific Patterns

For building an email template builder, consider these patterns:

### 1. Server Actions for Template Management:
```typescript
// app/actions/templates.ts
'use server'

export async function createTemplate(formData: FormData) {
  const name = formData.get('name') as string
  const content = formData.get('content') as string
  
  const template = await db.template.create({
    data: { name, content }
  })
  
  revalidatePath('/templates')
  return template
}
```

### 2. Real-time Preview with Server Components:
```typescript
// app/editor/[id]/page.tsx
export default async function TemplateEditor({ params }: { params: { id: string } }) {
  const template = await getTemplate(params.id)
  
  return (
    <div className="grid grid-cols-2">
      <TemplateForm template={template} />
      <EmailPreview content={template.content} />
    </div>
  )
}
```

### 3. API Routes for Email Sending:
```typescript
// app/api/send-email/route.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { to, subject, html } = await request.json()
  
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to,
    subject,
    html,
  })
  
  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }
  
  return NextResponse.json({ data })
}
```

## Conclusion

Next.js 14 with the App Router provides a powerful foundation for building modern web applications. Key takeaways for production apps:

1. Use Server Components by default for better performance
2. Implement proper TypeScript types throughout
3. Leverage built-in optimization features
4. Follow security best practices
5. Deploy to Vercel for the best experience
6. Use proper error handling and loading states
7. Implement SEO best practices with metadata

For an email template builder, focus on:
- Server-side template rendering
- Real-time preview capabilities
- Secure API routes for sending emails
- Efficient data fetching and caching
- Responsive design for the editor interface