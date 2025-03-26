import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEmails, EmailDisplay } from '@/lib/gmail';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ComposeEmail } from './ComposeEmail';

interface EmailListProps {
  selectedEmail: string | null;
  onSelectEmail: (id: string) => void;
  currentFolder: string;
  onUnreadCountChange?: (count: number) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ 
  selectedEmail, 
  onSelectEmail, 
  currentFolder,
  onUnreadCountChange 
}) => {
  const [emails, setEmails] = useState<EmailDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [composeOpen, setComposeOpen] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadEmails = async () => {
      if (!user?.accessToken) return;
      
      setLoading(true);
      try {
        const emailData = await fetchEmails(user.accessToken, 20, currentFolder);
        setEmails(emailData);
        
        // Update unread count
        const unreadCount = emailData.filter(email => !email.isRead).length;
        if (onUnreadCountChange) {
          onUnreadCountChange(unreadCount);
        }
      } catch (error) {
        console.error('Failed to load emails:', error);
        toast({
          title: "Error loading emails",
          description: "Could not retrieve your emails. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
    
    // Refresh emails every 5 minutes
    const intervalId = setInterval(loadEmails, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user?.accessToken, currentFolder, onUnreadCountChange]);

  const handleEmailRead = (emailId: string) => {
    setEmails(prev => 
      prev.map(email => 
        email.id === emailId 
          ? { ...email, isRead: true } 
          : email
      )
    );
    
    // Update unread count
    const unreadCount = emails.filter(email => 
      email.id !== emailId && !email.isRead
    ).length;
    
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'important': { label: 'Important', variant: 'default' },
      'work': { label: 'Work', variant: 'secondary' },
      'personal': { label: 'Personal', variant: 'outline' },
      'updates': { label: 'Updates', variant: 'outline' },
      'primary': { label: 'Primary', variant: 'outline' },
      'social': { label: 'Social', variant: 'outline' },
      'promotions': { label: 'Promotion', variant: 'outline' },
      'forums': { label: 'Forum', variant: 'outline' }
    };

    const categoryInfo = categories[category];
    if (!categoryInfo) return null;

    return (
      <Badge variant={categoryInfo.variant} className="text-xs font-normal">
        {categoryInfo.label}
      </Badge>
    );
  };

  const getFolderTitle = () => {
    const folderNames: Record<string, string> = {
      'inbox': 'Inbox',
      'sent': 'Sent',
      'draft': 'Drafts',
      'trash': 'Trash',
      'archive': 'Archive'
    };
    
    return folderNames[currentFolder] || 'Inbox';
  };

  const unreadCount = emails.filter(email => !email.isRead).length;

  if (loading && emails.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-medium">{getFolderTitle()}</h2>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-base font-medium">{getFolderTitle()}</h2>
        <div className="flex items-center gap-2">
          {currentFolder === 'inbox' && (
            <span className="text-sm text-muted-foreground">{unreadCount} unread</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setComposeOpen(true)}
            className="h-8 w-8 rounded-full"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Compose Email</span>
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border flex-1">
        {emails.length === 0 && !loading ? (
          <div className="p-4 text-center text-muted-foreground">
            No emails found
          </div>
        ) : (
          emails.map((email) => (
            <div 
              key={email.id}
              onClick={() => {
                onSelectEmail(email.id);
                if (!email.isRead) {
                  handleEmailRead(email.id);
                }
              }}
              className={`email-row animate-fade-in ${selectedEmail === email.id ? 'email-row-active' : ''} ${!email.isRead ? 'bg-secondary/30' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${!email.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm ${!email.isRead ? 'font-semibold' : 'font-medium'}`}>{email.from}</p>
                    <span className="text-xs text-muted-foreground">{email.time}</span>
                  </div>
                  <h3 className={`text-sm ${!email.isRead ? 'font-medium' : ''} truncate`}>{email.subject}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-1">{email.preview}</p>
                  <div className="mt-2">
                    {getCategoryBadge(email.category)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {composeOpen && (
        <ComposeEmail isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
      )}
    </div>
  );
};
