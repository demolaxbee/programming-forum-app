/**
 * Format a date into a relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);

  if (diffInSecs < 60) {
    return diffInSecs === 1 ? '1 second ago' : `${diffInSecs} seconds ago`;
  }
  
  if (diffInMins < 60) {
    return diffInMins === 1 ? '1 minute ago' : `${diffInMins} minutes ago`;
  }
  
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }
  
  if (diffInDays < 30) {
    return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
  }
  
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
  }
  
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
}; 