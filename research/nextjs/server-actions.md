# Next.js 14 Server Actions Guide

## Introduction

Server Actions are asynchronous functions that run on the server and can be used to handle form submissions and data mutations in Next.js 14. They provide a seamless way to handle server-side operations with built-in optimizations.

## Key Characteristics

- Use the `"use server"` directive at the top of async functions
- Can be defined in Server Components or separate files
- Automatically use POST method when invoked
- Receive FormData when used with forms
- Integrate with Next.js caching and revalidation

## Basic Server Action

```typescript
// app/actions/posts.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  
  // Validation
  if (!title || title.length < 3) {
    throw new Error('Title must be at least 3 characters')
  }
  
  // Database operation
  const post = await db.post.create({
    data: { title, content }
  })
  
  // Revalidate the posts page
  revalidatePath('/posts')
  
  // Redirect to the new post
  redirect(`/posts/${post.id}`)
}
```

## Form Integration

```typescript
// Server Component with form
export default function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" type="text" placeholder="Post title" required />
      <textarea name="content" placeholder="Post content" required />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

## Client Component Usage

```typescript
'use client'

import { createPost } from '@/app/actions/posts'
import { useFormStatus } from 'react-dom'

export function CreatePostForm() {
  const { pending } = useFormStatus()
  
  return (
    <form action={createPost}>
      <input name="title" type="text" placeholder="Post title" required />
      <textarea name="content" placeholder="Post content" required />
      <button type="submit" disabled={pending}>
        {pending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  )
}
```

## Error Handling

```typescript
'use server'

import { z } from 'zod'

const PostSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
})

export async function createPost(formData: FormData) {
  try {
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
    }
    
    // Validate data
    const validatedData = PostSchema.parse(data)
    
    // Create post
    const post = await db.post.create({
      data: validatedData
    })
    
    revalidatePath('/posts')
    return { success: true, post }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors
      }
    }
    
    return {
      success: false,
      message: 'Failed to create post'
    }
  }
}
```

## Advanced Patterns

### Cookie Management
```typescript
'use server'

import { cookies } from 'next/headers'

export async function updateUserPreferences(formData: FormData) {
  const theme = formData.get('theme') as string
  
  cookies().set('theme', theme, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  })
  
  revalidatePath('/settings')
}
```

### File Upload Handling
```typescript
'use server'

export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File
  
  if (!file) {
    throw new Error('No file uploaded')
  }
  
  // Convert to buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Save file or upload to cloud storage
  const filename = `uploads/${Date.now()}-${file.name}`
  await fs.writeFile(filename, buffer)
  
  return { filename, size: file.size }
}
```

### Progressive Enhancement
```typescript
// Server Component
export default function SearchForm() {
  async function search(formData: FormData) {
    'use server'
    
    const query = formData.get('query') as string
    redirect(`/search?q=${encodeURIComponent(query)}`)
  }
  
  return (
    <form action={search}>
      <input name="query" type="text" placeholder="Search..." />
      <button type="submit">Search</button>
    </form>
  )
}
```

## Email Template Builder Examples

### Template Creation
```typescript
'use server'

import { revalidatePath } from 'next/cache'

export async function createEmailTemplate(formData: FormData) {
  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const htmlContent = formData.get('htmlContent') as string
  
  // Validation
  if (!name || !subject || !htmlContent) {
    return {
      success: false,
      message: 'All fields are required'
    }
  }
  
  try {
    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        htmlContent,
        userId: await getCurrentUserId(),
        createdAt: new Date(),
      }
    })
    
    revalidatePath('/templates')
    
    return {
      success: true,
      template,
      message: 'Template created successfully'
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to create template'
    }
  }
}
```

### Template Update
```typescript
'use server'

export async function updateEmailTemplate(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const subject = formData.get('subject') as string
  const htmlContent = formData.get('htmlContent') as string
  
  try {
    const template = await db.emailTemplate.update({
      where: { id },
      data: {
        name,
        subject,
        htmlContent,
        updatedAt: new Date(),
      }
    })
    
    // Revalidate specific template and list
    revalidatePath(`/templates/${id}`)
    revalidatePath('/templates')
    
    return {
      success: true,
      template,
      message: 'Template updated successfully'
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'Failed to update template'
    }
  }
}
```

### Send Test Email
```typescript
'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTestEmail(templateId: string, testEmail: string) {
  try {
    // Get template
    const template = await db.emailTemplate.findUnique({
      where: { id: templateId }
    })
    
    if (!template) {
      return {
        success: false,
        message: 'Template not found'
      }
    }
    
    // Send email
    const { data, error } = await resend.emails.send({
      from: 'test@yourdomain.com',
      to: testEmail,
      subject: `[Test] ${template.subject}`,
      html: template.htmlContent,
    })
    
    if (error) {
      return {
        success: false,
        message: 'Failed to send test email'
      }
    }
    
    return {
      success: true,
      message: 'Test email sent successfully',
      emailId: data?.id
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred while sending test email'
    }
  }
}
```

## Best Practices

1. **Always validate input data** before processing
2. **Handle errors gracefully** and return meaningful error messages
3. **Use revalidatePath()** to update cached data after mutations
4. **Implement proper loading states** with useFormStatus
5. **Use TypeScript** for better type safety
6. **Keep Server Actions focused** on a single responsibility
7. **Test with and without JavaScript** for progressive enhancement
8. **Sanitize user input** before storing in database
9. **Use proper error boundaries** to catch and handle errors
10. **Log important operations** for debugging and monitoring