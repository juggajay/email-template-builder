/**
 * Email service providers (Resend, SendGrid)
 * Unified interface for sending emails, managing domains, and tracking analytics
 */

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailContent {
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailOptions {
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  replyTo?: EmailAddress;
  content: EmailContent;
  tags?: Record<string, string>;
  headers?: Record<string, string>;
  attachments?: EmailAttachment[];
  templateData?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  disposition?: 'attachment' | 'inline';
  contentId?: string;
}

export interface SendEmailResult {
  id: string;
  status: 'sent' | 'queued' | 'failed';
  provider: string;
  error?: string;
  timestamp: Date;
}

export interface BatchSendOptions {
  emails: SendEmailOptions[];
  batchSize?: number;
  delayBetweenBatches?: number;
}

export interface BatchSendResult {
  batchId: string;
  total: number;
  sent: number;
  failed: number;
  results: SendEmailResult[];
  errors: Array<{ email: string; error: string }>;
}

export interface DomainVerification {
  domain: string;
  status: 'pending' | 'verified' | 'failed';
  dkimRecord?: {
    name: string;
    value: string;
    verified: boolean;
  };
  spfRecord?: {
    name: string;
    value: string;
    verified: boolean;
  };
  dmarcRecord?: {
    name: string;
    value: string;
    verified: boolean;
  };
  verificationToken?: string;
  lastChecked?: Date;
}

export interface EmailEvent {
  id: string;
  emailId: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  timestamp: Date;
  recipient: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
  link?: string; // For click events
  reason?: string; // For bounce/complaint events
}

export interface EmailAnalytics {
  emailId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  complaintRate: number;
  events: EmailEvent[];
}

export interface ProviderConfig {
  apiKey: string;
  webhookSecret?: string;
  defaultFromEmail?: string;
  defaultFromName?: string;
}

export abstract class EmailProvider {
  protected config: ProviderConfig;
  protected name: string;

  constructor(name: string, config: ProviderConfig) {
    this.name = name;
    this.config = config;
  }

  abstract sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
  abstract sendBatch(options: BatchSendOptions): Promise<BatchSendResult>;
  abstract verifyDomain(domain: string): Promise<DomainVerification>;
  abstract getDomainStatus(domain: string): Promise<DomainVerification>;
  abstract getEmailAnalytics(emailId: string): Promise<EmailAnalytics>;
  abstract handleWebhook(payload: any, signature?: string): Promise<EmailEvent[]>;
  abstract testConnection(): Promise<boolean>;

  /**
   * Process merge tags in email content
   */
  protected processMergeTags(content: EmailContent, data: Record<string, any>): EmailContent {
    const { replaceMergeTags } = require('../merge-tags/parser');
    
    return {
      subject: replaceMergeTags(content.subject, data),
      html: replaceMergeTags(content.html, data),
      text: content.text ? replaceMergeTags(content.text, data) : undefined
    };
  }

  /**
   * Add tracking pixels and click tracking
   */
  protected addTracking(html: string, emailId: string, trackOpens = true, trackClicks = true): string {
    let trackedHtml = html;

    if (trackOpens) {
      const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_BASE_URL}/api/email/track/open/${emailId}" width="1" height="1" style="display:none;" alt="" />`;
      trackedHtml += trackingPixel;
    }

    if (trackClicks) {
      // Replace all links with tracking links
      trackedHtml = trackedHtml.replace(
        /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
        (match, before, url, after) => {
          const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/email/track/click/${emailId}?url=${encodeURIComponent(url)}`;
          return `<a ${before}href="${trackingUrl}"${after}>`;
        }
      );
    }

    return trackedHtml;
  }

  /**
   * Validate email addresses
   */
  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Generate unique email ID
   */
  protected generateEmailId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}