export interface DeliverabilityIssue {
  type: 'critical' | 'warning' | 'suggestion';
  category: string;
  message: string;
  impact: number;
}

export interface DeliverabilityScore {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  issues: DeliverabilityIssue[];
  passesThreshold: boolean;
}

export class EmailDeliverabilityAnalyzer {
  private spamWords = [
    'free', 'guarantee', 'no obligation', 'risk-free', 'bonus', 'discount',
    'earn', 'extra income', 'make money', 'million', 'dollars', 'price',
    'credit', 'loan', 'debt', 'refinance', 'mortgage', 'insurance',
    'viagra', 'pharmacy', 'medication', 'cure', 'lose weight', 'diet',
    'winner', 'congratulations', 'click here', 'urgent', 'act now',
    'limited time', 'order now', 'buy now', 'get it now', 'instant',
    'access', 'avoid', 'bankruptcy', 'boss', 'cancel', 'card accepted',
    'certified', 'cheap', 'compare', 'deal', 'direct email', 'fantastic',
    'full refund', 'get paid', 'giving away', 'hidden', 'income', 'increase',
    'incredible', 'investment', 'junk', 'luxury', 'marketing', 'mass email',
    'meet singles', 'multi-level', 'nigerian', 'offer', 'online income',
    'opportunity', 'opt in', 'performance', 'priority mail', 'profit',
    'promise', 'pure', 'rates', 'refinance', 'remove', 'reserves the right',
    'reverses aging', 'satisfaction', 'save', 'score', 'serious', 'shopping',
    'sign up', 'spam', 'special', 'stop', 'subscribe', 'success', 'supplies',
    'take action', 'terms', 'trial', 'unlimited', 'unsubscribe', 'verification',
    'warranty', 'web traffic', 'weight', 'while supplies last', 'why pay more',
    'work from home', 'you have been selected'
  ];

  private excessivePunctuationRegex = /[!?]{2,}|\.{4,}/g;
  private allCapsRegex = /\b[A-Z]{5,}\b/g;
  private urlRegex = /(https?:\/\/[^\s]+)/gi;
  private emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;

  analyzeEmail(
    html: string,
    plainText: string,
    subject: string,
    fromEmail?: string,
    fromName?: string
  ): DeliverabilityScore {
    const issues: DeliverabilityIssue[] = [];
    let totalScore = 100;

    // Content checks
    this.checkSpamWords(html, subject, issues);
    this.checkImageToTextRatio(html, issues);
    this.checkLinks(html, issues);
    this.checkPlainText(html, plainText, issues);
    this.checkUnsubscribeLink(html, plainText, issues);
    this.checkSubjectLine(subject, issues);
    this.checkHtmlStructure(html, issues);
    this.checkAuthentication(fromEmail, fromName, issues);
    this.checkPersonalization(html, issues);
    this.checkMobileResponsiveness(html, issues);

    // Calculate final score
    issues.forEach(issue => {
      totalScore -= issue.impact;
    });

    totalScore = Math.max(0, Math.min(100, totalScore));

    return {
      score: totalScore,
      grade: this.calculateGrade(totalScore),
      issues,
      passesThreshold: totalScore >= 70
    };
  }

