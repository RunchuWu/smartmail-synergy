import { toast } from "@/hooks/use-toast";
import { EmailDisplay, EmailDetail, GmailEmail } from './types';
import { getFolderQueryParam } from './formatters';
import { convertToEmailDisplay, convertToEmailDetail } from './converters';

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

// Mark an email as read
export async function markEmailAsRead(accessToken: string, emailId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}/modify`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          removeLabelIds: ['UNREAD']
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to mark email as read');
    }
    
    return true;
  } catch (error) {
    console.error('Error marking email as read:', error);
    return false;
  }
}
