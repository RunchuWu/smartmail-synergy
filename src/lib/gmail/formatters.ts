
import { GmailEmail } from './types';

// Convert RFC 2822 formatted email addresses
export function parseEmailAddress(input: string): { name: string; email: string } {
  // Match patterns like "Name <email@example.com>" or just "email@example.com"
  const match = input.match(/(?:"?([^"]*)"?\s)?(?:<)?([^>@\s]+@[^>@\s]+)(?:>)?/);
  
  if (match) {
    return {
      name: match[1] || match[2],
      email: match[2]
    };
  }
  
  return {
    name: input,
    email: input
  };
}

// Format date to readable format
export function formatEmailDate(timestamp: string): { time: string; date: string } {
  const date = new Date(parseInt(timestamp));
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  let dateStr = '';
  
  if (date.toDateString() === now.toDateString()) {
    dateStr = timeStr;
    timeStr = 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    dateStr = 'Yesterday';
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // Less than a week ago
    dateStr = date.toLocaleDateString([], { weekday: 'long' });
  } else if (date.getFullYear() === now.getFullYear()) {
    // Same year
    dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } else {
    // Different year
    dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
  
  return { time: timeStr, date: dateStr };
}

// Decode base64 URL safe text
export function decodeBase64Url(data: string): string {
  try {
    // Replace URL safe chars and add padding if needed
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = atob(base64 + padding);
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error('Error decoding base64:', error);
    return '';
  }
}

// Determine a category based on email content and headers
export function determineCategory(email: GmailEmail): string {
  const labelIds = email.labelIds || [];
  
  if (labelIds.includes('IMPORTANT')) return 'important';
  if (labelIds.includes('CATEGORY_PERSONAL')) return 'personal';
  if (labelIds.includes('CATEGORY_SOCIAL')) return 'social';
  if (labelIds.includes('CATEGORY_UPDATES')) return 'updates';
  if (labelIds.includes('CATEGORY_PROMOTIONS')) return 'promotions';
  if (labelIds.includes('CATEGORY_FORUMS')) return 'forums';
  
  // Subject-based categorization as fallback
  const subject = email.payload?.headers?.find(h => h.name.toLowerCase() === 'subject')?.value || '';
  if (/newsletter|update|news/i.test(subject)) return 'updates';
  if (/meeting|project|work/i.test(subject)) return 'work';
  
  return 'primary';
}

// Map folder names to Gmail label IDs
export function getFolderQueryParam(folder: string): string {
  const folderMap: Record<string, string> = {
    'inbox': 'in:inbox',
    'sent': 'in:sent',
    'draft': 'in:draft',
    'trash': 'in:trash',
    'archive': '-in:inbox -in:trash -in:spam',
  };
  
  return folderMap[folder] || 'in:inbox';
}
