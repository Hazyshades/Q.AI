// Shared utility functions used across the application

/**
 * Get color variant for priority levels
 */
export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'critical':
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * Get color variant for quality indicators
 */
export function getQualityColor(quality: string): string {
  switch (quality.toLowerCase()) {
    case 'good':
    case 'excellent':
      return 'default';
    case 'medium':
    case 'fair':
      return 'secondary';
    case 'poor':
    case 'bad':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Get icon name for category types
 */
export function getCategoryIcon(category: string): string {
  const categoryMap: Record<string, string> = {
    'functional': 'check-circle',
    'security': 'shield',
    'performance': 'zap',
    'usability': 'users',
    'reliability': 'alert-circle',
    'compatibility': 'monitor',
    'api': 'code',
    'database': 'database',
    'ui': 'layout',
    'auth': 'lock',
  };
  
  return categoryMap[category.toLowerCase()] || 'file-text';
}

/**
 * Format date to locale string
 */
export function formatDate(date: Date | string | number): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Sanitize string for safe JavaScript embedding
 * Prevents XSS when embedding strings in dynamically generated JS
 */
export function sanitizeForJS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if value is null or undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
