'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllMergeTags } from '@/lib/merge-tags';
import { createMergeTag } from '@/lib/merge-tags/parser';
import { Badge } from '@/components/ui/badge';

interface AutocompleteProps {
  onTagInsert: (tag: string) => void;
  triggerChar?: string;
  maxSuggestions?: number;
}

interface Position {
  top: number;
  left: number;
}

export function MergeTagAutocomplete({ 
  onTagInsert, 
  triggerChar = '{{',
  maxSuggestions = 8 
}: AutocompleteProps) {
  const [isActive, setIsActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get filtered suggestions
  useEffect(() => {
    if (!isActive || !searchTerm) {
      setSuggestions([]);
      return;
    }

    const filtered = getAllMergeTags()
      .filter(tag => {
        const search = searchTerm.toLowerCase();
        return (
          tag.name.toLowerCase().includes(search) ||
          tag.value.toLowerCase().includes(search) ||
          tag.category.toLowerCase().includes(search)
        );
      })
      .slice(0, maxSuggestions);

    setSuggestions(filtered);
    setSelectedIndex(0);
  }, [searchTerm, isActive, maxSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isActive || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (suggestions[selectedIndex]) {
          insertTag(suggestions[selectedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        close();
        break;
    }
  }, [isActive, suggestions, selectedIndex]);

  // Listen for trigger characters in contenteditable or input elements
  useEffect(() => {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if target is editable
      if (!isEditableElement(target)) return;

      const text = getTextBeforeCursor(target);
      const triggerIndex = text.lastIndexOf(triggerChar);

      if (triggerIndex !== -1 && triggerIndex === text.length - triggerChar.length) {
        // Just typed trigger characters
        const rect = getCaretCoordinates(target);
        setPosition({
          top: rect.top + rect.height + 5,
          left: rect.left
        });
        setIsActive(true);
        setSearchTerm('');
      } else if (isActive && triggerIndex !== -1) {
        // Continue typing after trigger
        const search = text.slice(triggerIndex + triggerChar.length);
        setSearchTerm(search);
      } else {
        // No trigger found
        close();
      }
    };

    document.addEventListener('input', handleInput);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('input', handleInput);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, triggerChar, handleKeyDown]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        close();
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isActive]);

  const insertTag = (tag: any) => {
    const fullTag = tag.value;
    onTagInsert(fullTag);
    
    // Remove the trigger characters and search term from the current position
    const activeElement = document.activeElement as HTMLElement;
    if (isEditableElement(activeElement)) {
      const text = getTextBeforeCursor(activeElement);
      const triggerIndex = text.lastIndexOf(triggerChar);
      
      if (triggerIndex !== -1) {
        removeTextFromPosition(activeElement, triggerIndex, text.length);
        insertTextAtCursor(activeElement, fullTag);
      }
    }

    close();
  };

  const close = () => {
    setIsActive(false);
    setSearchTerm('');
    setSelectedIndex(0);
    setSuggestions([]);
  };

  if (!isActive || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-white border rounded-lg shadow-lg py-2 max-w-sm"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        maxHeight: '300px',
        overflowY: 'auto'
      }}
    >
      <div className="px-3 py-1 text-xs text-gray-500 border-b mb-2">
        Type to search merge tags
      </div>
      
      {suggestions.map((tag, index) => (
        <button
          key={tag.value}
          className={`w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between ${
            index === selectedIndex ? 'bg-gray-100' : ''
          }`}
          onMouseEnter={() => setSelectedIndex(index)}
          onClick={() => insertTag(tag)}
        >
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{tag.name}</span>
              <Badge variant="outline" className="text-xs">
                {tag.category}
              </Badge>
            </div>
            <code className="text-xs text-gray-600">{tag.value}</code>
          </div>
          <span className="text-xs text-gray-400 ml-2">{tag.sample}</span>
        </button>
      ))}
      
      <div className="px-3 py-1 text-xs text-gray-400 border-t mt-2">
        ↑↓ Navigate • Enter Select • Esc Close
      </div>
    </div>
  );
}

// Helper functions
function isEditableElement(element: HTMLElement): boolean {
  return (
    element.contentEditable === 'true' ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  );
}

function getTextBeforeCursor(element: HTMLElement): string {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value.substring(0, element.selectionStart || 0);
  } else if (element.contentEditable === 'true') {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';
    
    const range = selection.getRangeAt(0);
    const tempRange = range.cloneRange();
    tempRange.selectNodeContents(element);
    tempRange.setEnd(range.startContainer, range.startOffset);
    
    return tempRange.toString();
  }
  
  return '';
}

function getCaretCoordinates(element: HTMLElement): DOMRect {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    // For input/textarea, create a temporary element to measure position
    const coords = getInputCaretCoordinates(element, element.selectionStart || 0);
    const rect = element.getBoundingClientRect();
    
    return {
      top: rect.top + coords.top,
      left: rect.left + coords.left,
      bottom: rect.top + coords.top + coords.height,
      right: rect.left + coords.left,
      height: coords.height,
      width: 0,
      x: rect.left + coords.left,
      y: rect.top + coords.top,
      toJSON: () => ({})
    } as DOMRect;
  } else {
    // For contentEditable, use the selection range
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return element.getBoundingClientRect();
    }
    
    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  }
}

function removeTextFromPosition(element: HTMLElement, start: number, end: number) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const value = element.value;
    element.value = value.substring(0, start) + value.substring(end);
    element.selectionStart = element.selectionEnd = start;
  } else if (element.contentEditable === 'true') {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    // Complex contentEditable manipulation - simplified version
    const range = selection.getRangeAt(0);
    const text = element.textContent || '';
    element.textContent = text.substring(0, start) + text.substring(end);
    
    // Restore cursor position
    const newRange = document.createRange();
    newRange.setStart(element.firstChild || element, start);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

function insertTextAtCursor(element: HTMLElement, text: string) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const start = element.selectionStart || 0;
    const end = element.selectionEnd || 0;
    const value = element.value;
    
    element.value = value.substring(0, start) + text + value.substring(end);
    element.selectionStart = element.selectionEnd = start + text.length;
  } else if (element.contentEditable === 'true') {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Simplified caret position calculation for inputs
function getInputCaretCoordinates(element: HTMLInputElement | HTMLTextAreaElement, position: number) {
  const div = document.createElement('div');
  const style = getComputedStyle(element);
  
  // Copy styles
  ['font', 'padding', 'border', 'letterSpacing', 'wordSpacing'].forEach(prop => {
    (div.style as any)[prop] = (style as any)[prop];
  });
  
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre-wrap';
  div.style.width = element.offsetWidth + 'px';
  
  div.textContent = element.value.substring(0, position);
  document.body.appendChild(div);
  
  const span = document.createElement('span');
  span.textContent = element.value.substring(position) || '.';
  div.appendChild(span);
  
  const coords = {
    top: span.offsetTop,
    left: span.offsetLeft,
    height: span.offsetHeight
  };
  
  document.body.removeChild(div);
  return coords;
}