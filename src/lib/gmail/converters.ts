
import { GmailEmail, EmailDisplay, EmailDetail } from './types';
import { parseEmailAddress, formatEmailDate, decodeBase64Url, determineCategory } from './formatters';

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
