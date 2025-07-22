/**
 * Different CSS inlining strategies for various use cases
 */
export const inliningStrategies = {
  // Standard inlining - keeps media queries and classes (RECOMMENDED)
  standard: {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    preserveKeyFrames: true,
    preservePseudos: false,
    removeStyleTags: false,
    preserveImportant: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
  },
  
  // Aggressive inlining - removes ALL style tags and classes
  aggressive: {
    preserveMediaQueries: false,
    preserveFontFaces: false,
    preserveKeyFrames: false,
    preservePseudos: false,
    removeStyleTags: true,
    preserveImportant: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
    removeHtmlSelectors: true, // Removes classes and IDs
  },
  
  // Mobile-friendly - keeps only essential media queries
  mobileFriendly: {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    preserveKeyFrames: false,
    preservePseudos: false,
    removeStyleTags: false,
    preserveImportant: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
  },
  
  // Platform-specific optimizations
  outlook: {
    preserveMediaQueries: false, // Outlook doesn't support media queries
    preserveFontFaces: true,
    preserveKeyFrames: false,
    preservePseudos: false,
    removeStyleTags: false,
    preserveImportant: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
    // Add Outlook-specific attributes
    applyTableAttributes: true,
  },
  
  gmail: {
    preserveMediaQueries: true,
    preserveFontFaces: true,
    preserveKeyFrames: false,
    preservePseudos: false,
    removeStyleTags: false,
    preserveImportant: true,
    applyWidthAttributes: true,
    applyHeightAttributes: true,
    applyAttributesTableElements: true,
  },
};

/**
 * Enhanced Email Export Service with strategy options
 */
export class EnhancedEmailExportService {
  /**
   * Export with specific inlining strategy
   */
  static async exportWithStrategy(
    html: string, 
    strategy: keyof typeof inliningStrategies = 'standard'
  ): Promise<string> {
    const juice = require('juice');
    const options = inliningStrategies[strategy];
    
    try {
      let processedHtml = juice(html, options);
      
      // Additional processing for aggressive mode
      if (strategy === 'aggressive') {
        // Remove all class attributes
        processedHtml = processedHtml.replace(/\sclass="[^"]*"/g, '');
        // Remove all id attributes
        processedHtml = processedHtml.replace(/\sid="[^"]*"/g, '');
        // Remove empty style tags
        processedHtml = processedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
      }
      
      return processedHtml;
    } catch (error) {
      console.error('Error inlining CSS:', error);
      return html;
    }
  }
  
  /**
   * Analyze HTML to recommend best inlining strategy
   */
  static analyzeAndRecommend(html: string): {
    recommended: keyof typeof inliningStrategies;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let recommended: keyof typeof inliningStrategies = 'standard';
    
    // Check for media queries
    if (html.includes('@media')) {
      reasons.push('Contains media queries for responsive design');
    }
    
    // Check for animations
    if (html.includes('@keyframes')) {
      reasons.push('Contains animations (not supported in most email clients)');
      recommended = 'aggressive';
    }
    
    // Check for pseudo-selectors
    if (html.includes(':hover') || html.includes(':active')) {
      reasons.push('Contains pseudo-selectors (limited email support)');
    }
    
    // Check for Outlook conditional comments
    if (html.includes('<!--[if mso]')) {
      reasons.push('Contains Outlook-specific code');
      if (!html.includes('@media')) {
        recommended = 'outlook';
      }
    }
    
    return { recommended, reasons };
  }
  
  /**
   * Validate email HTML after inlining
   */
  static validateInlinedHTML(html: string): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check for remaining external styles
    if (html.includes('<link') && html.includes('stylesheet')) {
      errors.push('External stylesheets found - not supported in email');
    }
    
    // Check for scripts
    if (html.includes('<script')) {
      errors.push('JavaScript found - not supported in email');
    }
    
    // Check for unsupported HTML5 elements
    const unsupportedElements = ['<video', '<audio', '<canvas', '<svg'];
    unsupportedElements.forEach(element => {
      if (html.includes(element)) {
        errors.push(`${element} tag found - not widely supported in email`);
      }
    });
    
    // Check inline style length (some clients have limits)
    const inlineStyleMatches = html.match(/style="[^"]+"/g) || [];
    inlineStyleMatches.forEach((styleAttr, index) => {
      if (styleAttr.length > 8000) {
        warnings.push(`Very long inline style found (${styleAttr.length} chars) - may be truncated in some clients`);
      }
    });
    
    // Check total HTML size
    const htmlSize = new Blob([html]).size;
    if (htmlSize > 102400) { // 100KB
      warnings.push(`HTML size is ${Math.round(htmlSize / 1024)}KB - some clients clip emails over 100KB`);
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  }
}