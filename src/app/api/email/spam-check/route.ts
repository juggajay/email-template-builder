import { NextRequest, NextResponse } from 'next/server';
import { DeliverabilityOptimizer } from '@/lib/email/deliverability-optimizer';
import { withRateLimit, rateLimiters } from '@/lib/security/rate-limit';
import { validateRequestBody, schemas } from '@/lib/security/validation';
import { z } from 'zod';

// Request schema
const spamCheckSchema = z.object({
  html: z.string().min(1).max(1000000), // Max 1MB
  optimize: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = await withRateLimit(request, rateLimiters.api);
  if (rateLimitResult) return rateLimitResult;

  try {
    // Validate request body
    const { data, error } = await validateRequestBody(request, spamCheckSchema);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    const { html, optimize } = data;

    // Validate the email
    const validation = DeliverabilityOptimizer.validateEmail(html);
    
    // Calculate spam score (0-100, lower is better)
    const spamScore = calculateSpamScore(html, validation);
    
    // Get deliverability score (0-100, higher is better)
    const deliverabilityScore = Math.max(0, 100 - spamScore);
    
    let optimizedHtml = null;
    let optimizedValidation = null;
    
    // Optimize if requested
    if (optimize) {
      const optimizationResult = await DeliverabilityOptimizer.optimizeForDeliverability(html);
      optimizedHtml = optimizationResult.html;
      optimizedValidation = DeliverabilityOptimizer.validateEmail(optimizedHtml);
    }

    return NextResponse.json({
      original: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        spamScore,
        deliverabilityScore,
      },
      optimized: optimize ? {
        html: optimizedHtml,
        validation: optimizedValidation,
        spamScore: calculateSpamScore(optimizedHtml!, optimizedValidation!),
        deliverabilityScore: Math.max(0, 100 - calculateSpamScore(optimizedHtml!, optimizedValidation!)),
      } : null,
      recommendations: getRecommendations(validation, spamScore),
    });
  } catch (error) {
    console.error('Spam check error:', error);
    return NextResponse.json(
      { error: 'Failed to check spam score' },
      { status: 500 }
    );
  }
}

function calculateSpamScore(
  html: string, 
  validation: { errors: string[]; warnings: string[] }
): number {
  let score = 0;
  
  // Base penalties
  score += validation.errors.length * 15;
  score += validation.warnings.length * 5;
  
  const htmlLower = html.toLowerCase();
  
  // Check for spam phrases (more comprehensive)
  const spamPhrases = [
    { phrase: 'click here', penalty: 10 },
    { phrase: 'buy now', penalty: 10 },
    { phrase: 'limited time', penalty: 8 },
    { phrase: 'act now', penalty: 8 },
    { phrase: 'free', penalty: 5 },
    { phrase: 'guarantee', penalty: 5 },
    { phrase: 'no obligation', penalty: 5 },
    { phrase: 'winner', penalty: 10 },
    { phrase: 'urgent', penalty: 8 },
    { phrase: 'order now', penalty: 8 },
    { phrase: 'special promotion', penalty: 5 },
    { phrase: 'this is not spam', penalty: 15 },
    { phrase: 'increase sales', penalty: 8 },
    { phrase: 'online marketing', penalty: 5 },
    { phrase: 'multi level marketing', penalty: 20 },
    { phrase: 'compare rates', penalty: 5 },
    { phrase: 'lowest price', penalty: 5 },
    { phrase: 'risk free', penalty: 5 },
    { phrase: 'satisfaction guaranteed', penalty: 5 },
    { phrase: 'congratulations', penalty: 10 },
    { phrase: 'dear friend', penalty: 8 },
  ];
  
  spamPhrases.forEach(({ phrase, penalty }) => {
    if (htmlLower.includes(phrase)) {
      score += penalty;
    }
  });
  
  // Check for ALL CAPS (spam indicator)
  const capsMatches = html.match(/[A-Z]{5,}/g) || [];
  score += capsMatches.length * 3;
  
  // Check for excessive punctuation
  const exclamationCount = (html.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    score += exclamationCount * 2;
  }
  
  // Check for money symbols
  const moneySymbols = (html.match(/[$£€¥]/g) || []).length;
  score += moneySymbols * 2;
  
  // Check image to text ratio
  const imageCount = (html.match(/<img/gi) || []).length;
  const textLength = html.replace(/<[^>]*>/g, '').length;
  if (textLength < 500 && imageCount > 3) {
    score += 10; // Too many images, not enough text
  }
  
  // Missing unsubscribe link (CAN-SPAM violation)
  if (!htmlLower.includes('unsubscribe')) {
    score += 20;
  }
  
  // Check for hidden text (common spam tactic)
  if (html.includes('display:none') || html.includes('visibility:hidden')) {
    score += 15;
  }
  
  // Check for tiny fonts (spam tactic)
  if (html.includes('font-size:0') || html.includes('font-size:1px')) {
    score += 10;
  }
  
  return Math.min(100, score); // Cap at 100
}

function getRecommendations(
  validation: { errors: string[]; warnings: string[] },
  spamScore: number
): string[] {
  const recommendations: string[] = [];
  
  if (spamScore > 50) {
    recommendations.push('High spam score detected. Consider removing promotional language.');
  }
  
  if (validation.errors.length > 0) {
    recommendations.push('Fix critical errors before sending.');
  }
  
  if (validation.warnings.length > 3) {
    recommendations.push('Address warnings to improve deliverability.');
  }
  
  // Specific recommendations based on common issues
  validation.errors.forEach(error => {
    if (error.includes('unsubscribe')) {
      recommendations.push('Add a clear unsubscribe link to comply with CAN-SPAM laws.');
    }
    if (error.includes('JavaScript')) {
      recommendations.push('Remove all JavaScript - it\'s not supported in emails.');
    }
    if (error.includes('Form')) {
      recommendations.push('Remove form elements - use links to web forms instead.');
    }
  });
  
  validation.warnings.forEach(warning => {
    if (warning.includes('spam trigger')) {
      recommendations.push('Consider rephrasing to avoid spam trigger words.');
    }
    if (warning.includes('alt text')) {
      recommendations.push('Add descriptive alt text to all images.');
    }
    if (warning.includes('size')) {
      recommendations.push('Reduce email size for faster loading.');
    }
  });
  
  // General best practices
  if (recommendations.length === 0) {
    recommendations.push('Email looks good! Consider testing across different email clients.');
  }
  
  return recommendations;
}