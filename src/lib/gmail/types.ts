
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
