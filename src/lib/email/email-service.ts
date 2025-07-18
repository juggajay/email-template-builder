/**
 * Email service manager - coordinates between different providers
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
import { ResendProvider } from './resend-provider';
import { SendGridProvider } from './sendgrid-provider';

export type EmailProviderType = 'resend' | 'sendgrid';

export interface EmailServiceConfig {
  defaultProvider: EmailProviderType;
  providers: {
    resend?: ProviderConfig;
    sendgrid?: ProviderConfig;
  };
  fallbackProvider?: EmailProviderType;
  retryAttempts?: number;
  retryDelay?: number;
}

export class EmailService {
  private providers: Map<EmailProviderType, EmailProvider> = new Map();
  private config: EmailServiceConfig;

  constructor(config: EmailServiceConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize Resend provider
    if (this.config.providers.resend) {
      this.providers.set('resend', new ResendProvider(this.config.providers.resend));
    }

    // Initialize SendGrid provider
    if (this.config.providers.sendgrid) {
      this.providers.set('sendgrid', new SendGridProvider(this.config.providers.sendgrid));
    }
  }

  async sendEmail(
    options: SendEmailOptions, 
    providerType?: EmailProviderType
  ): Promise<SendEmailResult> {
    const provider = providerType || this.config.defaultProvider;
    const emailProvider = this.providers.get(provider);

    if (!emailProvider) {
      throw new Error(`Email provider ${provider} not configured`);
    }

    try {
      const result = await emailProvider.sendEmail(options);
      
      // If failed and we have a fallback provider, try it
      if (result.status === 'failed' && this.config.fallbackProvider && 
          this.config.fallbackProvider !== provider) {
        
        console.log(`Primary provider ${provider} failed, trying fallback ${this.config.fallbackProvider}`);
        return this.sendEmail(options, this.config.fallbackProvider);
      }

      return result;

    } catch (error) {
      console.error(`Email send failed with ${provider}:`, error);

      // Try fallback provider if available
      if (this.config.fallbackProvider && this.config.fallbackProvider !== provider) {
        console.log(`Trying fallback provider ${this.config.fallbackProvider}`);
        return this.sendEmail(options, this.config.fallbackProvider);
      }

      throw error;
    }
  }

  async sendBatch(
    options: BatchSendOptions, 
    providerType?: EmailProviderType
  ): Promise<BatchSendResult> {
    const provider = providerType || this.config.defaultProvider;
    const emailProvider = this.providers.get(provider);

    if (!emailProvider) {
      throw new Error(`Email provider ${provider} not configured`);
    }

    return emailProvider.sendBatch(options);
  }

  async sendTestEmail(
    to: string, 
    templateHtml: string, 
    templateData?: Record<string, any>,
    providerType?: EmailProviderType
  ): Promise<SendEmailResult> {
    const fromEmail = this.config.providers[providerType || this.config.defaultProvider]?.defaultFromEmail || 'test@example.com';
    const fromName = this.config.providers[providerType || this.config.defaultProvider]?.defaultFromName || 'Test Email';

    const options: SendEmailOptions = {
      from: { email: fromEmail, name: fromName },
      to: [{ email: to }],
      content: {
        subject: 'Test Email - Template Preview',
        html: templateHtml
      },
      templateData,
      trackOpens: true,
      trackClicks: true,
      tags: {
        type: 'test',
        template: 'preview'
      }
    };

    return this.sendEmail(options, providerType);
  }

  async verifyDomain(
    domain: string, 
    providerType?: EmailProviderType
  ): Promise<DomainVerification> {
    const provider = providerType || this.config.defaultProvider;
    const emailProvider = this.providers.get(provider);

    if (!emailProvider) {
      throw new Error(`Email provider ${provider} not configured`);
    }

    return emailProvider.verifyDomain(domain);
  }

  async getDomainStatus(
    domain: string, 
    providerType?: EmailProviderType
  ): Promise<DomainVerification> {
    const provider = providerType || this.config.defaultProvider;
    const emailProvider = this.providers.get(provider);

    if (!emailProvider) {
      throw new Error(`Email provider ${provider} not configured`);
    }

    return emailProvider.getDomainStatus(domain);
  }

  async getEmailAnalytics(
    emailId: string, 
    providerType?: EmailProviderType
  ): Promise<EmailAnalytics> {
    const provider = providerType || this.config.defaultProvider;
    const emailProvider = this.providers.get(provider);

    if (!emailProvider) {
      throw new Error(`Email provider ${provider} not configured`);
    }

    return emailProvider.getEmailAnalytics(emailId);
  }

  async handleWebhook(
    payload: any, 
    providerType: EmailProviderType, 
    signature?: string
  ): Promise<EmailEvent[]> {
    const emailProvider = this.providers.get(providerType);

    if (!emailProvider) {
      throw new Error(`Email provider ${providerType} not configured`);
    }

    return emailProvider.handleWebhook(payload, signature);
  }

  async testConnection(providerType?: EmailProviderType): Promise<boolean> {
    const provider = providerType || this.config.defaultProvider;
    const emailProvider = this.providers.get(provider);

    if (!emailProvider) {
      return false;
    }

    return emailProvider.testConnection();
  }

  async testAllConnections(): Promise<Record<EmailProviderType, boolean>> {
    const results: Record<EmailProviderType, boolean> = {} as any;

    const providerEntries = Array.from(this.providers.entries());
    for (const [providerType, provider] of providerEntries) {
      try {
        results[providerType] = await provider.testConnection();
      } catch {
        results[providerType] = false;
      }
    }

    return results;
  }

  getAvailableProviders(): EmailProviderType[] {
    return Array.from(this.providers.keys());
  }

  getProviderConfig(providerType: EmailProviderType): ProviderConfig | undefined {
    return this.config.providers[providerType];
  }

  updateProviderConfig(providerType: EmailProviderType, config: ProviderConfig): void {
    this.config.providers[providerType] = config;
    
    // Reinitialize the provider
    if (providerType === 'resend') {
      this.providers.set('resend', new ResendProvider(config));
    } else if (providerType === 'sendgrid') {
      this.providers.set('sendgrid', new SendGridProvider(config));
    }
  }
}

// Global email service instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    const config: EmailServiceConfig = {
      defaultProvider: (process.env.DEFAULT_EMAIL_PROVIDER as EmailProviderType) || 'resend',
      providers: {
        resend: process.env.RESEND_API_KEY ? {
          apiKey: process.env.RESEND_API_KEY,
          webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
          defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
          defaultFromName: process.env.DEFAULT_FROM_NAME
        } : undefined,
        sendgrid: process.env.SENDGRID_API_KEY ? {
          apiKey: process.env.SENDGRID_API_KEY,
          webhookSecret: process.env.SENDGRID_WEBHOOK_SECRET,
          defaultFromEmail: process.env.DEFAULT_FROM_EMAIL,
          defaultFromName: process.env.DEFAULT_FROM_NAME
        } : undefined
      },
      fallbackProvider: process.env.FALLBACK_EMAIL_PROVIDER as EmailProviderType,
      retryAttempts: 3,
      retryDelay: 1000
    };

    emailService = new EmailService(config);
  }

  return emailService;
}

// Helper function to validate email service configuration
export function validateEmailServiceConfig(): {
  isValid: boolean;
  errors: string[];
  providers: EmailProviderType[];
} {
  const errors: string[] = [];
  const providers: EmailProviderType[] = [];

  if (!process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
    errors.push('No email provider API keys configured');
  }

  if (process.env.RESEND_API_KEY) {
    providers.push('resend');
  }

  if (process.env.SENDGRID_API_KEY) {
    providers.push('sendgrid');
  }

  if (!process.env.DEFAULT_FROM_EMAIL) {
    errors.push('DEFAULT_FROM_EMAIL environment variable not set');
  }

  return {
    isValid: errors.length === 0,
    errors,
    providers
  };
}