  private checkSpamWords(html: string, subject: string, issues: DeliverabilityIssue[]): void {
    const content = (html + ' ' + subject).toLowerCase();
    const foundSpamWords = this.spamWords.filter(word => 
      content.includes(word.toLowerCase())
    );

    if (foundSpamWords.length > 10) {
      issues.push({
        type: 'critical',
        category: 'Spam Content',
        message: `Found ${foundSpamWords.length} spam trigger words: ${foundSpamWords.slice(0, 5).join(', ')}...`,
        impact: 30
      });
    } else if (foundSpamWords.length > 5) {
      issues.push({
        type: 'warning',
        category: 'Spam Content',
        message: `Found ${foundSpamWords.length} potential spam words: ${foundSpamWords.join(', ')}`,
        impact: 15
      });
    } else if (foundSpamWords.length > 0) {
      issues.push({
        type: 'suggestion',
        category: 'Spam Content',
        message: `Consider removing spam words: ${foundSpamWords.join(', ')}`,
        impact: 5
      });
    }

    // Check for excessive capitalization
    const capsMatches = html.match(this.allCapsRegex);
    if (capsMatches && capsMatches.length > 3) {
      issues.push({
        type: 'warning',
        category: 'Formatting',
        message: 'Excessive use of ALL CAPS text',
        impact: 10
      });
    }

    // Check for excessive punctuation
    const punctuationMatches = html.match(this.excessivePunctuationRegex);
    if (punctuationMatches && punctuationMatches.length > 0) {
      issues.push({
        type: 'warning',
        category: 'Formatting',
        message: 'Excessive punctuation detected (!!!!, ????, etc.)',
        impact: 8
      });
    }
  }

