'use client';

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { FixedSizeGrid as Grid, GridChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { throttle } from '@/lib/utils/performance';
import type { EmailTemplate } from '@/types';

// Import the existing TemplateCard component
import { TemplateCard } from './template-grid';

interface VirtualTemplateGridProps {
  templates: EmailTemplate[];
  onSelect: (template: EmailTemplate) => void;
  onPreview: (template: any) => void;
  onDelete?: (templateId: string) => void;
  showUserTemplates: boolean;
  getCategoryColor: (categoryId: string) => 'default' | 'secondary' | 'outline';
}

// Hook for responsive grid dimensions
function useGridDimensions() {
  const [dimensions, setDimensions] = useState({
    columnCount: 3,
    itemWidth: 320,
    itemHeight: 420,
    gap: 24,
  });

  useEffect(() => {
    const calculateDimensions = throttle(() => {
      const width = window.innerWidth;
      let columnCount: number;
      
      // Responsive column count
      if (width < 640) {
        columnCount = 1;
      } else if (width < 1024) {
        columnCount = 2;
      } else if (width < 1536) {
        columnCount = 3;
      } else {
        columnCount = 4;
      }

      // Calculate item width based on available space
      const containerPadding = 48; // 24px on each side
      const totalGaps = (columnCount - 1) * 24; // 24px gap between items
      const availableWidth = width - containerPadding - totalGaps;
      const itemWidth = Math.floor(availableWidth / columnCount);

      setDimensions({
        columnCount,
        itemWidth: Math.min(itemWidth, 400), // Max width of 400px
        itemHeight: 420,
        gap: 24,
      });
    }, 100);

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    
    return () => {
      window.removeEventListener('resize', calculateDimensions);
    };
  }, []);

  return dimensions;
}

export function VirtualTemplateGrid({
  templates,
  onSelect,
  onPreview,
  onDelete,
  showUserTemplates,
  getCategoryColor,
}: VirtualTemplateGridProps) {
  const { columnCount, itemWidth, itemHeight, gap } = useGridDimensions();
  const rowCount = Math.ceil(templates.length / columnCount);

  // Cell renderer
  const Cell = useCallback(
    ({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
      const index = rowIndex * columnCount + columnIndex;
      
      // Don't render if index is out of bounds
      if (index >= templates.length) {
        return null;
      }

      const template = templates[index];
      
      // Adjust style to include gap
      const adjustedStyle: CSSProperties = {
        ...style,
        left: typeof style.left === 'number' ? style.left + columnIndex * gap : style.left,
        top: typeof style.top === 'number' ? style.top + rowIndex * gap : style.top,
        width: typeof style.width === 'number' ? style.width - gap : style.width,
        height: typeof style.height === 'number' ? style.height - gap : style.height,
        padding: '0',
      };

      return (
        <div style={adjustedStyle}>
          <TemplateCard
            template={template as any}
            onSelect={onSelect}
            onPreview={onPreview}
            onDelete={onDelete}
            showUserTemplates={showUserTemplates}
            getCategoryColor={getCategoryColor}
          />
        </div>
      );
    },
    [templates, columnCount, gap, onSelect, onPreview, onDelete, showUserTemplates, getCategoryColor]
  );

  return (
    <div className="h-full w-full">
      <AutoSizer>
        {({ height, width }) => (
          <Grid
            columnCount={columnCount}
            columnWidth={itemWidth + gap}
            height={height}
            rowCount={rowCount}
            rowHeight={itemHeight + gap}
            width={width}
            overscanRowCount={2} // Render 2 extra rows for smoother scrolling
            overscanColumnCount={1} // Render 1 extra column for smoother scrolling
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </div>
  );
}

// Export a wrapper that decides whether to use virtual scrolling
export function OptimizedTemplateGrid(props: VirtualTemplateGridProps & { enableVirtualization?: boolean }) {
  const { enableVirtualization = true, ...gridProps } = props;
  
  // Always use regular grid for better UX (no horizontal scrolling)
  // Virtual scrolling can be re-enabled later if needed for very large lists
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {gridProps.templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template as any}
          onSelect={gridProps.onSelect}
          onPreview={gridProps.onPreview}
          onDelete={gridProps.onDelete}
          showUserTemplates={gridProps.showUserTemplates}
          getCategoryColor={gridProps.getCategoryColor}
        />
      ))}
    </div>
  );
}