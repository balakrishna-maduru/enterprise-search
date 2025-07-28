// src/utils/markdownFormatter.js
import React from 'react';

/**
 * Simple markdown formatter for chat and summary content
 * Supports: **bold**, *italic*, `code`, ## headers, - lists, numbered lists
 */
export const formatMarkdown = (text) => {
  if (!text) return '';

  // Split text into lines to handle different elements
  const lines = text.split('\n');
  const elements = [];
  let currentList = [];
  let listType = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle lists
    if (line.match(/^[\s]*[-*+]\s+(.+)/) || line.match(/^[\s]*\d+\.\s+(.+)/)) {
      const isNumbered = line.match(/^[\s]*\d+\.\s+(.+)/);
      const newListType = isNumbered ? 'ol' : 'ul';
      
      if (listType !== newListType) {
        // Finish previous list if different type
        if (currentList.length > 0) {
          elements.push(createList(currentList, listType));
          currentList = [];
        }
        listType = newListType;
      }
      
      const content = line.replace(/^[\s]*(?:[-*+]|\d+\.)\s+/, '');
      currentList.push(formatInlineMarkdown(content));
    } else {
      // Finish any current list
      if (currentList.length > 0) {
        elements.push(createList(currentList, listType));
        currentList = [];
        listType = null;
      }
      
      // Handle headers
      if (line.startsWith('###')) {
        elements.push(
          <h3 key={i} className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            {formatInlineMarkdown(line.replace(/^###\s*/, ''))}
          </h3>
        );
      } else if (line.startsWith('##')) {
        elements.push(
          <h2 key={i} className="text-xl font-semibold text-gray-900 mt-4 mb-2">
            {formatInlineMarkdown(line.replace(/^##\s*/, ''))}
          </h2>
        );
      } else if (line.startsWith('#')) {
        elements.push(
          <h1 key={i} className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {formatInlineMarkdown(line.replace(/^#\s*/, ''))}
          </h1>
        );
      } else if (line.trim() === '') {
        // Empty line - add spacing
        elements.push(<div key={i} className="h-2"></div>);
      } else {
        // Regular paragraph
        elements.push(
          <p key={i} className="mb-2 leading-relaxed">
            {formatInlineMarkdown(line)}
          </p>
        );
      }
    }
  }
  
  // Handle any remaining list
  if (currentList.length > 0) {
    elements.push(createList(currentList, listType));
  }

  return <div className="markdown-content">{elements}</div>;
};

/**
 * Format inline markdown elements (bold, italic, code)
 */
const formatInlineMarkdown = (text) => {
  if (!text) return '';

  const parts = [];
  let currentIndex = 0;
  
  // Combined regex for all inline formatting
  const regex = /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)/g;
  
  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }
    
    if (match[1]) {
      // Bold text (**text**)
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic text (*text*)
      parts.push(
        <em key={match.index} className="italic text-gray-800">
          {match[4]}
        </em>
      );
    } else if (match[5]) {
      // Code text (`code`)
      parts.push(
        <code key={match.index} className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
          {match[6]}
        </code>
      );
    }
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

/**
 * Create list elements
 */
const createList = (items, type) => {
  const ListComponent = type === 'ol' ? 'ol' : 'ul';
  const listClass = type === 'ol' 
    ? 'list-decimal list-inside mb-4 space-y-1' 
    : 'list-disc list-inside mb-4 space-y-1';
  
  return React.createElement(
    ListComponent,
    { 
      key: `list-${Date.now()}-${Math.random()}`,
      className: listClass
    },
    items.map((item, index) => (
      <li key={index} className="text-gray-700 leading-relaxed">
        {item}
      </li>
    ))
  );
};

/**
 * Simple formatting for basic use cases
 */
export const formatSimpleMarkdown = (text) => {
  if (!text) return text;
  
  // Quick and simple formatting for single-line content
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
};