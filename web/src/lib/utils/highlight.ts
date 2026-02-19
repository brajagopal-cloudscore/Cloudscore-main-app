export const highlightSearchTerms = (content: string, searchRules: any): string => {
  if (!content || !searchRules || !searchRules.rules || searchRules.rules.length === 0) {
    return content;
  }

  // Extract search terms from the rules
  const searchTerms = searchRules?.rules?.map((rule: any) => rule.value as string);

  if (searchTerms.length === 0) {
    return content;
  }

  // Create a temporary DOM element to parse the HTML content
  const tempElement = document.createElement('div');
  tempElement.innerHTML = content;

  // Function to recursively process text nodes
  const processNode = (node: Node) => {
    // If it's a text node, highlight the search terms
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      let hasMatch = false;
      let highlightedText = text;

      // Apply highlighting for each search term
      searchTerms.forEach((term: string) => {
        if (!term) return;

        // Case insensitive search
        const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        if (regex.test(highlightedText)) {
          hasMatch = true;
          highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
        }
      });

      // Replace the text node with the highlighted HTML if there was a match
      if (hasMatch) {
        const span = document.createElement('span');
        span.innerHTML = highlightedText;
        node.parentNode?.replaceChild(span, node);
        return;
      }
    }

    // For element nodes, process all child nodes
    else if (node.nodeType === Node.ELEMENT_NODE) {
      // Don't highlight content inside <script>, <style>, etc.
      const tagName = (node as Element).tagName.toLowerCase();
      if (['script', 'style', 'noscript', 'mark'].includes(tagName)) {
        return;
      }

      // Process all child nodes
      Array.from(node.childNodes).forEach(childNode => {
        processNode(childNode);
      });
    }
  };

  // Process the entire content
  Array.from(tempElement.childNodes).forEach(processNode);
  
  return tempElement.innerHTML;
};

/**
 * Highlights plain text with search terms
 * Used for text that's not already in HTML format
 */
export const highlightPlainText = (text: string | string[] | any, searchRules: any): string => {
  if (!text || !searchRules || !searchRules.rules || searchRules.rules.length === 0) {
    return formatTextInput(text);
  }

  // Extract search terms from the rules
  const searchTerms = searchRules?.rules?.map((rule: any) => rule.value as string);

  if (searchTerms.length === 0) {
    return formatTextInput(text);
  }

  // Convert input to string format
  const textString = formatTextInput(text);
  
  // Escape HTML special characters
  let escapedText = textString?.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Highlight each search term
  searchTerms.forEach((term: string) => {
    if (!term) return;
    
    // Case insensitive search
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    escapedText = escapedText.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  });

  return escapedText;
};

/**
 * Helper function to format different input types to string
 */
const formatTextInput = (text: string | string[] | any): string => {
  if (!text) return '';
  
  // If it's an array, join with commas
  if (Array.isArray(text)) {
    return text.join(', ');
  }
  
  // If it's already a string, return as is
  if (typeof text === 'string') {
    return text;
  }
  
  // For other types, convert to string
  return String(text);
};
