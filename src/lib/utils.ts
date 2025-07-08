/**
 * Formats a date or date range for display
 * @param startDate Start date of the event
 * @param endDate Optional end date of the event
 * @returns Formatted date string
 */
export function formatDate(startDate: string, endDate?: string): string {
  // Parse dates
  const start = new Date(startDate);
  
  // Format options
  const dateOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  // If no end date or same as start date, return just the start date
  if (!endDate || startDate === endDate) {
    return start.toLocaleDateString('en-US', dateOptions);
  }
  
  const end = new Date(endDate);
  
  // If dates are in the same month and year
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', { day: 'numeric' })} - ${end.toLocaleDateString('en-US', dateOptions)}`;
  }
  
  // Different months or years
  return `${start.toLocaleDateString('en-US', dateOptions)} - ${end.toLocaleDateString('en-US', dateOptions)}`;
}