  private checkImageToTextRatio(html: string, issues: DeliverabilityIssue[]): void {
    const textContent = html.replace(/<[^>]*>/g, '').trim();
    const imageCount = (html.match(/<img/gi) || []).length;
    const textLength = textContent.length;

    if (textLength < 100 && imageCount > 0) {
      issues.push({
        type: 'critical',
        category: 'Content Balance',
        message: 'Email appears to be mostly images with very little text',
        impact: 25
      });
    } else if (textLength < 500 && imageCount > 3) {
      issues.push({
        type: 'warning',
        category: 'Content Balance',
        message: 'Low text-to-image ratio detected',
        impact: 15
      });
    }

    // Check for images without alt text
    const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/gi) || []).length;
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'warning',
        category: 'Accessibility',
        message: `${imagesWithoutAlt} image(s) missing alt text`,
        impact: 5
      });
    }
  }

  private checkLinks(html: string, issues: DeliverabilityIssue[]): void {
    const links = html.match(this.urlRegex) || [];
    const uniqueDomains = new Set(
      links.map(link => {
        try {
          return new URL(link).hostname;
        } catch {
          return null;
        }
      }).filter(Boolean)
    );

    if (links.length > 20) {
      issues.push({
        type: 'warning',
        category: 'Links',
        message: `Too many links (${links.length}) in email`,
        impact: 10
      });
    }

    if (uniqueDomains.size > 5) {
      issues.push({
        type: 'warning',
        category: 'Links',
        message: `Links to ${uniqueDomains.size} different domains`,
        impact: 8
      });
    }

    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 't.co'];
    const hasShorteners = Array.from(uniqueDomains).some(domain => 
      shorteners.some(shortener => domain?.includes(shortener))
    );

    if (hasShorteners) {
      issues.push({
        type: 'warning',
        category: 'Links',
        message: 'URL shorteners detected (often flagged as spam)',
        impact: 15
      });
    }

    // Check for broken link patterns
    const suspiciousLinks = links.filter(link => 
      link.includes('127.0.0.1') || 
      link.includes('localhost') || 
      link.includes('example.com')
    );

    if (suspiciousLinks.length > 0) {
      issues.push({
        type: 'critical',
        category: 'Links',
        message: 'Test or broken links detected',
        impact: 20
      });
    }
  }

  private checkPlainText(html: string, plainText: string, issues: DeliverabilityIssue[]): void {
    if (!plainText || plainText.length < 10) {
      issues.push({
        type: 'critical',
        category: 'Plain Text',
        message: 'Missing plain text version',
        impact: 20
      });
    } else {
      const htmlText = html.replace(/<[^>]*>/g, '').trim();
      const similarity = this.calculateSimilarity(htmlText, plainText);
      
      if (similarity < 0.7) {
        issues.push({
          type: 'warning',
          category: 'Plain Text',
          message: 'Plain text version differs significantly from HTML',
          impact: 10
        });
      }
    }
  }

  private checkUnsubscribeLink(html: string, plainText: string, issues: DeliverabilityIssue[]): void {
    const hasUnsubscribe = 
      html.toLowerCase().includes('unsubscribe') || 
      plainText.toLowerCase().includes('unsubscribe');

    if (!hasUnsubscribe) {
      issues.push({
        type: 'critical',
        category: 'Compliance',
        message: 'No unsubscribe link found',
        impact: 25
      });
    }

    // Check for physical address (CAN-SPAM requirement)
    const hasAddress = 
      html.match(/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|circle|cir|boulevard|blvd)/i) ||
      plainText.match(/\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|circle|cir|boulevard|blvd)/i);

    if (!hasAddress) {
      issues.push({
        type: 'warning',
        category: 'Compliance',
        message: 'No physical address found (required by CAN-SPAM)',
        impact: 15
      });
    }
  }

  private checkSubjectLine(subject: string, issues: DeliverabilityIssue[]): void {
    if (!subject || subject.length === 0) {
      issues.push({
        type: 'critical',
        category: 'Subject Line',
        message: 'Missing subject line',
        impact: 30
      });
      return;
    }

    if (subject.length > 70) {
      issues.push({
        type: 'warning',
        category: 'Subject Line',
        message: `Subject line too long (${subject.length} characters)`,
        impact: 5
      });
    }

    if (subject === subject.toUpperCase() && subject.length > 5) {
      issues.push({
        type: 'warning',
        category: 'Subject Line',
        message: 'Subject line is all caps',
        impact: 10
      });
    }

    // Check for misleading prefixes
    const misleadingPrefixes = ['RE:', 'FW:', 'Fwd:', 'Reply:'];
    const hasPrefix = misleadingPrefixes.some(prefix => 
      subject.startsWith(prefix) && !subject.includes('actual')
    );

    if (hasPrefix) {
      issues.push({
        type: 'critical',
        category: 'Subject Line',
        message: 'Misleading RE: or FW: prefix in subject',
        impact: 20
      });
    }

    // Check for emoji overuse
    const emojiCount = (subject.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    if (emojiCount > 2) {
      issues.push({
        type: 'suggestion',
        category: 'Subject Line',
        message: 'Consider reducing emoji use in subject',
        impact: 3
      });
    }
  }

  private checkHtmlStructure(html: string, issues: DeliverabilityIssue[]): void {
    // Check for proper HTML structure
    if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
      issues.push({
        type: 'suggestion',
        category: 'HTML Structure',
        message: 'Missing proper HTML document structure',
        impact: 5
      });
    }

    // Check for table-based layout (recommended for email)
    const hasTables = html.includes('<table');
    const hasDivs = html.includes('<div');
    
    if (!hasTables && hasDivs) {
      issues.push({
        type: 'suggestion',
        category: 'HTML Structure',
        message: 'Consider using table-based layout for better email client compatibility',
        impact: 3
      });
    }

    // Check for JavaScript
    if (html.includes('<script') || html.includes('javascript:')) {
      issues.push({
        type: 'critical',
        category: 'HTML Structure',
        message: 'JavaScript detected (will be blocked by email clients)',
        impact: 15
      });
    }

    // Check for forms
    if (html.includes('<form') || html.includes('<input')) {
      issues.push({
        type: 'warning',
        category: 'HTML Structure',
        message: 'Forms detected (may not work in email clients)',
        impact: 10
      });
    }

    // Check for external stylesheets
    if (html.includes('<link') && html.includes('stylesheet')) {
      issues.push({
        type: 'warning',
        category: 'HTML Structure',
        message: 'External stylesheets detected (use inline CSS instead)',
        impact: 8
      });
    }
  }

  private checkAuthentication(fromEmail: string | undefined, fromName: string | undefined, issues: DeliverabilityIssue[]): void {
    if (fromEmail) {
      // Check for no-reply addresses
      if (fromEmail.toLowerCase().includes('noreply') || fromEmail.toLowerCase().includes('no-reply')) {
        issues.push({
          type: 'warning',
          category: 'Sender',
          message: 'Using no-reply address reduces engagement',
          impact: 10
        });
      }

      // Check for free email providers
      const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      const domain = fromEmail.split('@')[1]?.toLowerCase();
      
      if (domain && freeProviders.includes(domain)) {
        issues.push({
          type: 'warning',
          category: 'Sender',
          message: 'Using free email provider (consider using custom domain)',
          impact: 8
        });
      }
    }

    if (!fromName || fromName.length < 2) {
      issues.push({
        type: 'suggestion',
        category: 'Sender',
        message: 'Missing or short sender name',
        impact: 5
      });
    }
  }

  private checkPersonalization(html: string, issues: DeliverabilityIssue[]): void {
    const personalizationTags = [
      '{{', '}}', '{%', '%}', '[[', ']]', 
      '*|', '|*', '%%', '%%', '${', '}'
    ];

    const hasPersonalization = personalizationTags.some(tag => html.includes(tag));

    if (!hasPersonalization) {
      issues.push({
        type: 'suggestion',
        category: 'Personalization',
        message: 'No personalization detected (consider adding merge tags)',
        impact: 3
      });
    }
  }

  private checkMobileResponsiveness(html: string, issues: DeliverabilityIssue[]): void {
    const hasViewport = html.includes('viewport');
    const hasMediaQueries = html.includes('@media');
    const hasResponsiveImages = html.includes('max-width') && html.includes('100%');

    if (!hasViewport && !hasMediaQueries) {
      issues.push({
        type: 'warning',
        category: 'Mobile',
        message: 'Email may not be mobile-responsive',
        impact: 10
      });
    }

    // Check for fixed widths
    const fixedWidthPattern = /width\s*[:=]\s*["']?\d{3,}(?:px)?["']?/gi;
    const fixedWidths = html.match(fixedWidthPattern) || [];
    
    if (fixedWidths.length > 5) {
      issues.push({
        type: 'warning',
        category: 'Mobile',
        message: 'Multiple fixed widths detected (may cause mobile display issues)',
        impact: 8
      });
    }

    // Check for small font sizes
    const smallFontPattern = /font-size\s*:\s*(?:[0-9]|1[0-1])px/gi;
    const smallFonts = html.match(smallFontPattern) || [];
    
    if (smallFonts.length > 0) {
      issues.push({
        type: 'suggestion',
        category: 'Mobile',
        message: 'Small font sizes detected (minimum 14px recommended for mobile)',
        impact: 5
      });
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) {
      return 1.0;
    }
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  getRecommendations(score: DeliverabilityScore): string[] {
    const recommendations: string[] = [];

    if (score.score < 70) {
      recommendations.push('⚠️ Your email needs significant improvements before sending');
    }

    const criticalIssues = score.issues.filter(i => i.type === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push('🚨 Fix critical issues immediately to avoid spam filters');
    }

    const categories = [...new Set(score.issues.map(i => i.category))];
    
    if (categories.includes('Spam Content')) {
      recommendations.push('📝 Review and replace spam trigger words with alternatives');
    }

    if (categories.includes('Compliance')) {
      recommendations.push('⚖️ Ensure CAN-SPAM compliance with unsubscribe links and physical address');
    }

    if (categories.includes('Content Balance')) {
      recommendations.push('⚖️ Balance images with text content (aim for 60/40 text/image ratio)');
    }

    if (categories.includes('Mobile')) {
      recommendations.push('📱 Test email on mobile devices and use responsive design');
    }

    if (score.score >= 90) {
      recommendations.push('✅ Excellent! Your email is well-optimized for delivery');
    } else if (score.score >= 80) {
      recommendations.push('👍 Good job! Minor improvements can boost delivery rates');
    }

    return recommendations;
  }
}