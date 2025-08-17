import juice from 'juice';
import { minify } from 'html-minifier-terser';

export interface OptimizationOptions {
  minifyHtml?: boolean;
  removeComments?: boolean;
  inlineAllStyles?: boolean;
  optimizeForOutlook?: boolean;
  addPlainText?: boolean;
  validateLinks?: boolean;
  checkSpamScore?: boolean;
}

export interface OptimizationResult {
  html: string;
  warnings: string[];
  spamScore?: number;
  recommendations?: string[];
}

export class DeliverabilityOptimizer {
  /**
   * Optimize HTML for maximum email deliverability
   */
  static async optimizeForDeliverability(
    html: string, 
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // 1. Inline all CSS for better compatibility
    let optimized = juice(html, {
      preserveMediaQueries: false, // Remove media queries - use table layouts instead
      preserveFontFaces: true,
      removeStyleTags: true, // Remove all <style> tags after inlining
      preserveImportant: true,
      applyWidthAttributes: true,
      applyHeightAttributes: true,
      applyAttributesTableElements: true,
      preserveKeyFrames: false, // Animations don't work in most email clients
      preservePseudos: false, // Pseudo-selectors don't work in most email clients
    });
    
    // 2. Remove problematic elements that trigger spam filters
    const removalResult = this.removeProblematicElements(optimized);
    optimized = removalResult.html;
    warnings.push(...removalResult.warnings);
    
    // 3. Add required email headers for proper rendering
    optimized = this.addEmailHeaders(optimized);
    
    // 4. Optimize images for better deliverability
    const imageResult = this.optimizeImages(optimized);
    optimized = imageResult.html;
    recommendations.push(...imageResult.recommendations);
    
    // 5. Fix common compatibility issues
    optimized = this.fixCommonIssues(optimized);
    
    // 6. Add MSO (Microsoft Outlook) specific fixes
    if (options.optimizeForOutlook !== false) {
      optimized = this.addOutlookFixes(optimized);
    }
    
    // 7. Validate and fix links
    if (options.validateLinks !== false) {
      const linkResult = this.validateAndFixLinks(optimized);
      optimized = linkResult.html;
      warnings.push(...linkResult.warnings);
    }
    
    // 8. Check for spam triggers
    const spamCheck = this.checkSpamTriggers(optimized);
    warnings.push(...spamCheck.warnings);
    recommendations.push(...spamCheck.recommendations);
    
    // 9. Minify HTML if requested
    if (options.minifyHtml) {
      optimized = await this.minifyHtml(optimized);
    }
    
    // 10. Calculate spam score
    const spamScore = options.checkSpamScore ? this.calculateSpamScore(optimized) : undefined;
    
    return {
      html: optimized,
      warnings,
      spamScore,
      recommendations: recommendations.length > 0 ? recommendations : undefined
    };
  }
  
  private static removeProblematicElements(html: string): { html: string; warnings: string[] } {
    const warnings: string[] = [];
    
    // Check for problematic elements before removing
    if (html.includes('<script')) {
      warnings.push('JavaScript detected and removed - not supported in emails');
    }
    if (html.includes('<form')) {
      warnings.push('Forms detected and removed - trigger spam filters');
    }
    if (html.includes('<iframe')) {
      warnings.push('iFrames detected and removed - major spam flag');
    }
    if (html.includes('<video') || html.includes('<audio')) {
      warnings.push('Video/audio elements detected and removed - not supported');
    }
    
    const cleaned = html
      // Remove JavaScript (critical for deliverability)
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove forms (spam trigger)
      .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
      // Remove iframes (major spam flag)
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      // Remove comments (reduce size)
      .replace(/<!--[\s\S]*?-->/g, '')
      // Remove video/audio tags
      .replace(/<(video|audio)\b[^<]*(?:(?!<\/(video|audio)>)<[^<]*)*<\/(video|audio)>/gi, '')
      // Remove object/embed tags
      .replace(/<(object|embed)\b[^<]*(?:(?!<\/(object|embed)>)<[^<]*)*<\/(object|embed)>/gi, '')
      // Remove canvas elements
      .replace(/<canvas\b[^<]*(?:(?!<\/canvas>)<[^<]*)*<\/canvas>/gi, '')
      // Remove SVG animations
      .replace(/<animate[^>]*>/gi, '')
      .replace(/<animateTransform[^>]*>/gi, '');
    
    return { html: cleaned, warnings };
  }
  
