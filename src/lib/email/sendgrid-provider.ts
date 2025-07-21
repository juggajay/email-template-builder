/**
 * SendGrid email provider implementation
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

export class SendGridProvider extends EmailProvider {
  private apiBaseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: ProviderConfig) {
    super('sendgrid', config);
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
        personalizations: [{
          to: options.to.map(addr => ({
            email: addr.email,
            name: addr.name
          })),
          cc: options.cc?.map(addr => ({
            email: addr.email,
            name: addr.name
          })),
          bcc: options.bcc?.map(addr => ({
            email: addr.email,
            name: addr.name
          })),
          subject: content.subject,
          custom_args: {
            email_id: emailId,
            ...options.tags
          }
        }],
        from: {
          email: options.from.email,
          name: options.from.name
        },
        reply_to: options.replyTo ? {
          email: options.replyTo.email,
          name: options.replyTo.name
        } : undefined,
        content: [
          {
            type: 'text/html',
            value: trackedHtml
          },
          ...(content.text ? [{
            type: 'text/plain',
            value: content.text
          }] : [])
        ],
        headers: options.headers,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content) 
            ? att.content.toString('base64')
            : Buffer.from(att.content).toString('base64'),
          type: att.contentType,
          disposition: att.disposition || 'attachment',
          content_id: att.contentId
        })),
        tracking_settings: {
          click_tracking: {
            enable: options.trackClicks || false,
            enable_text: false
          },
          open_tracking: {
            enable: options.trackOpens || false,
            substitution_tag: '%open_tracking%'
          }
        }
      };

      const response = await fetch(`${this.apiBaseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errors?.[0]?.message || 'Failed to send email');
      }

      // SendGrid returns 202 with message ID in X-Message-Id header
      const messageId = response.headers.get('X-Message-Id') || emailId;

      // Store email in database for tracking
      await this.storeEmailRecord(emailId, options, messageId);

      return {
        id: messageId,
        status: 'sent',
        provider: 'sendgrid',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('SendGrid send error:', error);
      return {
        id: this.generateEmailId(),
        status: 'failed',
        provider: 'sendgrid',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  async sendBatch(options: BatchSendOptions): Promise<BatchSendResult> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const batchSize = options.batchSize || 1000; // SendGrid supports up to 1000 recipients per request
    const delay = options.delayBetweenBatches || 100;

    const results: SendEmailResult[] = [];
    const errors: Array<{ email: string; error: string }> = [];
    let sent = 0;
    let failed = 0;

    // Group emails by similar content to optimize batch sending
    const batches = this.groupEmailsForBatching(options.emails, batchSize);

    for (const batch of batches) {
      try {
        if (batch.length === 1) {
          // Single email
          const result = await this.sendEmail(batch[0]);
          results.push(result);
          
          if (result.status === 'sent') {
            sent++;
          } else {
            failed++;
            errors.push({
              email: batch[0].to[0]?.email || 'unknown',
              error: result.error || 'Unknown error'
            });
          }
        } else {
          // Batch send using SendGrid's batch API
          const batchResult = await this.sendBatchToSendGrid(batch);
          results.push(...batchResult.results);
          sent += batchResult.sent;
          failed += batchResult.failed;
          errors.push(...batchResult.errors);
        }

        // Add delay between batches
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        // Handle batch failure
        batch.forEach(emailOptions => {
          failed++;
          errors.push({
            email: emailOptions.to[0]?.email || 'unknown',
            error: error instanceof Error ? error.message : 'Batch send failed'
          });
        });
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
      // First, authenticate the domain
      const authResponse = await fetch(`${this.apiBaseUrl}/whitelabel/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain,
          subdomain: 'mail',
          automatic_security: true
        })
      });

      const authResult = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(authResult.errors?.[0]?.message || 'Failed to authenticate domain');
      }

      return {
        domain,
        status: 'pending',
        dkimRecord: authResult.dns?.dkim ? {
          name: authResult.dns.dkim.host,
          value: authResult.dns.dkim.data,
          verified: authResult.dns.dkim.valid
        } : undefined,
        spfRecord: authResult.dns?.mail_cname ? {
          name: authResult.dns.mail_cname.host,
          value: authResult.dns.mail_cname.data,
          verified: authResult.dns.mail_cname.valid
        } : undefined,
        verificationToken: authResult.id?.toString(),
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('SendGrid domain verification error:', error);
      throw error;
    }
  }

  async getDomainStatus(domain: string): Promise<DomainVerification> {
    try {
      // Get all authenticated domains and find the one we want
      const response = await fetch(`${this.apiBaseUrl}/whitelabel/domains`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      const domains = await response.json();

      if (!response.ok) {
        throw new Error('Failed to get domains');
      }

      const domainInfo = domains.find((d: any) => d.domain === domain);
      
      if (!domainInfo) {
        throw new Error('Domain not found');
      }

      return {
        domain,
        status: domainInfo.valid ? 'verified' : 'pending',
        dkimRecord: domainInfo.dns?.dkim1 ? {
          name: domainInfo.dns.dkim1.host,
          value: domainInfo.dns.dkim1.data,
          verified: domainInfo.dns.dkim1.valid
        } : undefined,
        spfRecord: domainInfo.dns?.mail_cname ? {
          name: domainInfo.dns.mail_cname.host,
          value: domainInfo.dns.mail_cname.data,
          verified: domainInfo.dns.mail_cname.valid
        } : undefined,
        lastChecked: new Date()
      };

    } catch (error) {
      console.error('SendGrid get domain status error:', error);
      throw error;
    }
  }

  async getEmailAnalytics(emailId: string): Promise<EmailAnalytics> {
    try {
      // Get stats from SendGrid
      const response = await fetch(`${this.apiBaseUrl}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      // SendGrid doesn't provide per-email analytics easily,
      // so we'll combine their stats with our own tracking
      return this.getEmailAnalyticsFromDatabase(emailId);

    } catch (error) {
      console.error('SendGrid analytics error:', error);
      return this.getEmailAnalyticsFromDatabase(emailId);
    }
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

    // SendGrid sends an array of events
    if (Array.isArray(payload)) {
      for (const eventData of payload) {
        const event: EmailEvent = {
          id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          emailId: eventData.sg_message_id || eventData.email_id,
          type: this.mapSendGridEventType(eventData.event),
          timestamp: new Date(eventData.timestamp * 1000),
          recipient: eventData.email,
          metadata: eventData,
          userAgent: eventData.useragent,
          ipAddress: eventData.ip,
          link: eventData.url,
          reason: eventData.reason
        };

        events.push(event);

        // Store event in database
        await this.storeEmailEvent(event);
      }
    }

    return events;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/account`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private groupEmailsForBatching(emails: SendEmailOptions[], batchSize: number): SendEmailOptions[][] {
    // Group emails with similar content together for efficient batch sending
    const batches: SendEmailOptions[][] = [];
    
    for (let i = 0; i < emails.length; i += batchSize) {
      batches.push(emails.slice(i, i + batchSize));
    }
    
    return batches;
  }

  private async sendBatchToSendGrid(batch: SendEmailOptions[]): Promise<{
    results: SendEmailResult[];
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  }> {
    // Implement SendGrid batch sending logic
    // This would use SendGrid's batch sending capabilities
    
    const results: SendEmailResult[] = [];
    const errors: Array<{ email: string; error: string }> = [];
    let sent = 0;
    let failed = 0;

    // For now, send individually (could be optimized with SendGrid's batch API)
    for (const emailOptions of batch) {
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
    }

    return { results, sent, failed, errors };
  }

  private mapSendGridEventType(sendGridType: string): EmailEvent['type'] {
    const mapping: Record<string, EmailEvent['type']> = {
      'processed': 'sent',
      'delivered': 'delivered',
      'open': 'opened',
      'click': 'clicked',
      'bounce': 'bounced',
      'dropped': 'bounced',
      'spamreport': 'complained',
      'unsubscribe': 'unsubscribed',
      'group_unsubscribe': 'unsubscribed'
    };

    return mapping[sendGridType] || 'sent';
  }

  private async verifyWebhookSignature(payload: any, signature: string): Promise<boolean> {
    // Implement SendGrid webhook signature verification
    const crypto = require('crypto');
    const publicKey = this.config.webhookSecret;
    
    if (!publicKey) return true;

    try {
      const verify = crypto.createVerify('sha256');
      verify.update(JSON.stringify(payload));
      return verify.verify(publicKey, signature, 'base64');
    } catch {
      return false;
    }
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