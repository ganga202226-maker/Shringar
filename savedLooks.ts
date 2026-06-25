import { format, formatDistanceToNow } from 'date-fns';

/**
 * Format price in Indian number format: ₹X,XX,XXX
 */
export function formatPrice(price: number): string {
  if (!price || price === 0) return 'Free';
  
  const numStr = Math.round(price).toString();
  const lastThree = numStr.slice(-3);
  const otherDigits = numStr.slice(0, -3);
  
  if (otherDigits === '') return `₹${lastThree}`;
  
  const formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${formatted},${lastThree}`;
}

/**
 * Format date as DD MMM YYYY
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd MMM yyyy');
}

/**
 * Format date as relative (e.g. "2 days to go")
 */
export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Countdown days to a given date
 */
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Format duration in hours and minutes
 */
export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Format rating with half star
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Generate star rating array (filled, half-filled, empty)
 */
export function getStarArray(rating: number): ('full' | 'half' | 'empty')[] {
  const stars: ('full' | 'half' | 'empty')[] = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) stars.push('full');
    else if (i === fullStars && hasHalf) stars.push('half');
    else stars.push('empty');
  }
  return stars;
}