  private static addEmailHeaders(html: string): string {
    // Ensure proper DOCTYPE for email
    if (!html.includes('<!DOCTYPE')) {
      html = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">\n' + html;
    }
    
    // Add xmlns for better compatibility
    if (!html.includes('xmlns=')) {
      html = html.replace('<html', '<html xmlns="http://www.w3.org/1999/xhtml"');
    }
    
    // Add essential meta tags for proper rendering
    const metaTags = `
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="format-detection" content="date=no" />
      <meta name="format-detection" content="address=no" />
      <meta name="format-detection" content="email=no" />
      <meta name="x-apple-disable-message-reformatting" />
      <!--[if !mso]><!-->
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <!--<![endif]-->
    `;
    
    // Only add meta tags if they don't exist
    if (!html.includes('Content-Type')) {
      html = html.replace('<head>', '<head>' + metaTags);
    }
    
    return html;
  }
  
  private static optimizeImages(html: string): { html: string; recommendations: string[] } {
    const recommendations: string[] = [];
    let imageCount = 0;
    
    // Count images
    const imgMatches = html.match(/<img[^>]*>/gi);
    if (imgMatches) {
      imageCount = imgMatches.length;
      if (imageCount > 10) {
        recommendations.push(`High image count (${imageCount}) - consider reducing for better deliverability`);
      }
    }
    
    // Add alt text to all images (accessibility and spam scores)
    html = html.replace(/<img(?![^>]*alt=)[^>]*>/gi, (match) => {
      return match.replace('<img', '<img alt="Image"');
    });
    
    // Ensure images have width and height for better rendering
    html = html.replace(/<img(?![^>]*width=)[^>]*>/gi, (match) => {
      if (!match.includes('width=')) {
        match = match.replace('<img', '<img width="600" style="max-width:100%;"');
      }
      return match;
    });
    
    // Add display:block to images to fix gaps in some clients
    html = html.replace(/<img([^>]*)style="([^"]*)"([^>]*)>/gi, (match, pre, style, post) => {
      if (!style.includes('display')) {
        style = style + '; display:block';
      }
      return `<img${pre}style="${style}"${post}>`;
    });
    
    // Check for base64 images (bad for deliverability)
    if (html.includes('data:image')) {
      recommendations.push('Base64 images detected - host images externally for better deliverability');
    }
    
    return { html, recommendations };
  }
  
  private static fixCommonIssues(html: string): string {
    return html
      // Fix relative URLs
      .replace(/href="\/([^"]+)"/gi, 'href="https://yourdomain.com/$1"')
      .replace(/src="\/([^"]+)"/gi, 'src="https://yourdomain.com/$1"')
      // Remove empty paragraphs and divs
      .replace(/<p[^>]*>[\s&nbsp;]*<\/p>/gi, '')
      .replace(/<div[^>]*>[\s&nbsp;]*<\/div>/gi, '')
      // Fix line-height issues
      .replace(/line-height:\s*([0-9.]+)(?!px|%|em)/gi, 'line-height: $1em')
      // Ensure table cells have explicit alignment
      .replace(/<td(?![^>]*align)/gi, '<td align="left"')
      // Add table role for accessibility
      .replace(/<table(?![^>]*role)/gi, '<table role="presentation"')
      // Fix margin and padding for Outlook
      .replace(/margin:\s*0\s*auto/gi, 'margin: 0 auto')
      // Remove min-width (not supported in many clients)
      .replace(/min-width:[^;]+;/gi, '')
      // Convert rem units to px (better support)
      .replace(/([0-9.]+)rem/gi, (match, value) => {
        return (parseFloat(value) * 16) + 'px';
      });
  }
  
  private static addOutlookFixes(html: string): string {
    // Add MSO conditional styles
    const msoStyles = `
      <!--[if mso]>
      <style type="text/css">
        table { border-collapse: collapse; border-spacing: 0; margin: 0; }
        div, td { padding: 0; }
        div { margin: 0 !important; }
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; }
      </style>
      <![endif]-->
    `;
    
    // Add MSO styles if not present
    if (!html.includes('<!--[if mso]>')) {
      html = html.replace('</head>', msoStyles + '</head>');
    }
    
    // Wrap content in MSO conditional table for centering
    const bodyContent = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyContent && bodyContent[1]) {
      const wrappedContent = `
        <!--[if mso]>
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
        <tr>
        <td>
        <![endif]-->
        ${bodyContent[1]}
        <!--[if mso]>
        </td>
        </tr>
        </table>
        <![endif]-->
      `;
      html = html.replace(bodyContent[1], wrappedContent);
    }
    
    return html;
  }
  
  private static validateAndFixLinks(html: string): { html: string; warnings: string[] } {
    const warnings: string[] = [];
    
    // Check for broken or suspicious links
    const linkMatches = html.match(/href="([^"]*)"/gi);
    if (linkMatches) {
      linkMatches.forEach(link => {
        const url = link.match(/href="([^"]*)"/i)?.[1];
        if (url) {
          // Check for URL shorteners (spam flag)
          if (url.match(/bit\.ly|tinyurl|goo\.gl|ow\.ly|buff\.ly/i)) {
            warnings.push(`URL shortener detected: ${url} - may trigger spam filters`);
          }
          // Check for missing protocol
          if (!url.startsWith('http') && !url.startsWith('mailto:') && !url.startsWith('tel:') && !url.startsWith('#')) {
            html = html.replace(`href="${url}"`, `href="https://${url}"`);
          }
        }
      });
    }
    
    // Add tracking parameters if needed
    html = html.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
      if (!url.includes('utm_') && !url.includes('mailto:') && !url.includes('tel:')) {
        const separator = url.includes('?') ? '&' : '?';
        return `href="${url}${separator}utm_source=email&utm_medium=email"`;
      }
      return match;
    });
    
    return { html, warnings };
  }
  
  private static checkSpamTriggers(html: string): { warnings: string[]; recommendations: string[] } {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Check for common spam trigger words
    const spamWords = [
      'free', 'guarantee', 'no obligation', 'winner', 'prize', 'congratulations',
      'click here', 'act now', 'urgent', 'limited time', 'special offer',
      'viagra', 'pharmacy', 'weight loss', 'make money', 'work from home'
    ];
    
    const htmlLower = html.toLowerCase();
    spamWords.forEach(word => {
      if (htmlLower.includes(word)) {
        warnings.push(`Spam trigger word detected: "${word}"`);
      }
    });
    
    // Check for excessive capitalization
    const capsMatches = html.match(/[A-Z]{5,}/g);
    if (capsMatches && capsMatches.length > 3) {
      warnings.push('Excessive capitalization detected - may trigger spam filters');
    }
    
    // Check for excessive exclamation marks
    const exclamationCount = (html.match(/!/g) || []).length;
    if (exclamationCount > 5) {
      warnings.push(`High exclamation mark count (${exclamationCount}) - reduce for better deliverability`);
    }
    
    // Check text to image ratio
    const textLength = html.replace(/<[^>]*>/g, '').length;
    const imageCount = (html.match(/<img/gi) || []).length;
    if (imageCount > 0 && textLength / imageCount < 100) {
      recommendations.push('Low text-to-image ratio - add more text content');
    }
    
    // Check for missing unsubscribe link
    if (!htmlLower.includes('unsubscribe')) {
      warnings.push('Missing unsubscribe link - required by law in many countries');
    }
    
    // Check for missing physical address
    if (!html.match(/\d+.*[a-z]+.*\d{5}/i)) {
      recommendations.push('Missing physical address - required by CAN-SPAM Act');
    }
    
    return { warnings, recommendations };
  }
  
  private static async minifyHtml(html: string): Promise<string> {
    try {
      return await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyAttributes: false, // Keep empty attributes for email clients
        removeRedundantAttributes: false, // Keep redundant attributes for compatibility
        minifyCSS: true,
        minifyJS: false, // No JS in emails
        processConditionalComments: false, // Keep MSO conditionals
      });
    } catch (error) {
      console.error('HTML minification failed:', error);
      return html; // Return original if minification fails
    }
  }
  
  private static calculateSpamScore(html: string): number {
    let score = 0;
    const maxScore = 10;
    
    // Positive factors (reduce spam score)
    if (html.includes('unsubscribe')) score -= 1;
    if (html.includes('<!DOCTYPE')) score -= 0.5;
    if (html.includes('alt=')) score -= 0.5;
    if (html.match(/\d+.*[a-z]+.*\d{5}/i)) score -= 1; // Physical address
    
    // Negative factors (increase spam score)
    const spamWords = ['free', 'guarantee', 'winner', 'click here', 'act now'];
    spamWords.forEach(word => {
      if (html.toLowerCase().includes(word)) score += 0.5;
    });
    
    if (html.includes('data:image')) score += 2; // Base64 images
    if ((html.match(/!/g) || []).length > 5) score += 1; // Excessive exclamation
    if (html.match(/[A-Z]{5,}/g)) score += 1; // Excessive caps
    if (html.includes('javascript:')) score += 3; // JavaScript links
    if (!html.includes('text/html; charset')) score += 1; // Missing charset
    
    // Text to HTML ratio
    const textLength = html.replace(/<[^>]*>/g, '').length;
    const htmlLength = html.length;
    if (textLength / htmlLength < 0.1) score += 2; // Too much HTML, not enough text
    
    // Normalize score to 0-10 range
    const normalizedScore = Math.max(0, Math.min(maxScore, score + 5));
    return Math.round(normalizedScore * 10) / 10;
  }
  
  /**
   * Generate a plain text version from HTML
   */
  static generatePlainText(html: string): string {
    return html
      // Remove style and script blocks
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // Convert breaks and paragraphs to newlines
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      // Convert links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$2 ($1)')
      // Remove all remaining HTML tags
      .replace(/<[^>]*>/g, '')
      // Convert HTML entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Clean up whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }
  
  /**
   * Validate email HTML for common issues
   */
  static validateEmail(html: string): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[];
    score: number;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Critical errors
    if (!html || html.trim().length === 0) {
      errors.push('Email content is empty');
    }
    
    if (html.includes('<script')) {
      errors.push('JavaScript is not supported in emails');
    }
    
    if (html.includes('<iframe')) {
      errors.push('iFrames are not supported in emails');
    }
    
    if (html.includes('<form')) {
      errors.push('Forms are not reliably supported in emails');
    }
    
    // Warnings
    if (!html.includes('<!DOCTYPE')) {
      warnings.push('Missing DOCTYPE declaration');
    }
    
    if (!html.includes('unsubscribe')) {
      warnings.push('Missing unsubscribe link (required by law)');
    }
    
    if (!html.includes('alt=')) {
      warnings.push('Images missing alt text');
    }
    
    if (html.includes('javascript:')) {
      errors.push('JavaScript protocols in links are blocked');
    }
    
    if (html.includes('min-width') || html.includes('max-width')) {
      warnings.push('Min/max-width not supported in all email clients');
    }
    
    if (html.includes('position:absolute') || html.includes('position:fixed')) {
      warnings.push('Absolute/fixed positioning not supported in emails');
    }
    
    // Calculate validation score
    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }
}