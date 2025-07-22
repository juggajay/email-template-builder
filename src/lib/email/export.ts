import juice from 'juice';
import JSZip from 'jszip';
import { toast } from 'sonner';
import type { EmailTemplate, ExportType } from '@/types';

export interface ExportOptions {
  inlineCSS?: boolean;
  minify?: boolean;
  preserveMediaQueries?: boolean;
  preserveFontFaces?: boolean;
  preserveKeyFrames?: boolean;
  preservePseudos?: boolean;
}

export interface ExportResult {
  success: boolean;
  data?: any;
  error?: string;
  downloadUrl?: string;
}

export class EmailExportService {
  /**
   * Inline CSS into HTML for better email client compatibility
   */
  static inlineCSS(html: string, options: ExportOptions = {}): string {
    const juiceOptions = {
      preserveMediaQueries: options.preserveMediaQueries ?? true,
      preserveFontFaces: options.preserveFontFaces ?? true,
      preserveKeyFrames: options.preserveKeyFrames ?? true,
      preservePseudos: options.preservePseudos ?? false,
      insertPreservedExtraCss: true,
      removeStyleTags: false,
      preserveImportant: true,
      applyWidthAttributes: true,
      applyHeightAttributes: true,
      applyAttributesTableElements: true,
      webResources: {
        relativeTo: process.cwd(),
      }
    };

    try {
      return juice(html, juiceOptions);
    } catch (error) {
      console.error('Error inlining CSS:', error);
      return html; // Return original HTML if inlining fails
    }
  }

  /**
   * Export email as HTML with inline CSS
   */
  static async exportAsHTML(html: string, options: ExportOptions = {}): Promise<string> {
    // Always inline CSS for email exports
    let processedHtml = this.inlineCSS(html, options);
    
    // Optionally minify
    if (options.minify) {
      processedHtml = this.minifyHTML(processedHtml);
    }

    return processedHtml;
  }

