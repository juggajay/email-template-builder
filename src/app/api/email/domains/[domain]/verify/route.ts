import { NextRequest, NextResponse } from 'next/server';
import { getEmailService } from '@/lib/email/email-service';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const domain = decodeURIComponent(params.domain);

    // Get domain record from database
    const { data: domainRecord, error: domainError } = await supabase
      .from('email_domains')
      .select('*')
      .eq('user_id', user.id)
      .eq('domain', domain)
      .single();

    if (domainError || !domainRecord) {
      return NextResponse.json(
        { error: 'Domain not found' }, 
        { status: 404 }
      );
    }

    const emailService = getEmailService();
    
    // Check domain verification status with provider
    const verification = await emailService.getDomainStatus(
      domain, 
      domainRecord.provider as any
    );

    // Update domain record in database
    const { error: updateError } = await supabase
      .from('email_domains')
      .update({
        status: verification.status,
        dkim_record: verification.dkimRecord ? JSON.stringify(verification.dkimRecord) : domainRecord.dkim_record,
        spf_record: verification.spfRecord ? JSON.stringify(verification.spfRecord) : domainRecord.spf_record,
        dmarc_record: verification.dmarcRecord ? JSON.stringify(verification.dmarcRecord) : domainRecord.dmarc_record,
        last_checked: new Date().toISOString(),
        verified_at: verification.status === 'verified' ? new Date().toISOString() : null
      })
      .eq('id', domainRecord.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      domain,
      status: verification.status,
      verified: verification.status === 'verified',
      dkimRecord: verification.dkimRecord,
      spfRecord: verification.spfRecord,
      dmarcRecord: verification.dmarcRecord,
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Verify domain error:', error);
    return NextResponse.json(
      { error: 'Failed to verify domain' }, 
      { status: 500 }
    );
  }
}