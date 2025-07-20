'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import styles from './minimalist-styles.module.css';

interface BlockCategory {
  name: string;
  icon: string;
  blocks: { name: string; type: string; icon?: string }[];
}

const blockCategories: BlockCategory[] = [
  {
    name: 'Content',
    icon: '📝',
    blocks: [
      { name: 'Text', type: 'text', icon: 'T' },
      { name: 'Image', type: 'image', icon: '🖼' },
      { name: 'Button', type: 'button', icon: '▢' },
      { name: 'Divider', type: 'divider', icon: '─' }
    ]
  },
  {
    name: 'Layout',
    icon: '⚏',
    blocks: [
      { name: 'Columns', type: 'columns', icon: '⊞' },
      { name: 'Spacer', type: 'spacer', icon: '↕' },
      { name: 'Section', type: 'section', icon: '▭' }
    ]
  },
  {
    name: 'Commerce',
    icon: '🛒',
    blocks: [
      { name: 'Products', type: 'product', icon: '📦' },
      { name: 'Cart', type: 'cart', icon: '🛒' },
      { name: 'Reviews', type: 'reviews', icon: '⭐' }
    ]
  },
  {
    name: 'Dynamic',
    icon: '⚡',
    blocks: [
      { name: 'Personalization', type: 'merge_tags', icon: '👤' },
      { name: 'Conditional', type: 'conditional', icon: '⌥' }
    ]
  }
];

interface MinimalistSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onBlockSelect: (blockType: string) => void;
}

export function MinimalistSidebar({ collapsed, onToggle, onBlockSelect }: MinimalistSidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Content');

  const handleCategoryClick = (categoryName: string) => {
    if (collapsed) {
      // Expand sidebar first
      onToggle();
      setExpandedCategory(categoryName);
    } else {
      setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
    }
  };

  const handleBlockClick = (blockType: string) => {
    onBlockSelect(blockType);
  };

  return (
    <div 
      className={cn(
        styles.sidebar,
        collapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      )}
    >
      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <span className={styles.toggleIcon}>
          {collapsed ? '→' : '←'}
        </span>
      </button>

      {/* Categories */}
      <div className={styles.categories}>
        {blockCategories.map((category) => (
          <div key={category.name} className={styles.category}>
            <button
              className={cn(
                styles.categoryHeader,
                expandedCategory === category.name && styles.categoryActive
              )}
              onClick={() => handleCategoryClick(category.name)}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              {!collapsed && (
                <span className={styles.categoryName}>{category.name}</span>
              )}
            </button>

            {/* Blocks Grid - Only show when expanded */}
            {!collapsed && expandedCategory === category.name && (
              <div className={styles.blocksGrid}>
                {category.blocks.map((block) => (
                  <button
                    key={block.type}
                    className={styles.blockItem}
                    onClick={() => handleBlockClick(block.type)}
                    draggable={true}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('blockType', block.type);
                    }}
                  >
                    <span className={styles.blockIcon}>
                      {block.icon || block.name.charAt(0)}
                    </span>
                    <span className={styles.blockName}>{block.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Collapsed State Tooltip */}
      {collapsed && (
        <div className={styles.collapsedTooltips}>
          {blockCategories.map((category) => (
            <div
              key={category.name}
              className={styles.tooltipWrapper}
              data-tooltip={category.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}