import React, { useState, useEffect } from 'react';
import { Reply, Forward, Archive, Trash, MoreHorizontal, Mail, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchEmailById, EmailDetail, markEmailAsRead } from '@/lib/gmail';
import { ComposeEmail } from './ComposeEmail';
import { Button } from '@/components/ui/button';

interface EmailPreviewProps {
  emailId: string | null;
  onEmailRead?: (emailId: string) => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ emailId, onEmailRead }) => {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [replyOpen, setReplyOpen] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadEmailDetails = async () => {
      if (!emailId || !user?.accessToken) {
        setEmail(null);
        return;
      }
      
      setLoading(true);
      try {
        const emailData = await fetchEmailById(user.accessToken, emailId);
        setEmail(emailData);
        
        // Mark the email as read if it's not already read
        if (emailData && !emailData.isRead) {
          await markEmailAsRead(user.accessToken, emailId);
          if (onEmailRead) {
            onEmailRead(emailId);
          }
        }
      } catch (error) {
        console.error('Failed to load email details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmailDetails();
  }, [emailId, user?.accessToken, onEmailRead]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading email content...</p>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center animate-fade-in">
          <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No email selected</h3>
          <p className="text-muted-foreground">Select an email to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-medium">{email.subject}</h2>
          <div className="flex items-center space-x-2">
            <button className="button-icon" aria-label="Archive">
              <Archive size={18} className="text-foreground/70" />
            </button>
            <button className="button-icon" aria-label="Delete">
              <Trash size={18} className="text-foreground/70" />
            </button>
            <button className="button-icon" aria-label="More options">
              <MoreHorizontal size={18} className="text-foreground/70" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {email.from.charAt(0)}
            </div>
            <div>
              <div className="flex items-baseline space-x-2 flex-wrap">
                <h3 className="text-base font-medium">{email.from}</h3>
                <span className="text-sm text-muted-foreground">&lt;{email.fromEmail}&gt;</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1 flex-wrap">
                <span>To: {email.to}</span>
                <span>•</span>
                <span>{email.date}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button className="hover-effect text-xs text-muted-foreground hover:text-primary flex items-center gap-1 px-2 py-1 rounded hover:bg-primary/5">
              <Calendar size={14} />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: email.content }} />
      </div>

      <div className="border-t border-border p-4">
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setReplyOpen(true)}
            className="flex items-center justify-center gap-2"
          >
            <Reply size={16} />
            <span>Reply</span>
          </Button>
          <Button 
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <Forward size={16} />
            <span>Forward</span>
          </Button>
        </div>
      </div>

      {replyOpen && (
        <ComposeEmail 
          isOpen={replyOpen} 
          onClose={() => setReplyOpen(false)}
          replyTo={{
            to: email.fromEmail,
            subject: email.subject
          }}
        />
      )}
    </div>
  );
};
