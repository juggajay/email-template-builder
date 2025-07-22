import juice from 'juice';
import JSZip from 'jszip';
import type { EmailTemplate, ExportType } from '@/types';

export interface ExportResult {
  success: boolean;
  data?: any;
  error?: string;
  downloadUrl?: string;
}

export interface ExportOptions {
  inlineCSS?: boolean;
  minify?: boolean;
  preserveMediaQueries?: boolean;
  preserveFontFaces?: boolean;
  preserveKeyFrames?: boolean;
  preservePseudos?: boolean;
}

/**
 * Inline CSS into HTML for better email client compatibility
 */
export const inlineCSS = (html: string, options: ExportOptions = {}): string => {
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
};

/**
 * Clean and optimize HTML for email clients
 */
const cleanEmailHTML = (html: string): string => {
  // First inline the CSS
  html = inlineCSS(html);
  
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove link tags (except stylesheets)
  html = html.replace(/<link(?![^>]*rel="stylesheet")[^>]*>/gi, '');
  
  // Add email-safe DOCTYPE if not present
  if (!html.includes('<!DOCTYPE')) {
    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' + html;
  }
  
  return html;
};

/**
 * Export email template as HTML with inline CSS
 */
export const exportToHTML = async (template: EmailTemplate): Promise<ExportResult> => {
  try {
    if (!template.html_content) {
      return {
        success: false,
        error: 'Template has no HTML content to export',
      };
    }

    // Clean and optimize HTML for email clients (includes CSS inlining)
    const cleanedHTML = cleanEmailHTML(template.html_content);
    
    // Create a blob with the HTML content
    const blob = new Blob([cleanedHTML], { type: 'text/html' });
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

/**
 * Export email template as ZIP file
 */
export const exportToZip = async (template: EmailTemplate): Promise<ExportResult> => {
  try {
    const zip = new JSZip();
    
    // Add HTML file with inlined CSS
    if (template.html_content) {
      const inlinedHtml = cleanEmailHTML(template.html_content);
      zip.file('email.html', inlinedHtml);
    }
    
    // Add design JSON for re-importing
    if (template.json_design) {
      zip.file('design.json', JSON.stringify(template.json_design, null, 2));
    }
    
    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    const downloadUrl = URL.createObjectURL(blob);
    
    return {
      success: true,
      downloadUrl,
      data: {
        filename: `${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`,
        size: blob.size,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ZIP export failed',
    };
  }
};

/**
 * Export to specific email platform with CSS inlining
 */
export const exportToPlatform = async (
  template: EmailTemplate,
  platform: ExportType,
  credentials: Record<string, any>
): Promise<ExportResult> => {
  try {
    // First inline CSS for all platforms
    let processedHtml = template.html_content || '';
    processedHtml = inlineCSS(processedHtml, {
      preserveMediaQueries: true,
      preserveFontFaces: true,
    });
    
    // Update template with processed HTML
    const processedTemplate = { ...template, html_content: processedHtml };
    
    switch (platform) {
      case 'klaviyo':
        return exportToKlaviyo(processedTemplate, credentials as { apiKey: string });
      case 'mailchimp':
        return exportToMailchimp(processedTemplate, credentials as { apiKey: string });
      case 'shopify':
        return exportToShopify(processedTemplate, credentials as { accessToken: string; shop: string });
      case 'omnisend':
        return exportToOmnisend(processedTemplate, credentials as { apiKey: string });
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

/**
 * Extract plain text from HTML
 */
const extractTextFromHTML = (html: string): string => {
  // Simple HTML to text conversion
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Platform-specific export functions (existing code continues...)
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
  // Shopify implementation
  return {
    success: false,
    error: 'Shopify export not yet implemented',
  };
};

const exportToOmnisend = async (
  template: EmailTemplate,
  credentials: { apiKey: string }
): Promise<ExportResult> => {
  // Omnisend implementation
  return {
    success: false,
    error: 'Omnisend export not yet implemented',
  };
};