
import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ComposeEmailProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: {
    to: string;
    subject: string;
  };
}

export const ComposeEmail: React.FC<ComposeEmailProps> = ({ isOpen, onClose, replyTo }) => {
  const [to, setTo] = useState(replyTo?.to || '');
  const [subject, setSubject] = useState(replyTo?.subject ? `Re: ${replyTo.subject.replace(/^Re: /, '')}` : '');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!to || !subject || !content) {
      toast({
        title: "Missing information",
        description: "Please fill all the fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!user?.accessToken) {
      toast({
        title: "Authentication error",
        description: "You need to be logged in to send emails",
        variant: "destructive"
      });
      return;
    }
    
    setSending(true);
    
    try {
      // Create email MIME message with proper headers
      const emailContent = [
        `From: ${user.name} <${user.email}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        content
      ].join('\r\n');
      
      // Encode the email in base64url format as required by Gmail API
      const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailContent)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Send the email using Gmail API with the proper format
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: base64EncodedEmail
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send email');
      }
      
      toast({
        title: "Email sent",
        description: "Your email has been sent successfully"
      });
      
      // Reset form and close dialog
      setTo('');
      setSubject('');
      setContent('');
      onClose();
      
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{replyTo ? 'Reply to Email' : 'Compose New Email'}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="to" className="text-sm font-medium">To:</label>
            <Input 
              id="to" 
              value={to} 
              onChange={(e) => setTo(e.target.value)} 
              placeholder="recipient@example.com" 
              disabled={sending}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">Subject:</label>
            <Input 
              id="subject" 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)} 
              placeholder="Email subject" 
              disabled={sending}
            />
          </div>
          
          <div className="space-y-2 flex-1">
            <label htmlFor="content" className="text-sm font-medium">Message:</label>
            <Textarea 
              id="content" 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Write your message here..." 
              className="min-h-[200px] flex-1"
              disabled={sending}
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button type="submit" className="flex items-center gap-2" disabled={sending}>
              {sending ? (
                <>Sending...</>
              ) : (
                <>
                  <Send size={16} />
                  <span>Send</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
