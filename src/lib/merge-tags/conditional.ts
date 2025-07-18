/**
 * Conditional logic engine for merge tags
 * Allows showing/hiding content based on merge tag values
 */

export type ComparisonOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'exists'
  | 'not_exists';

export type LogicalOperator = 'and' | 'or';

export interface Condition {
  id: string;
  tagPath: string;
  operator: ComparisonOperator;
  value?: string | number;
  caseSensitive?: boolean;
}

export interface ConditionGroup {
  id: string;
  operator: LogicalOperator;
  conditions: Condition[];
}

export interface ConditionalBlock {
  id: string;
  name?: string;
  conditionGroups: ConditionGroup[];
  groupOperator: LogicalOperator;
}

/**
 * Evaluate a single condition against data
 */
export function evaluateCondition(
  condition: Condition, 
  data: Record<string, any>
): boolean {
  const value = getValueByPath(data, condition.tagPath);
  const compareValue = condition.value;
  const { operator, caseSensitive = false } = condition;

  // Handle existence checks
  if (operator === 'exists') {
    return value !== undefined && value !== null;
  }
  
  if (operator === 'not_exists') {
    return value === undefined || value === null;
  }

  // Handle empty checks
  if (operator === 'is_empty') {
    return value === '' || value === null || value === undefined || 
           (Array.isArray(value) && value.length === 0);
  }
  
  if (operator === 'is_not_empty') {
    return value !== '' && value !== null && value !== undefined &&
           !(Array.isArray(value) && value.length === 0);
  }

  // For other operators, we need both values
  if (value === undefined || value === null) {
    return false;
  }

  // Convert to strings for comparison (unless numeric)
  let val = value;
  let cmp = compareValue;

  // Handle numeric comparisons
  if (['greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'].includes(operator)) {
    const numVal = Number(val);
    const numCmp = Number(cmp);
    
    if (!isNaN(numVal) && !isNaN(numCmp)) {
      switch (operator) {
        case 'greater_than': return numVal > numCmp;
        case 'less_than': return numVal < numCmp;
        case 'greater_or_equal': return numVal >= numCmp;
        case 'less_or_equal': return numVal <= numCmp;
      }
    }
    return false;
  }

  // String comparisons
  let strVal = String(val);
  let strCmp = String(cmp || '');

  if (!caseSensitive) {
    strVal = strVal.toLowerCase();
    strCmp = strCmp.toLowerCase();
  }

  switch (operator) {
    case 'equals':
      return strVal === strCmp;
    
    case 'not_equals':
      return strVal !== strCmp;
    
    case 'contains':
      return strVal.includes(strCmp);
    
    case 'not_contains':
      return !strVal.includes(strCmp);
    
    case 'starts_with':
      return strVal.startsWith(strCmp);
    
    case 'ends_with':
      return strVal.endsWith(strCmp);
    
    default:
      return false;
  }
}

/**
 * Evaluate a condition group (multiple conditions with AND/OR)
 */
export function evaluateConditionGroup(
  group: ConditionGroup,
  data: Record<string, any>
): boolean {
  if (group.conditions.length === 0) {
    return true;
  }

  const results = group.conditions.map(condition => 
    evaluateCondition(condition, data)
  );

  if (group.operator === 'and') {
    return results.every(result => result);
  } else {
    return results.some(result => result);
  }
}

/**
 * Evaluate a complete conditional block
 */
export function evaluateConditionalBlock(
  block: ConditionalBlock,
  data: Record<string, any>
): boolean {
  if (block.conditionGroups.length === 0) {
    return true;
  }

  const results = block.conditionGroups.map(group => 
    evaluateConditionGroup(group, data)
  );

  if (block.groupOperator === 'and') {
    return results.every(result => result);
  } else {
    return results.some(result => result);
  }
}

/**
 * Get value from object using dot notation path
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
 * Create a simple condition
 */
export function createCondition(
  tagPath: string,
  operator: ComparisonOperator,
  value?: string | number
): Condition {
  return {
    id: generateId(),
    tagPath,
    operator,
    value,
    caseSensitive: false
  };
}

/**
 * Create a condition group
 */
export function createConditionGroup(
  conditions: Condition[],
  operator: LogicalOperator = 'and'
): ConditionGroup {
  return {
    id: generateId(),
    operator,
    conditions
  };
}

/**
 * Create a conditional block
 */
export function createConditionalBlock(
  conditionGroups: ConditionGroup[],
  groupOperator: LogicalOperator = 'or',
  name?: string
): ConditionalBlock {
  return {
    id: generateId(),
    name,
    conditionGroups,
    groupOperator
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get human-readable description of an operator
 */
export function getOperatorLabel(operator: ComparisonOperator): string {
  const labels: Record<ComparisonOperator, string> = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    not_contains: 'does not contain',
    starts_with: 'starts with',
    ends_with: 'ends with',
    greater_than: 'is greater than',
    less_than: 'is less than',
    greater_or_equal: 'is greater than or equal to',
    less_or_equal: 'is less than or equal to',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
    exists: 'exists',
    not_exists: 'does not exist'
  };

  return labels[operator] || operator;
}

/**
 * Get operators suitable for a data type
 */
export function getOperatorsForType(type: 'string' | 'number' | 'boolean' | 'any'): ComparisonOperator[] {
  const commonOps: ComparisonOperator[] = ['exists', 'not_exists', 'is_empty', 'is_not_empty'];
  
  switch (type) {
    case 'string':
      return [...commonOps, 'equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with'];
    
    case 'number':
      return [...commonOps, 'equals', 'not_equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal'];
    
    case 'boolean':
      return [...commonOps, 'equals', 'not_equals'];
    
    default:
      return commonOps;
  }
}