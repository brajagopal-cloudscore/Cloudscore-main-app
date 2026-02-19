import React, { useEffect, useState } from 'react';
import * as emoji from "node-emoji";
import { highlightSearchTerms } from '@/lib/utils/highlight';

interface SlackTextRendererProps {
  text: string | undefined | null;
  searchQuery?: any;
  channelMembers?: any[];
  disableFileLinks?: boolean;
}

const SlackTextRenderer: React.FC<SlackTextRendererProps> = ({ 
  text, 
  searchQuery,
  channelMembers = [],
  disableFileLinks = true
}) => {
  const [processedText, setProcessedText] = useState<string>('');
  
  useEffect(() => {
    if (!text) {
      setProcessedText('');
      return;
    }
    
    // Process the text
    try {
      // Step 1: Handle pre-encoded XML/HTML content first
      // This specifically targets patterns like &lt;ac:link&gt; in the input
      let processed = text;
      
      // Pre-process encoded XML/HTML content and wrap it with styled spans
      processed = processed.replace(/&lt;(ac:|ri:|\/ac:|\/ri:)([^&]*)&gt;/g, (match) => {
        // Style the encoded XML content nicely for display
        return `<span class="inline-block bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded-sm font-mono text-xs mx-0.5">${match}</span>`;
      });
      
      // Process mentions
      processed = processMentions(processed, channelMembers);
      
      // Process emojis
      processed = processEmojis(processed);
      
      // Process code blocks
      processed = processCodeBlocks(processed);
      
      // Process formatting (bold, italic, strikethrough)
      processed = processFormatting(processed);
      
      // Process links
      processed = processLinks(processed, disableFileLinks);
      
      // Process newlines
      processed = processed.replace(/\n/g, '<br/>');
      
      // Apply search highlighting if needed
      if (searchQuery && searchQuery.rules && searchQuery.rules.length > 0) {
        processed = highlightSearchTerms(processed, searchQuery);
      }
      
      setProcessedText(processed);
    } catch (error) {
      console.error('Error processing text:', error);
      // Fallback to simple escaping if there's an error
      setProcessedText(text);
    }
  }, [text, searchQuery, channelMembers, disableFileLinks]);
  
  // Helper function to escape regex special characters
  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  // Helper function to process mentions
  const processMentions = (input: string, members: any[]): string => {
    let result = input;
    
    // Create a set of member names for precise mention matching
    const memberNames = new Set<string>();
    if (members && members.length > 0) {
      members.forEach(member => {
        if (member.name) {
          memberNames.add(member.name);
        }
      });
    }
    
    // Process mentions
    if (memberNames.size > 0) {
      for (const name of Array.from(memberNames)) {
        const regex = new RegExp(`@(${escapeRegExp(name)})\\b`, 'g');
        result = result.replace(regex, 
          `<span class="bg-blue-50 text-blue-700 px-1 rounded">@$1</span>`);
      }
    } else {
      // Simple mention pattern
      result = result.replace(/@([a-zA-Z0-9_]+(?: [a-zA-Z0-9_]+)*)/g, 
        `<span class="bg-blue-50 text-blue-700 px-1 rounded">@$1</span>`);
    }
    
    return result;
  };
  
  // Helper function to process emojis
  const processEmojis = (input: string): string => {
    return input.replace(/:([a-zA-Z0-9_\-+]+):/g, (match, name) => {
      const emojiChar = emoji.get(name);
      if (emojiChar && emojiChar !== `:${name}:`) return emojiChar;
      return match;
    });
  };
  
  // Helper function to process code blocks
  const processCodeBlocks = (input: string): string => {
    // Process inline code blocks
    return input.replace(/`([^`]+)`/g, 
      '<code class="bg-gray-100 px-1 py-0.5 rounded font-mono text-red-600">$1</code>');
  };
  
  // Helper function to process formatting
  const processFormatting = (input: string): string => {
    let result = input;
    
    // Process bold formatting
    result = result.replace(/\*\*(.+?)\*\*|\*(.+?)\*/g, '<strong>$1$2</strong>');
    
    // Process italic formatting - careful with underscores in variable_names
    result = result.replace(/(?<![a-zA-Z0-9])_([^_]+?)_(?![a-zA-Z0-9])/g, '<em>$1</em>');
    
    // Process strikethrough
    result = result.replace(/~(.+?)~/g, '<span class="line-through">$1</span>');
    
    return result;
  };
  
  // Helper function to process links
  const processLinks = (input: string, disableLinks: boolean): string => {
    let result = input;
    
    // Process mailto links
    result = result.replace(/<mailto:([^|>]+)\|([^>]+)>/g, 
      '<span class="text-blue-600">$2</span>');
    
    // Handle Slack's formatted links
    result = result.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, (match, url, displayText) => {
      const isFileLink = /\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt)$/i.test(url) || 
                         displayText.match(/\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt)$/i);
      
      if (disableLinks && isFileLink) {
        return '';
      }
      return `<span class="text-blue-600 underline">${displayText}</span>`;
    });
    
    // Handle plain URLs
    result = result.replace(/<(https?:\/\/[^>]+)>/g, (match, url) => {
      const isFileLink = /\.(png|jpg|jpeg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|txt)$/i.test(url);
      
      if (disableLinks && isFileLink) {
        return '';
      }
      return `<span class="text-blue-600 underline">${url}</span>`;
    });
    
    // Clean up file references
    if (disableLinks) {
      result = result.replace(/<div class="file_container[^>]*>[\s\S]*?<\/div>/g, '');
      result = result.replace(/\b(image\.png|document\.pdf|file\.(doc|xls|ppt|zip|txt))\b/gi, '');
    }
    
    return result;
  };
  
  if (!processedText) return null;
  
  return (
    <div 
      className="text-sm text-[#262627] whitespace-pre-wrap break-words"
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
};

export default SlackTextRenderer;
