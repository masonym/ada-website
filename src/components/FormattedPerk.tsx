'use client';

import React from 'react';

interface FormattedPerkProps {
  content: string | { formatted: { content: string; bold?: boolean; indent?: number; }[] };
  className?: string;
}

/**
 * Component for rendering perks with HTML-like formatting and native HTML nested lists
 * Supports <b> tags for bold text and handles indentation with proper HTML list structure
 */
const FormattedPerk: React.FC<FormattedPerkProps> = ({ content, className = '' }) => {
  // Process the content based on its type
  const processContent = () => {
    if (!content) return null;
    
    // If content is a formatted object
    if (typeof content === 'object' && content.formatted) {
      // Build a tree structure from formatted perks
      const rootItems: { content: JSX.Element | string; level: number; children: any[] }[] = [];
      let currentList = rootItems;
      let parentStack: any[] = [];
      
      content.formatted.forEach(formattedItem => {
        const level = formattedItem.indent || 0;
        
        // Create the content with or without bold formatting
        const itemContent = formattedItem.bold ? (
          <span className="font-bold">{formattedItem.content}</span>
        ) : formattedItem.content;
        
        // Create new item for this formatted item
        const newItem = {
          content: itemContent,
          level,
          children: []
        };
        
        if (level === 0) {
          // Top-level item
          rootItems.push(newItem);
          currentList = newItem.children;
          parentStack = [newItem];
        } else {
          // Find the appropriate parent for this level
          while (parentStack.length > level) {
            parentStack.pop();
          }
          
          if (parentStack.length === level) {
            const parent = parentStack[level - 1];
            if (parent) {
              parent.children.push(newItem);
              parentStack.push(newItem);
              currentList = newItem.children;
            }
          }
        }
      });
      
      // Render the nested list structure
      return renderNestedList(rootItems);
    }
    // If content is a string
    else if (typeof content === 'string') {
      // Split content into lines and build list structure
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      // Group lines by indentation level to form proper nested lists
      const rootItems: { content: JSX.Element | string; level: number; children: any[] }[] = [];
      let currentList = rootItems;
      let parentStack: any[] = [];
      
      lines.forEach(line => {
        // Calculate indentation level
        const indentMatch = line.match(/^(\s+)/);
        const level = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;
        const trimmedLine = line.trimStart();
        
        // Process any bold formatting in the line
        const formattedContent = processBoldTags(trimmedLine);
        
        // Create new item for this line
        const newItem = {
          content: formattedContent,
          level,
          children: []
        };
        
        if (level === 0) {
          // Top-level item
          rootItems.push(newItem);
          currentList = newItem.children;
          parentStack = [newItem];
        } else {
          // Find the appropriate parent for this level
          while (parentStack.length > level) {
            parentStack.pop();
          }
          
          if (parentStack.length === level) {
            const parent = parentStack[level - 1];
            if (parent) {
              parent.children.push(newItem);
              parentStack.push(newItem);
              currentList = newItem.children;
            }
          }
        }
      });
      
      // Render the nested list structure
      return renderNestedList(rootItems);
    }
    
    return null;
  };
  
  // Process bold tags within text
  const processBoldTags = (text: string): JSX.Element | string => {
    if (!text.includes('<b>') || !text.includes('</b>')) {
      return text;
    }
    
    const parts = [];
    let currentIndex = 0;
    let boldStart = text.indexOf('<b>', currentIndex);
    
    while (boldStart !== -1) {
      // Add the text before the bold tag
      if (boldStart > currentIndex) {
        parts.push({
          text: text.substring(currentIndex, boldStart),
          bold: false
        });
      }
      
      // Find the closing bold tag
      const boldEnd = text.indexOf('</b>', boldStart + 3);
      if (boldEnd === -1) break; // Malformed HTML
      
      // Add the bold text
      parts.push({
        text: text.substring(boldStart + 3, boldEnd),
        bold: true
      });
      
      currentIndex = boldEnd + 4; // Move past the closing tag
      boldStart = text.indexOf('<b>', currentIndex);
    }
    
    // Add any remaining text
    if (currentIndex < text.length) {
      parts.push({
        text: text.substring(currentIndex),
        bold: false
      });
    }
    
    return (
      <>
        {parts.map((part, i) => (
          <span key={i} className={part.bold ? 'font-bold' : ''}>
            {part.text}
          </span>
        ))}
      </>
    );
  };
  
  // Render a nested list structure using actual <ul> and <li> elements
  const renderNestedList = (items: any[]) => {
    if (!items || items.length === 0) return null;
    
    return (
      <ul className="list-disc pl-5">
        {items.map((item, index) => (
          <li key={index} className="mt-1 first:mt-0">
            {item.content}
            {item.children && item.children.length > 0 && (
              <ul className="list-square pl-5 mt-1">
                {item.children.map((child: any, childIndex: number) => (
                  <li key={childIndex}>
                    {child.content}
                    {child.children && child.children.length > 0 && renderNestedList(child.children)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`formatted-perk ${className}`}>
      {processContent()}
    </div>
  );
};

export default FormattedPerk;
