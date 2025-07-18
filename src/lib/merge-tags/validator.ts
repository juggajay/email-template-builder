/**
 * Validation system for merge tags in email templates
 */

import { parseMergeTag, findAllMergeTags, ParsedMergeTag } from './parser';
import { ConditionalBlock, evaluateConditionalBlock } from './conditional';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  tagPath?: string;
  location?: {
    line?: number;
    column?: number;
    context?: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    totalTags: number;
    uniqueTags: number;
    tagsWithFallbacks: number;
    conditionalBlocks: number;
  };
}

export interface ValidationOptions {
  requiredTags?: string[];
  availableTags?: string[];
  checkUnreachable?: boolean;
  sampleData?: Record<string, any>;
}

/**
 * Validate merge tags in a template
 */
export function validateTemplate(
  content: string,
  conditionalBlocks: ConditionalBlock[] = [],
  options: ValidationOptions = {}
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const allTags = findAllMergeTags(content);
  const uniqueTagPaths = new Set(allTags.map(tag => tag.tagPath));
  const tagsWithFallbacks = allTags.filter(tag => tag.fallbackValue !== undefined);

  // Check for invalid syntax
  const invalidTags = findInvalidSyntax(content);
  invalidTags.forEach(invalid => {
    issues.push({
      type: 'error',
      message: `Invalid merge tag syntax: ${invalid.tag}`,
      location: { context: invalid.tag }
    });
  });

  // Check required tags
  if (options.requiredTags && options.requiredTags.length > 0) {
    options.requiredTags.forEach(required => {
      if (!uniqueTagPaths.has(required)) {
        issues.push({
          type: 'error',
          message: `Required merge tag missing: {{${required}}}`,
          tagPath: required
        });
      }
    });
  }

  // Check for unknown tags
  if (options.availableTags && options.availableTags.length > 0) {
    const availableSet = new Set(options.availableTags);
    allTags.forEach(tag => {
      if (!availableSet.has(tag.tagPath)) {
        issues.push({
          type: 'warning',
          message: `Unknown merge tag: {{${tag.tagPath}}}`,
          tagPath: tag.tagPath,
          location: { context: tag.fullTag }
        });
      }
    });
  }

  // Check for tags without fallbacks that might be empty
  const criticalTags = ['customer.first_name', 'customer.email', 'order.number'];
  allTags.forEach(tag => {
    if (criticalTags.includes(tag.tagPath) && !tag.fallbackValue) {
      issues.push({
        type: 'warning',
        message: `Consider adding a fallback value for {{${tag.tagPath}}}`,
        tagPath: tag.tagPath
      });
    }
  });

  // Check conditional blocks for unreachable conditions
  if (options.checkUnreachable && conditionalBlocks.length > 0) {
    validateConditionalBlocks(conditionalBlocks, uniqueTagPaths, issues, options.sampleData);
  }

  // Check for duplicate conditions
  checkDuplicateConditions(conditionalBlocks, issues);

  return {
    valid: issues.filter(i => i.type === 'error').length === 0,
    issues,
    stats: {
      totalTags: allTags.length,
      uniqueTags: uniqueTagPaths.size,
      tagsWithFallbacks: tagsWithFallbacks.length,
      conditionalBlocks: conditionalBlocks.length
    }
  };
}

/**
 * Find invalid merge tag syntax
 */
function findInvalidSyntax(content: string): Array<{ tag: string; index: number }> {
  const invalid: Array<{ tag: string; index: number }> = [];
  
  // Look for potential merge tags with invalid syntax
  const potentialTags = content.match(/\{\{[^}]*\}?\}?/g) || [];
  
  potentialTags.forEach((tag, index) => {
    // Check for unclosed tags
    if (!tag.endsWith('}}')) {
      invalid.push({ tag, index });
      return;
    }

    // Check for invalid characters
    if (tag.includes('<') || tag.includes('>')) {
      invalid.push({ tag, index });
      return;
    }

    // Try to parse - if it fails, it's invalid
    const parsed = parseMergeTag(tag);
    if (!parsed && tag.startsWith('{{')) {
      invalid.push({ tag, index });
    }
  });

  return invalid;
}

/**
 * Validate conditional blocks
 */
