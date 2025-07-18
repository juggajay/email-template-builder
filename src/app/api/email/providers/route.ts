import { NextRequest, NextResponse } from 'next/server';
import { validateEmailServiceConfig } from '@/lib/email/email-service';

export async function GET(request: NextRequest) {
  try {
    const config = validateEmailServiceConfig();
    
    const providers = [
      {
        name: 'Resend',
        type: 'resend',
        configured: !!process.env.RESEND_API_KEY,
        connected: false, // This would be determined by testing the connection
        defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
        defaultFromName: process.env.DEFAULT_FROM_NAME
      },
      {
        name: 'SendGrid',
        type: 'sendgrid',
        configured: !!process.env.SENDGRID_API_KEY,
        connected: false, // This would be determined by testing the connection
        defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
        defaultFromName: process.env.DEFAULT_FROM_NAME
      }
    ];

    return NextResponse.json({
      providers,
      config: {
        isValid: config.isValid,
        errors: config.errors,
        availableProviders: config.providers
      }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    return NextResponse.json(
      { error: 'Failed to get providers' }, 
      { status: 500 }
    );
  }
}