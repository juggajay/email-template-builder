import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';

// Get all domains for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get domains from database
    const { data: domains, error } = await supabase
      .from('email_domains')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ domains });

  } catch (error) {
    console.error('Get domains error:', error);
    return NextResponse.json(
      { error: 'Failed to get domains' }, 
      { status: 500 }
    );
  }
}

// Add a new domain for verification
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { domain, provider = 'resend' } = body;

    // Validate domain
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' }, 
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' }, 
        { status: 400 }
      );
    }

    // Check if domain already exists
    const { data: existing } = await supabase
      .from('email_domains')
      .select('id')
      .eq('user_id', user.id)
      .eq('domain', domain)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Domain already exists' }, 
        { status: 409 }
      );
    }

    const emailService = getEmailService();
    
    // Start domain verification with provider
    const verification = await emailService.verifyDomain(domain, provider as any);

    // Store domain in database
    const { data: domainRecord, error: insertError } = await supabase
      .from('email_domains')
      .insert({
        user_id: user.id,
        domain,
        provider,
        status: verification.status,
        verification_token: verification.verificationToken,
        dkim_record: verification.dkimRecord ? JSON.stringify(verification.dkimRecord) : null,
        spf_record: verification.spfRecord ? JSON.stringify(verification.spfRecord) : null,
        dmarc_record: verification.dmarcRecord ? JSON.stringify(verification.dmarcRecord) : null,
        last_checked: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      domain: domainRecord,
      verification: {
        status: verification.status,
        dkimRecord: verification.dkimRecord,
        spfRecord: verification.spfRecord,
        dmarcRecord: verification.dmarcRecord
      }
    });

  } catch (error) {
    console.error('Add domain error:', error);
    return NextResponse.json(
      { error: 'Failed to add domain' }, 
      { status: 500 }
    );
  }
}