function validateConditionalBlocks(
  blocks: ConditionalBlock[],
  availableTags: Set<string>,
  issues: ValidationIssue[],
  sampleData?: Record<string, any>
): void {
  blocks.forEach(block => {
    // Check if conditions use available tags
    block.conditionGroups.forEach(group => {
      group.conditions.forEach(condition => {
        if (!availableTags.has(condition.tagPath)) {
          issues.push({
            type: 'warning',
            message: `Conditional block uses unknown tag: {{${condition.tagPath}}}`,
            tagPath: condition.tagPath
          });
        }

        // Check for always true/false conditions with sample data
        if (sampleData) {
          const allTrue = evaluateConditionalBlock(block, sampleData);
          const allFalse = !evaluateConditionalBlock(block, {});
          
          if (allTrue && allFalse) {
            issues.push({
              type: 'info',
              message: `Conditional block "${block.name || block.id}" might always evaluate to the same result`
            });
          }
        }
      });
    });

    // Check for empty condition groups
    if (block.conditionGroups.length === 0) {
      issues.push({
        type: 'warning',
        message: `Conditional block "${block.name || block.id}" has no conditions`
      });
    }

    // Check for contradictory conditions
    block.conditionGroups.forEach(group => {
      const tagConditions = new Map<string, Condition[]>();
      
      group.conditions.forEach(condition => {
        const existing = tagConditions.get(condition.tagPath) || [];
        existing.push(condition);
        tagConditions.set(condition.tagPath, existing);
      });

      // Check for contradictions within the same group
      tagConditions.forEach((conditions, tagPath) => {
        if (conditions.length > 1 && group.operator === 'and') {
          // Check for equals and not_equals on same tag
          const hasEquals = conditions.some(c => c.operator === 'equals');
          const hasNotEquals = conditions.some(c => c.operator === 'not_equals');
          
          if (hasEquals && hasNotEquals) {
            issues.push({
              type: 'error',
              message: `Contradictory conditions for {{${tagPath}}} in AND group`,
              tagPath
            });
          }
        }
      });
    });
  });
}

/**
 * Check for duplicate conditions
 */
function checkDuplicateConditions(
  blocks: ConditionalBlock[],
  issues: ValidationIssue[]
): void {
  const seenConditions = new Map<string, ConditionalBlock[]>();

  blocks.forEach(block => {
    block.conditionGroups.forEach(group => {
      group.conditions.forEach(condition => {
        const key = `${condition.tagPath}:${condition.operator}:${condition.value}`;
        const existing = seenConditions.get(key) || [];
        
        if (existing.length > 0 && existing[0] !== block) {
          issues.push({
            type: 'info',
            message: `Duplicate condition found: {{${condition.tagPath}}} ${condition.operator} "${condition.value}"`,
            tagPath: condition.tagPath
          });
        }
        
        existing.push(block);
        seenConditions.set(key, existing);
      });
    });
  });
}

/**
 * Get suggestions for improving template
 */
export function getSuggestions(
  validationResult: ValidationResult,
  templateType?: string
): string[] {
  const suggestions: string[] = [];

  // Suggest fallbacks for critical tags
  if (validationResult.stats.tagsWithFallbacks < validationResult.stats.totalTags * 0.5) {
    suggestions.push('Consider adding fallback values to more merge tags to handle missing data gracefully.');
  }

  // Suggest using conditional blocks
  if (validationResult.stats.conditionalBlocks === 0 && validationResult.stats.uniqueTags > 5) {
    suggestions.push('Use conditional blocks to show/hide content based on customer data for better personalization.');
  }

  // Template-specific suggestions
  if (templateType === 'abandoned-cart' && !hasTag(validationResult, 'abandoned_cart.items')) {
    suggestions.push('Add {{abandoned_cart.items}} to show the customer what they left in their cart.');
  }

  if (templateType === 'welcome' && !hasTag(validationResult, 'customer.first_name')) {
    suggestions.push('Personalize your welcome email with {{customer.first_name|"Friend"}}.');
  }

  return suggestions;
}

/**
 * Check if validation result contains a specific tag
 */
function hasTag(result: ValidationResult, tagPath: string): boolean {
  return result.issues.some(issue => issue.tagPath === tagPath) || false;
}

export interface Condition {
  tagPath: string;
  operator: string;
  value?: string | number;
}