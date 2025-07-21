import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Shopify API routes are working',
    timestamp: new Date().toISOString(),
    routes: [
      '/api/shopify/auth',
      '/api/shopify/callback',
      '/api/shopify/test',
      '/api/shopify/debug'
    ]
  });
}