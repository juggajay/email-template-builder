/**
 * Resend email provider implementation
 */

import { 
  EmailProvider, 
  SendEmailOptions, 
  SendEmailResult, 
  BatchSendOptions, 
  BatchSendResult,
  DomainVerification,
  EmailAnalytics,
  EmailEvent,
  ProviderConfig
} from './providers';

export class ResendProvider extends EmailProvider {
  private apiBaseUrl = 'https://api.resend.com';

  constructor(config: ProviderConfig) {
    super('resend', config);
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    try {
      const emailId = this.generateEmailId();
      
      // Validate email addresses
      if (!this.validateEmail(options.from.email)) {
        throw new Error(`Invalid from email: ${options.from.email}`);
      }

      for (const recipient of options.to) {
        if (!this.validateEmail(recipient.email)) {
          throw new Error(`Invalid recipient email: ${recipient.email}`);
        }
      }

      // Process merge tags if template data provided
      const content = options.templateData 
        ? this.processMergeTags(options.content, options.templateData)
        : options.content;

      // Add tracking if enabled
      const trackedHtml = this.addTracking(
        content.html, 
        emailId, 
        options.trackOpens, 
        options.trackClicks
      );

      const payload = {
        from: `${options.from.name || ''} <${options.from.email}>`.trim(),
        to: options.to.map(addr => 
          addr.name ? `${addr.name} <${addr.email}>` : addr.email
        ),
        cc: options.cc?.map(addr => 
          addr.name ? `${addr.name} <${addr.email}>` : addr.email
        ),
        bcc: options.bcc?.map(addr => 
          addr.name ? `${addr.name} <${addr.email}>` : addr.email
        ),
        reply_to: options.replyTo ? 
          `${options.replyTo.name || ''} <${options.replyTo.email}>`.trim() : undefined,
        subject: content.subject,
        html: trackedHtml,
        text: content.text,
        tags: options.tags ? Object.entries(options.tags).map(([name, value]) => ({
          name,
          value
        })) : undefined,
        headers: options.headers,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content) 
            ? att.content.toString('base64')
            : Buffer.from(att.content).toString('base64'),
          content_type: att.contentType,
          disposition: att.disposition || 'attachment'
        }))
      };

      const response = await fetch(`${this.apiBaseUrl}/emails`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      // Store email in database for tracking
      await this.storeEmailRecord(emailId, options, result.id);

      return {
        id: result.id,
        status: 'sent',
        provider: 'resend',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Resend send error:', error);
      return {
        id: this.generateEmailId(),
        status: 'failed',
        provider: 'resend',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  async sendBatch(options: BatchSendOptions): Promise<BatchSendResult> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const batchSize = options.batchSize || 100;
    const delay = options.delayBetweenBatches || 1000;

    const results: SendEmailResult[] = [];
    const errors: Array<{ email: string; error: string }> = [];
    let sent = 0;
    let failed = 0;

    // Process emails in batches
    for (let i = 0; i < options.emails.length; i += batchSize) {
      const batch = options.emails.slice(i, i + batchSize);
      
      // Send all emails in current batch concurrently
      const batchPromises = batch.map(async (emailOptions) => {
        try {
          const result = await this.sendEmail(emailOptions);
          results.push(result);
          
          if (result.status === 'sent') {
            sent++;
          } else {
            failed++;
            errors.push({
              email: emailOptions.to[0]?.email || 'unknown',
              error: result.error || 'Unknown error'
            });
          }
        } catch (error) {
          failed++;
          errors.push({
            email: emailOptions.to[0]?.email || 'unknown',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });

      await Promise.all(batchPromises);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < options.emails.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      batchId,
      total: options.emails.length,
      sent,
      failed,
      results,
      errors
    };
  }

  async verifyDomain(domain: string): Promise<DomainVerification> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: domain })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to verify domain');
      }

      return {
        domain,
        status: 'pending',
        dkimRecord: result.records?.find((r: any) => r.type === 'TXT' && r.name.includes('_domainkey')) ? {
          name: result.records.find((r: any) => r.type === 'TXT' && r.name.includes('_domainkey')).name,
          value: result.records.find((r: any) => r.type === 'TXT' && r.name.includes('_domainkey')).value,
          verified: false
        } : undefined,
        spfRecord: result.records?.find((r: any) => r.type === 'TXT' && r.value.includes('spf')) ? {
          name: result.records.find((r: any) => r.type === 'TXT' && r.value.includes('spf')).name,
          value: result.records.find((r: any) => r.type === 'TXT' && r.value.includes('spf')).value,
          verified: false
        } : undefined,
        verificationToken: result.id,
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('Domain verification error:', error);
      throw error;
    }
  }

  async getDomainStatus(domain: string): Promise<DomainVerification> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/domains/${domain}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get domain status');
      }

      return {
        domain,
        status: result.status === 'verified' ? 'verified' : 'pending',
        dkimRecord: result.records?.dkim ? {
          name: result.records.dkim.name,
          value: result.records.dkim.value,
          verified: result.records.dkim.status === 'verified'
        } : undefined,
        spfRecord: result.records?.spf ? {
          name: result.records.spf.name,
          value: result.records.spf.value,
          verified: result.records.spf.status === 'verified'
        } : undefined,
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('Get domain status error:', error);
      throw error;
    }
  }

  async getEmailAnalytics(emailId: string): Promise<EmailAnalytics> {
    // Resend doesn't have built-in analytics API, so we'll use our own tracking
    return this.getEmailAnalyticsFromDatabase(emailId);
  }

  async handleWebhook(payload: any, signature?: string): Promise<EmailEvent[]> {
    // Verify webhook signature if provided
    if (signature && this.config.webhookSecret) {
      const isValid = await this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    const events: EmailEvent[] = [];

    // Process Resend webhook events
    if (payload.type) {
      const event: EmailEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        emailId: payload.data?.email_id || payload.data?.id,
        type: this.mapResendEventType(payload.type),
        timestamp: new Date(payload.created_at || Date.now()),
        recipient: payload.data?.to || '',
        metadata: payload.data
      };

      events.push(event);

      // Store event in database
      await this.storeEmailEvent(event);
    }

    return events;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/domains`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private mapResendEventType(resendType: string): EmailEvent['type'] {
    const mapping: Record<string, EmailEvent['type']> = {
      'email.sent': 'sent',
      'email.delivered': 'delivered',
      'email.delivery_delayed': 'sent',
      'email.bounced': 'bounced',
      'email.complained': 'complained'
    };

    return mapping[resendType] || 'sent';
  }

  private async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    // Implement Resend webhook signature verification
    // This would use crypto to verify the signature
    return true; // Placeholder
  }

  private async storeEmailRecord(emailId: string, options: SendEmailOptions, providerEmailId: string): Promise<void> {
    // Store email record in database for tracking
    // This would integrate with your database
  }

  private async storeEmailEvent(event: EmailEvent): Promise<void> {
    // Store email event in database
    // This would integrate with your database
  }

  private async getEmailAnalyticsFromDatabase(emailId: string): Promise<EmailAnalytics> {
    // Get analytics from database
    // This would query your database for events
    return {
      emailId,
      sent: 1,
      delivered: 1,
      opened: 0,
      clicked: 0,
      bounced: 0,
      complained: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      complaintRate: 0,
      events: []
    };
  }
}