  /**
   * Export email as ZIP file containing HTML and assets
   */
  static async exportAsZip(html: string, design: any): Promise<Blob> {
    const zip = new JSZip();
    
    // Inline CSS before adding to ZIP
    const inlinedHtml = this.inlineCSS(html);
    
    // Add HTML file
    zip.file('email.html', inlinedHtml);
    
    // Add design JSON for re-importing
    zip.file('design.json', JSON.stringify(design, null, 2));
    
    // Generate ZIP
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Export for specific email platforms
   */
  static async exportForPlatform(
    html: string, 
    platform: 'klaviyo' | 'mailchimp' | 'sendgrid' | 'other',
    options: ExportOptions = {}
  ): Promise<string> {
    // Always inline CSS for email platforms
    let processedHtml = this.inlineCSS(html, options);

    // Platform-specific processing
    switch (platform) {
      case 'klaviyo':
        processedHtml = this.processForKlaviyo(processedHtml);
        break;
      case 'mailchimp':
        processedHtml = this.processForMailchimp(processedHtml);
        break;
      case 'sendgrid':
        processedHtml = this.processForSendGrid(processedHtml);
        break;
    }

    return processedHtml;
  }

  /**
   * Process HTML for Klaviyo
   */
  private static processForKlaviyo(html: string): string {
    // Replace merge tags with Klaviyo syntax
    return html
      .replace(/\{\{(\w+)\}\}/g, '{{ person.$1 }}')
      .replace(/\{\{product\.(\w+)\}\}/g, '{{ event.$1 }}');
  }

  /**
   * Process HTML for Mailchimp
   */
  private static processForMailchimp(html: string): string {
    // Replace merge tags with Mailchimp syntax
    return html
      .replace(/\{\{(\w+)\}\}/g, '*|$1|*')
      .replace(/\{\{product\.(\w+)\}\}/g, '*|PRODUCT:$1|*');
  }

  /**
   * Process HTML for SendGrid
   */
  private static processForSendGrid(html: string): string {
    // Replace merge tags with SendGrid syntax
    return html
      .replace(/\{\{(\w+)\}\}/g, '{{$1}}')
      .replace(/\{\{product\.(\w+)\}\}/g, '{{product.$1}}');
  }

  /**
   * Minify HTML
   */
  private static minifyHTML(html: string): string {
    return html
      .replace(/\n\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  /**
   * Validate email HTML
   */
  static validateEmailHTML(html: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for common email client issues
    if (html.includes('<script')) {
      errors.push('JavaScript is not supported in most email clients');
    }
    
    if (html.includes('<form')) {
      errors.push('Forms are not supported in most email clients');
    }
    
    if (html.includes('<iframe')) {
      errors.push('iFrames are not supported in email clients');
    }
    
    // Check for external stylesheets
    if (html.includes('<link') && html.includes('stylesheet')) {
      errors.push('External stylesheets should be inlined for better compatibility');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Legacy exports for backward compatibility
export const exportToHTML = async (template: EmailTemplate): Promise<ExportResult> => {
  try {
    if (!template.html_content) {
      return {
        success: false,
        error: 'Template has no HTML content to export',
      };
    }

    // Use new EmailExportService for CSS inlining
    const processedHTML = await EmailExportService.exportAsHTML(template.html_content);
    
    // Create a blob with the HTML content
    const blob = new Blob([processedHTML], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(blob);

    return {
      success: true,
      downloadUrl,
      data: {
        filename: `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`,
        size: blob.size,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
};

export const exportToZip = async (template: EmailTemplate, design?: any): Promise<ExportResult> => {
  try {
    if (!template.html_content) {
      return {
        success: false,
        error: 'Template has no HTML content to export',
      };
    }

    const zipBlob = await EmailExportService.exportAsZip(template.html_content, design || {});
    const downloadUrl = URL.createObjectURL(zipBlob);

    return {
      success: true,
      downloadUrl,
      data: {
        filename: `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`,
        size: zipBlob.size,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ZIP export failed',
    };
  }
};

export const exportToPlatform = async (
  template: EmailTemplate,
  platform: ExportType,
  credentials: Record<string, any>
): Promise<ExportResult> => {
  try {
    // First process the HTML for the platform
    const processedHTML = await EmailExportService.exportForPlatform(
      template.html_content || '',
      platform as any
    );

    switch (platform) {
      case 'klaviyo':
        return exportToKlaviyo({ ...template, html_content: processedHTML }, credentials as { apiKey: string });
      case 'mailchimp':
        return exportToMailchimp({ ...template, html_content: processedHTML }, credentials as { apiKey: string });
      case 'shopify':
        return exportToShopify({ ...template, html_content: processedHTML }, credentials as { accessToken: string; shop: string });
      case 'omnisend':
        return exportToOmnisend({ ...template, html_content: processedHTML }, credentials as { apiKey: string });
      default:
        return {
          success: false,
          error: `Platform ${platform} not supported`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Platform export failed',
    };
  }
};

const exportToKlaviyo = async (
  template: EmailTemplate,
  credentials: { apiKey: string }
): Promise<ExportResult> => {
  try {
    const response = await fetch('https://a.klaviyo.com/api/templates/', {
      method: 'POST',
      headers: {
        'Authorization': `Klaviyo-API-Key ${credentials.apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2023-10-15',
      },
      body: JSON.stringify({
        data: {
          type: 'template',
          attributes: {
            name: template.name,
            editor_type: 'SYSTEM',
            html: template.html_content,
            text: extractTextFromHTML(template.html_content || ''),
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        templateId: data.data.id,
        platform: 'klaviyo',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Klaviyo export failed',
    };
  }
};

const exportToMailchimp = async (
  template: EmailTemplate,
  credentials: { apiKey: string }
): Promise<ExportResult> => {
  try {
    // Extract datacenter from API key
    const datacenter = credentials.apiKey.split('-')[1];
    
    const response = await fetch(`https://${datacenter}.api.mailchimp.com/3.0/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${credentials.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: template.name,
        html: template.html_content,
        folder_id: '', // Optional: specify folder
      }),
    });

    if (!response.ok) {
      throw new Error(`Mailchimp API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        templateId: data.id,
        platform: 'mailchimp',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Mailchimp export failed',
    };
  }
};

const exportToShopify = async (
  template: EmailTemplate,
  credentials: { accessToken: string; shop: string }
): Promise<ExportResult> => {
  try {
    // Note: Shopify doesn't have a direct template API
    // This would typically involve creating a theme or using Shopify Email
    return {
      success: false,
      error: 'Shopify direct template upload not available. Please use manual import.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Shopify export failed',
    };
  }
};

const exportToOmnisend = async (
  template: EmailTemplate,
  credentials: { apiKey: string }
): Promise<ExportResult> => {
  try {
    const response = await fetch('https://api.omnisend.com/v3/campaigns', {
      method: 'POST',
      headers: {
        'X-API-KEY': credentials.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'email',
        name: template.name,
        subject: `Template: ${template.name}`,
        content: {
          html: template.html_content,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Omnisend API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        campaignId: data.campaignID,
        platform: 'omnisend',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Omnisend export failed',
    };
  }
};

const extractTextFromHTML = (html: string): string => {
  // Simple HTML to text conversion
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const copyHTMLToClipboard = async (html: string): Promise<void> => {
  try {
    // Use EmailExportService for CSS inlining
    const processedHTML = await EmailExportService.exportAsHTML(html);
    await navigator.clipboard.writeText(processedHTML);
    toast.success('HTML with inline CSS copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy HTML:', err);
    toast.error('Failed to copy. Please try again.');
    throw err;
  }
};