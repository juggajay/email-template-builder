/**
 * Parse merge tags with support for fallback values
 * Format: {{tag.name|"fallback value"}} or {{tag.name|fallback}}
 */

export interface ParsedMergeTag {
  fullTag: string;
  tagPath: string;
  fallbackValue?: string;
  hasQuotes: boolean;
}

/**
 * Parse a single merge tag string
 * @param tagString - The merge tag string (e.g., "{{customer.first_name|\"John\"}}")
 * @returns Parsed merge tag object or null if invalid
 */
export function parseMergeTag(tagString: string): ParsedMergeTag | null {
  // Match merge tag pattern with optional fallback
  // Supports both quoted and unquoted fallback values
  const regex = /\{\{([^|{}]+)(?:\|([^}]+))?\}\}/;
  const match = tagString.match(regex);

  if (!match) {
    return null;
  }

  const [fullTag, tagPath, fallbackPart] = match;
  
  let fallbackValue: string | undefined;
  let hasQuotes = false;

  if (fallbackPart) {
    // Check if fallback is quoted
    const quotedMatch = fallbackPart.match(/^["'](.*)["']$/);
    if (quotedMatch) {
      fallbackValue = quotedMatch[1];
      hasQuotes = true;
    } else {
      // Unquoted fallback - trim whitespace
      fallbackValue = fallbackPart.trim();
      hasQuotes = false;
    }
  }

  return {
    fullTag,
    tagPath: tagPath.trim(),
    fallbackValue,
    hasQuotes
  };
}

/**
 * Find all merge tags in a text string
 * @param text - The text to search for merge tags
 * @returns Array of parsed merge tags
 */
export function findAllMergeTags(text: string): ParsedMergeTag[] {
  const regex = /\{\{[^}]+\}\}/g;
  const matches = text.match(regex) || [];
  
  return matches
    .map(match => parseMergeTag(match))
    .filter((tag): tag is ParsedMergeTag => tag !== null);
}

/**
 * Replace merge tags in text with actual values
 * @param text - The text containing merge tags
 * @param data - The data object containing values
 * @param options - Replacement options
 * @returns Text with merge tags replaced
 */
export function replaceMergeTags(
  text: string, 
  data: Record<string, any>,
  options: {
    preserveUnmatched?: boolean;
    useFallbacks?: boolean;
  } = {}
): string {
  const { preserveUnmatched = false, useFallbacks = true } = options;
  
  return text.replace(/\{\{([^}]+)\}\}/g, (match) => {
    const parsed = parseMergeTag(match);
    
    if (!parsed) {
      return preserveUnmatched ? match : '';
    }

    // Get value from data object using dot notation
    const value = getValueByPath(data, parsed.tagPath);
    
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }

    // Use fallback if available and enabled
    if (useFallbacks && parsed.fallbackValue !== undefined) {
      return parsed.fallbackValue;
    }

    // Preserve unmatched tags if option is set
    return preserveUnmatched ? match : '';
  });
}

/**
 * Get value from object using dot notation path
 * @param obj - The object to search
 * @param path - The dot notation path (e.g., "customer.first_name")
 * @returns The value at the path or undefined
 */
function getValueByPath(obj: Record<string, any>, path: string): any {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Validate merge tag syntax
 * @param tagString - The merge tag string to validate
 * @returns True if valid, false otherwise
 */
export function isValidMergeTag(tagString: string): boolean {
  return parseMergeTag(tagString) !== null;
}

/**
 * Extract tag path without brackets and fallback
 * @param tagString - The merge tag string
 * @returns The tag path or null if invalid
 */
export function extractTagPath(tagString: string): string | null {
  const parsed = parseMergeTag(tagString);
  return parsed ? parsed.tagPath : null;
}

/**
 * Create a merge tag string with optional fallback
 * @param tagPath - The tag path (e.g., "customer.first_name")
 * @param fallback - Optional fallback value
 * @returns Formatted merge tag string
 */
export function createMergeTag(tagPath: string, fallback?: string): string {
  if (!fallback) {
    return `{{${tagPath}}}`;
  }

  // Quote fallback if it contains spaces or special characters
  const needsQuotes = fallback.includes(' ') || /[,|{}"]/.test(fallback);
  const quotedFallback = needsQuotes ? `"${fallback.replace(/"/g, '\\"')}"` : fallback;
  
  return `{{${tagPath}|${quotedFallback}}}`;
}

/**
 * Get a list of all unique tag paths from text
 * @param text - The text to analyze
 * @returns Array of unique tag paths
 */
export function getUniqueTagPaths(text: string): string[] {
  const tags = findAllMergeTags(text);
  const paths = tags.map(tag => tag.tagPath);
  return Array.from(new Set(paths));
}