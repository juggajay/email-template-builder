import type { EmailTemplate, ExportType } from '@/types';

export interface ExportResult {
  success: boolean;
  data?: any;
  error?: string;
  downloadUrl?: string;
}

export const exportToHTML = async (template: EmailTemplate): Promise<ExportResult> => {
  try {
    if (!template.html_content) {
      return {
        success: false,
        error: 'Template has no HTML content to export',
      };
    }

    // Clean and optimize HTML for email clients
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

export const exportToZip = async (template: EmailTemplate): Promise<ExportResult> => {
  try {
    // This would require a zip library like JSZip
    // For now, return HTML export
    return exportToHTML(template);
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
    switch (platform) {
      case 'klaviyo':
        return exportToKlaviyo(template, credentials as { apiKey: string });
      case 'mailchimp':
        return exportToMailchimp(template, credentials as { apiKey: string });
      case 'shopify':
        return exportToShopify(template, credentials as { accessToken: string; shop: string });
      case 'omnisend':
        return exportToOmnisend(template, credentials as { apiKey: string });
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

const cleanEmailHTML = (html: string): string => {
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove link tags (except stylesheets)
  html = html.replace(/<link(?![^>]*rel="stylesheet")[^>]*>/gi, '');
  
  // Inline CSS if needed
  // This is a simplified version - a real implementation would use a CSS inliner
  
  // Add email-safe DOCTYPE if not present
  if (!html.includes('<!DOCTYPE')) {
    html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' + html;
  }
  
  return html;
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