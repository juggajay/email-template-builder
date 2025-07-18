import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider || !['resend', 'sendgrid'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be "resend" or "sendgrid"' }, 
        { status: 400 }
      );
    }

    const emailService = getEmailService();
    const connected = await emailService.testConnection(provider);

    return NextResponse.json({
      provider,
      connected,
      message: connected 
        ? `${provider} connection successful` 
        : `${provider} connection failed`
    });

  } catch (error) {
    console.error('Test connection error:', error);
    return NextResponse.json(
      { 
        connected: false,
        error: 'Connection test failed' 
      }, 
      { status: 500 }
    );
  }
}