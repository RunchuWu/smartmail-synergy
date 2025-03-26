import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEmails, EmailDisplay } from '@/lib/gmail';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, AlertCircle, RefreshCw } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { user } = useAuth();

  const loadEmails = async (showLoading = true) => {
    if (!user?.accessToken) {
      console.log('No access token available, cannot load emails');
      setError('Authentication required. Please try logging in again.');
      setLoading(false);
      return;
    }
    
    if (showLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    
    setError(null);
    
    try {
      console.log(`Loading emails for folder: ${currentFolder} with token: ${user.accessToken.substring(0, 10)}...`);
      const emailData = await fetchEmails(user.accessToken, 20, currentFolder);
      console.log(`Loaded ${emailData.length} emails`);
      setEmails(emailData);
      
      // Update unread count
      const unreadCount = emailData.filter(email => !email.isRead).length;
      console.log(`Unread count: ${unreadCount}`);
      if (onUnreadCountChange) {
        onUnreadCountChange(unreadCount);
      }
    } catch (error) {
      console.error('Failed to load emails:', error);
      setError('Could not load emails. Please try again later.');
      toast({
        title: "Error loading emails",
        description: "Could not retrieve your emails. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmails();
    
    // Refresh emails every 5 minutes
    const intervalId = setInterval(() => loadEmails(false), 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [user?.accessToken, currentFolder]);

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

  const handleRefresh = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    loadEmails(false);
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
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
            <p className="mt-2 text-muted-foreground">Loading your emails...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-medium">{getFolderTitle()}</h2>
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
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="text-base font-medium mb-1">Failed to load emails</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <div className="flex flex-col gap-2 items-center">
              <Button onClick={loadEmails}>
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  localStorage.removeItem('emailAppUser');
                  window.location.href = '/login';
                }}
              >
                Return to Login
              </Button>
            </div>
          </div>
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
            onClick={handleRefresh}
            className="h-8 w-8 rounded-full"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
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
      
      {/* Loading overlay for when refreshing */}
      {refreshing && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="bg-card p-4 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        </div>
      )}
      
      {composeOpen && (
        <ComposeEmail isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
      )}
    </div>
  );
};
