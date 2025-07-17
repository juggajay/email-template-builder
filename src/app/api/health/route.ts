import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Email Template Builder API is running',
    timestamp: new Date().toISOString()
  });
}