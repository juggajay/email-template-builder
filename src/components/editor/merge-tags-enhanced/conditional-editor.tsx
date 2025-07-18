'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Trash2, 
  Copy,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  ConditionalBlock,
  ConditionGroup,
  Condition,
  ComparisonOperator,
  LogicalOperator,
  createCondition,
  createConditionGroup,
  createConditionalBlock,
  getOperatorLabel,
  getOperatorsForType,
  evaluateConditionalBlock
} from '@/lib/merge-tags/conditional';
import { getAllMergeTags } from '@/lib/merge-tags';

interface ConditionalEditorProps {
  blocks: ConditionalBlock[];
  onBlocksChange: (blocks: ConditionalBlock[]) => void;
  testData?: Record<string, any>;
}

export function ConditionalEditor({ 
  blocks, 
  onBlocksChange,
  testData = {}
}: ConditionalEditorProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const allTags = getAllMergeTags();

  const addBlock = () => {
    const newBlock = createConditionalBlock(
      [createConditionGroup([createCondition('customer.first_name', 'is_not_empty')])],
      'or',
      `Conditional Block ${blocks.length + 1}`
    );
    onBlocksChange([...blocks, newBlock]);
    setExpandedBlocks({ ...expandedBlocks, [newBlock.id]: true });
  };

  const updateBlock = (blockId: string, updates: Partial<ConditionalBlock>) => {
    onBlocksChange(
      blocks.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (blockId: string) => {
    onBlocksChange(blocks.filter(block => block.id !== blockId));
  };

  const duplicateBlock = (block: ConditionalBlock) => {
    const newBlock = {
      ...block,
      id: `block_${Date.now()}`,
      name: `${block.name} (Copy)`
    };
    onBlocksChange([...blocks, newBlock]);
  };

  const addConditionGroup = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const newGroup = createConditionGroup(
      [createCondition('customer.email', 'is_not_empty')]
    );
    
    updateBlock(blockId, {
      conditionGroups: [...block.conditionGroups, newGroup]
    });
  };

  const updateConditionGroup = (
    blockId: string, 
    groupId: string, 
    updates: Partial<ConditionGroup>
  ) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    updateBlock(blockId, {
      conditionGroups: block.conditionGroups.map(group =>
        group.id === groupId ? { ...group, ...updates } : group
      )
    });
  };

  const deleteConditionGroup = (blockId: string, groupId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    updateBlock(blockId, {
      conditionGroups: block.conditionGroups.filter(g => g.id !== groupId)
    });
  };

  const addCondition = (blockId: string, groupId: string) => {
    const block = blocks.find(b => b.id === blockId);
    const group = block?.conditionGroups.find(g => g.id === groupId);
    if (!group) return;

    const newCondition = createCondition('product.name', 'contains', '');
    
    updateConditionGroup(blockId, groupId, {
      conditions: [...group.conditions, newCondition]
    });
  };

  const updateCondition = (
    blockId: string,
    groupId: string,
    conditionId: string,
    updates: Partial<Condition>
  ) => {
    const block = blocks.find(b => b.id === blockId);
    const group = block?.conditionGroups.find(g => g.id === groupId);
    if (!group) return;

    updateConditionGroup(blockId, groupId, {
      conditions: group.conditions.map(cond =>
        cond.id === conditionId ? { ...cond, ...updates } : cond
      )
    });
  };

  const deleteCondition = (blockId: string, groupId: string, conditionId: string) => {
    const block = blocks.find(b => b.id === blockId);
    const group = block?.conditionGroups.find(g => g.id === groupId);
    if (!group) return;

    updateConditionGroup(blockId, groupId, {
      conditions: group.conditions.filter(c => c.id !== conditionId)
    });
  };

  const toggleBlockExpanded = (blockId: string) => {
    setExpandedBlocks(prev => ({
      ...prev,
      [blockId]: !prev[blockId]
    }));
  };

  const ConditionRow = ({ 
    condition, 
    blockId, 
    groupId 
  }: { 
    condition: Condition; 
    blockId: string; 
    groupId: string;
  }) => {
    const selectedTag = allTags.find(t => 
      t.value === `{{${condition.tagPath}}}`
    );

    const needsValue = !['exists', 'not_exists', 'is_empty', 'is_not_empty'].includes(
      condition.operator
    );

    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
        <Select
          value={condition.tagPath}
          onValueChange={(value: string) => 
            updateCondition(blockId, groupId, condition.id, { tagPath: value })
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select tag" />
          </SelectTrigger>
          <SelectContent>
            {allTags.map(tag => (
              <SelectItem key={tag.value} value={tag.value.replace(/[{}]/g, '')}>
                <div className="flex items-center space-x-2">
                  <span>{tag.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {tag.category}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={condition.operator}
          onValueChange={(value: string) => 
            updateCondition(blockId, groupId, condition.id, { 
              operator: value as ComparisonOperator 
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getOperatorsForType('string').map(op => (
              <SelectItem key={op} value={op}>
                {getOperatorLabel(op)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {needsValue && (
          <Input
            value={condition.value || ''}
            onChange={(e) => 
              updateCondition(blockId, groupId, condition.id, { 
                value: e.target.value 
              })
            }
            placeholder="Value"
            className="w-32"
          />
        )}

        <Switch
          checked={condition.caseSensitive || false}
          onCheckedChange={(checked) =>
            updateCondition(blockId, groupId, condition.id, { 
              caseSensitive: checked 
            })
          }
          title="Case sensitive"
        />

        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteCondition(blockId, groupId, condition.id)}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conditional Blocks</CardTitle>
          <Button size="sm" onClick={addBlock}>
            <Plus className="w-4 h-4 mr-2" />
            Add Block
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Show or hide content based on merge tag values
        </p>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No conditional blocks yet.</p>
            <p className="text-sm mt-2">
              Add a block to show/hide content based on conditions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map(block => {
              const isExpanded = expandedBlocks[block.id];
              const isActive = testData && evaluateConditionalBlock(block, testData);
              
              return (
                <div 
                  key={block.id}
                  className={`border rounded-lg ${
                    selectedBlockId === block.id ? 'border-blue-500' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleBlockExpanded(block.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <Input
                          value={block.name || ''}
                          onChange={(e) => 
                            updateBlock(block.id, { name: e.target.value })
                          }
                          className="w-48 h-8"
                          placeholder="Block name"
                        />
                        {testData && (
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {isActive ? (
                              <><Eye className="w-3 h-3 mr-1" /> Visible</>
                            ) : (
                              <><EyeOff className="w-3 h-3 mr-1" /> Hidden</>
                            )}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => duplicateBlock(block)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBlock(block.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center space-x-2">
                          <Label>Show block when</Label>
                          <Select
                            value={block.groupOperator}
                            onValueChange={(value: string) => 
                              updateBlock(block.id, { 
                                groupOperator: value as LogicalOperator 
                              })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="or">ANY</SelectItem>
                              <SelectItem value="and">ALL</SelectItem>
                            </SelectContent>
                          </Select>
                          <Label>condition groups are true:</Label>
                        </div>

                        {block.conditionGroups.map((group, groupIndex) => (
                          <div key={group.id} className="border rounded p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Label>Group {groupIndex + 1}:</Label>
                                <Select
                                  value={group.operator}
                                  onValueChange={(value: string) => 
                                    updateConditionGroup(block.id, group.id, { 
                                      operator: value as LogicalOperator 
                                    })
                                  }
                                >
                                  <SelectTrigger className="w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="and">AND</SelectItem>
                                    <SelectItem value="or">OR</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteConditionGroup(block.id, group.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>

                            <div className="space-y-2">
                              {group.conditions.map(condition => (
                                <ConditionRow
                                  key={condition.id}
                                  condition={condition}
                                  blockId={block.id}
                                  groupId={group.id}
                                />
                              ))}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addCondition(block.id, group.id)}
                                className="w-full"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Condition
                              </Button>
                            </div>
                          </div>
                        ))}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addConditionGroup(block.id)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Condition Group
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}