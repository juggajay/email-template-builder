/**
 * Export all merge tag functionality
 */

// Re-export existing merge tags configuration
export * from '../merge-tags';

// Export new enhanced functionality
export * from './parser';
export {
  evaluateCondition,
  evaluateConditionGroup,
  evaluateConditionalBlock,
  createCondition,
  createConditionGroup,
  createConditionalBlock,
  getOperatorLabel,
  getOperatorsForType
} from './conditional';
export type { 
  ConditionalBlock,
  ConditionGroup,
  ComparisonOperator,
  LogicalOperator,
  Condition 
} from './conditional';
export * from './validator';
export * from './data-sources';