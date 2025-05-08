/**
 * Format a date string to a more readable format
 * @param {string} dateString - The ISO date string
 * @return {string} Formatted date
 */
export const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Convert a date to a relative time string (e.g., "2 hours ago")
 * @param {string} dateString - The ISO date string
 * @return {string} Relative time
 */
export const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000); // difference in seconds
  
  if (diff < 60) {
    return 'just now';
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (diff < 31536000) {
    const months = Math.floor(diff / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diff / 31536000);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}; 