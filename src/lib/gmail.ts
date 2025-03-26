
import { toast } from "@/hooks/use-toast";

// Types for Gmail data
export interface GmailEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    headers: {
      name: string;
      value: string;
    }[];
    body?: {
      data?: string;
    };
    parts?: {
      mimeType: string;
      body: {
        data?: string;
      };
    }[];
  };
  internalDate: string;
}

export interface EmailDisplay {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  time: string;
  date: string;
  isRead: boolean;
  category: string;
}

export interface EmailDetail extends EmailDisplay {
  to: string;
  content: string;
  hasAttachments: boolean;
}

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

// Convert Gmail raw data to our display format
export function convertToEmailDisplay(email: GmailEmail): EmailDisplay {
  // Parse headers
  const headers = email.payload?.headers || [];
  const fromHeader = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
  const parsed = parseEmailAddress(fromHeader);
  const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No subject)';
  
  // Format date
  const { time, date } = formatEmailDate(email.internalDate);
  
  // Check if email is read
  const isRead = !email.labelIds?.includes('UNREAD');
  
  return {
    id: email.id,
    from: parsed.name,
    fromEmail: parsed.email,
    subject: subjectHeader,
    preview: email.snippet || '',
    time,
    date,
    isRead,
    category: determineCategory(email)
  };
}

// Convert Gmail raw data to detailed email format
export function convertToEmailDetail(email: GmailEmail): EmailDetail {
  const emailDisplay = convertToEmailDisplay(email);
  const headers = email.payload?.headers || [];
  
  // Get to field
  const toHeader = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
  const to = parseEmailAddress(toHeader).email;
  
  // Get content
  let content = '';
  
  // Try to get content from parts (multipart emails)
  if (email.payload?.parts) {
    const htmlPart = email.payload.parts.find(part => part.mimeType === 'text/html');
    const textPart = email.payload.parts.find(part => part.mimeType === 'text/plain');
    
    if (htmlPart && htmlPart.body.data) {
      content = decodeBase64Url(htmlPart.body.data);
    } else if (textPart && textPart.body.data) {
      content = decodeBase64Url(textPart.body.data);
      content = `<div style="white-space: pre-wrap;">${content}</div>`;
    }
  } 
  // Try to get content directly from body
  else if (email.payload?.body?.data) {
    content = decodeBase64Url(email.payload.body.data);
  }
  
  // Check for attachments
  const hasAttachments = email.payload?.parts?.some(part => part.body && 
    (part.body.data === undefined || part.mimeType.startsWith('application/') || 
     part.mimeType.startsWith('image/'))) || false;
  
  return {
    ...emailDisplay,
    to,
    content,
    hasAttachments
  };
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

// Fetch emails from a specific folder
export async function fetchEmails(accessToken: string, maxResults = 10, folder = 'inbox'): Promise<EmailDisplay[]> {
  try {
    const query = getFolderQueryParam(folder);
    
    // Get message list
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }
    
    const data = await response.json();
    const messageIds = data.messages || [];
    
    if (!messageIds.length) {
      return [];
    }
    
    // Fetch details for each message
    const emailPromises = messageIds.map(async (msg: { id: string }) => {
      const msgResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      if (!msgResponse.ok) {
        throw new Error(`Failed to fetch email with ID: ${msg.id}`);
      }
      
      const emailData: GmailEmail = await msgResponse.json();
      return convertToEmailDisplay(emailData);
    });
    
    return await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error fetching emails:', error);
    toast({
      title: "Error fetching emails",
      description: error instanceof Error ? error.message : "Failed to load your emails",
      variant: "destructive"
    });
    return [];
  }
}

// Fetch a specific email by ID
export async function fetchEmailById(accessToken: string, emailId: string): Promise<EmailDetail | null> {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch email details');
    }
    
    const emailData: GmailEmail = await response.json();
    return convertToEmailDetail(emailData);
  } catch (error) {
    console.error('Error fetching email details:', error);
    toast({
      title: "Error fetching email",
      description: error instanceof Error ? error.message : "Failed to load email details",
      variant: "destructive"
    });
    return null;
  }
}
