/**
 * Mock email service for testing without API keys
 */

import { SendEmailResult } from './providers';

export class MockEmailService {
  async sendTestEmail(
    to: string,
    templateHtml: string,
    templateData?: Record<string, any>,
    providerType?: string
  ): Promise<SendEmailResult> {
    console.log('Mock email service - simulating email send:', {
      to,
      provider: providerType || 'mock',
      hasTemplate: !!templateHtml,
      hasData: !!templateData
    });

    // Simulate successful send
    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      status: 'sent',
      provider: providerType || 'mock',
      timestamp: new Date()
    };
  }

  async testConnection(): Promise<boolean> {
    return true;
  }
}

// Export a function to get the mock service
export function getMockEmailService() {
  return new MockEmailService();
}