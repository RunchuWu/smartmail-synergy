
import React from 'react';
import { Reply, Forward, Archive, Trash, MoreHorizontal, Mail, Calendar } from 'lucide-react';

interface EmailPreviewProps {
  emailId: number | null;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ emailId }) => {
  // Selected email would typically come from a state or API
  // Using a mock email for now
  const email = emailId
    ? {
        id: emailId,
        from: {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
        },
        to: 'john.doe@example.com',
        subject: 'Project timeline updates',
        date: 'September 28, 2023, 9:15 AM',
        content: `
          <p>Hi John,</p>
          <p>I wanted to share some updates regarding our project timeline. After reviewing the current progress and discussing with the team, we've made some adjustments to ensure we can deliver everything with the quality we expect.</p>
          <p>Here are the key updates:</p>
          <ul>
            <li>Design phase: Extended by 3 days to incorporate additional feedback</li>
            <li>Development sprint 1: Starting on October 5th instead of October 2nd</li>
            <li>Testing phase: Remains unchanged, but we'll be bringing in an additional QA resource</li>
          </ul>
          <p>These changes will push our final delivery date by approximately one week, but we believe this will result in a much better end product. Please let me know if you have any concerns about these adjustments.</p>
          <p>Also, would you be available for a quick call tomorrow to discuss these changes in more detail? I'm free between 1-3pm or after 4:30pm.</p>
          <p>Best regards,<br>Sarah</p>
        `,
        hasAttachments: false,
      }
    : null;

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
              {email.from.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <h3 className="text-base font-medium">{email.from.name}</h3>
                <span className="text-sm text-muted-foreground">&lt;{email.from.email}&gt;</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
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
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Reply size={16} />
            <span>Reply</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
            <Forward size={16} />
            <span>Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
