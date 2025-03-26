
import { toast } from "@/hooks/use-toast";
import { EmailDisplay, EmailDetail, GmailEmail } from './types';
import { getFolderQueryParam } from './formatters';
import { convertToEmailDisplay, convertToEmailDetail } from './converters';

// Maximum number of retry attempts for API requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Helper function to retry failed fetch requests
 */
async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // If response is ok, return it immediately
    if (response.ok) return response;
    
    // Handle unauthorized errors specially - no retry for these
    if (response.status === 401) {
      console.error('Authentication token invalid or expired:', response.status);
      const errorData = await response.json().catch(() => null);
      console.error('Auth error details:', errorData);
      throw new Error('Your session has expired. Please log in again.');
    }
    
    // For other errors, retry if we have retries left
    if (retries > 0) {
      console.log(`Request failed with status ${response.status}. Retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    
    // No more retries, throw the error
    const errorData = await response.json().catch(() => null);
    console.error('API error details:', errorData);
    throw new Error(`API request failed with status: ${response.status}`);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch') && retries > 0) {
      // Network error, retry
      console.log(`Network error: ${error.message}. Retrying... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

/**
 * Validates the access token before making requests
 */
function validateToken(accessToken: string | undefined): string {
  if (!accessToken) {
    const error = new Error('No access token available');
    console.error(error);
    throw error;
  }
  return accessToken;
}

// Fetch emails from a specific folder
export async function fetchEmails(accessToken: string, maxResults = 10, folder = 'inbox'): Promise<EmailDisplay[]> {
  try {
    const token = validateToken(accessToken);
    
    const query = getFolderQueryParam(folder);
    console.log(`Fetching emails for folder: ${folder} with query: ${query}`);
    
    // Get message list
    const response = await fetchWithRetry(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
    const data = await response.json();
    const messageIds = data.messages || [];
    
    if (!messageIds.length) {
      console.log('No messages found for the specified folder');
      return [];
    }
    
    console.log(`Found ${messageIds.length} messages, fetching details...`);
    
    // Fetch details for each message
    const emailPromises = messageIds.map(async (msg: { id: string }) => {
      try {
        const msgResponse = await fetchWithRetry(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        const emailData: GmailEmail = await msgResponse.json();
        return convertToEmailDisplay(emailData);
      } catch (error) {
        console.error(`Failed to fetch email with ID ${msg.id}:`, error);
        // Return null for failed emails, we'll filter them out later
        return null;
      }
    });
    
    // Wait for all emails to be fetched and filter out failed ones
    const emails = (await Promise.all(emailPromises)).filter(email => email !== null) as EmailDisplay[];
    console.log(`Successfully fetched ${emails.length} out of ${messageIds.length} emails`);
    return emails;
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
    const token = validateToken(accessToken);
    
    console.log(`Fetching email details for ID: ${emailId}`);
    
    const response = await fetchWithRetry(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    
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

// Mark an email as read
export async function markEmailAsRead(accessToken: string, emailId: string): Promise<boolean> {
  try {
    const token = validateToken(accessToken);
    
    console.log(`Marking email ${emailId} as read`);
    
    const response = await fetchWithRetry(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD']
        })
      }
    );
    
    console.log(`Email ${emailId} marked as read successfully`);
    return true;
  } catch (error) {
    console.error('Error marking email as read:', error);
    return false;
  }
}
