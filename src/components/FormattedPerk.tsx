'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface FormattedPerkProps {
  content: string;
  className?: string;
}

/**
 * Component for rendering perks with HTML-like formatting and indentation
 * Supports <b> tags for bold text and handles indentation with proper styling
 */
const FormattedPerk: React.FC<FormattedPerkProps> = ({ content, className = '' }) => {
  // Process the content string to extract indentation and formatting
  const processContent = () => {
    // If content has line breaks, split and render each line separately
    if (content.includes('\n')) {
      return content.split('\n').map((line, index) => {
        return (
          <div key={index} className="mt-1 first:mt-0">
            {renderFormattedLine(line)}
          </div>
        );
      });
    }
    
    // Otherwise just render the single line
    return renderFormattedLine(content);
  };
  
  const renderFormattedLine = (line: string) => {
    // Calculate indentation based on leading spaces
    const indentMatch = line.match(/^(\s+)/);
    const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;
    const trimmedLine = line.trimStart();
    
    // Check if line contains bold tags
    const hasBoldTags = trimmedLine.includes('<b>') && trimmedLine.includes('</b>');
    
    // Replace <b> tags with proper React elements
    let content = trimmedLine;
    if (hasBoldTags) {
      // Split the content by bold tags
      const parts = [];
      let currentIndex = 0;
      let boldStart = content.indexOf('<b>', currentIndex);
      
      while (boldStart !== -1) {
        // Add the text before the bold tag
        if (boldStart > currentIndex) {
          parts.push({
            text: content.substring(currentIndex, boldStart),
            bold: false
          });
        }
        
        // Find the closing bold tag
        const boldEnd = content.indexOf('</b>', boldStart + 3);
        if (boldEnd === -1) break; // Malformed HTML, no closing tag
        
        // Add the bold text
        parts.push({
          text: content.substring(boldStart + 3, boldEnd),
          bold: true
        });
        
        currentIndex = boldEnd + 4; // Move past the closing tag
        boldStart = content.indexOf('<b>', currentIndex);
      }
      
      // Add any remaining text after the last bold tag
      if (currentIndex < content.length) {
        parts.push({
          text: content.substring(currentIndex),
          bold: false
        });
      }
      
      // Render the parts
      return (
        <div className={`flex items-start ${indentLevel > 0 ? `ml-${indentLevel * 1}` : ''}`}>
          {indentLevel > 0 && (
            <ChevronRight className="h-4 w-4 mr-1 text-navy-800 flex-shrink-0 mt-[0.15rem]" />
          )}
          <div>
            {parts.map((part, i) => (
              <span key={i} className={part.bold ? 'font-bold' : ''}>
                {part.text}
              </span>
            ))}
          </div>
        </div>
      );
    }
    
    // If no bold tags, just render the text with indentation
    return (
      <div className={`flex items-start ${indentLevel > 0 ? `ml-${indentLevel * 1}` : ''}`}>
        {indentLevel > 0 && (
          <ChevronRight className="h-4 w-4 mr-1 text-navy-800 flex-shrink-0 mt-[0.15rem]" />
        )}
        <span>{trimmedLine}</span>
      </div>
    );
  };

  return (
    <div className={`formatted-perk ${className}`}>
      {processContent()}
    </div>
  );
};

export default FormattedPerk;
