import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, pathname, origin, href } = request.nextUrl;
  
  return NextResponse.json({
    message: 'Shopify Debug Endpoint',
    request: {
      url: href,
      pathname,
      origin,
      searchParams: Object.fromEntries(searchParams.entries()),
      headers: {
        host: request.headers.get('host'),
        'x-forwarded-host': request.headers.get('x-forwarded-host'),
        'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
      }
    },
    env: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    }
  });
}