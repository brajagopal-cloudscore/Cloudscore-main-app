/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date string to a human-readable format
 * @param dateString - ISO date string or date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(
  dateString: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  if (!dateString) return "N/A"
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"
    
    return date.toLocaleDateString("en-US", options)
  } catch {
    return "N/A"
  }
}

/**
 * Formats a date string to a relative time format (e.g., "2 days ago")
 * @param dateString - ISO date string or date object
 * @returns Relative time string or "N/A" if invalid
 */
export function formatRelativeTime(
  dateString: string | Date | null | undefined
): string {
  if (!dateString) return "N/A"
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "N/A"
    
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  } catch {
    return "N/A"
  }
}

/**
 * Formats a date string to a compact format (e.g., "Aug 24, 2025")
 * @param dateString - ISO date string or date object
 * @returns Compact date string or "N/A" if invalid
 */
export function formatCompactDate(
  dateString: string | Date | null | undefined
): string {
  return formatDate(dateString, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
