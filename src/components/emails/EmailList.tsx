
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EmailListProps {
  selectedEmail: number | null;
  onSelectEmail: (id: number) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ selectedEmail, onSelectEmail }) => {
  // Mock email data
  const emails = [
    {
      id: 1,
      from: 'Team Workspace',
      subject: 'Your weekly summary report',
      preview: 'Here\'s your activity summary for the past week. You have completed 12 tasks and...',
      time: '10:24 AM',
      isRead: false,
      category: 'important'
    },
    {
      id: 2,
      from: 'Sarah Johnson',
      subject: 'Project timeline updates',
      preview: 'I wanted to share some updates regarding our project timeline. We might need to...',
      time: '9:15 AM',
      isRead: false,
      category: 'work'
    },
    {
      id: 3,
      from: 'Dropbox',
      subject: 'Security alert: new sign-in',
      preview: 'We noticed a new sign-in to your Dropbox account. If this was you, you can ignore this message...',
      time: 'Yesterday',
      isRead: true,
      category: 'updates'
    },
    {
      id: 4,
      from: 'Alex Chen',
      subject: 'Dinner next week?',
      preview: 'Hey! I was wondering if you\'d like to grab dinner next week? I found this amazing new restaurant...',
      time: 'Yesterday',
      isRead: true,
      category: 'personal'
    },
    {
      id: 5,
      from: 'Product Team',
      subject: 'New features now available',
      preview: 'We\'re excited to announce that we\'ve just released several new features you\'ve been asking for...',
      time: 'Sep 28',
      isRead: true,
      category: 'updates'
    },
    {
      id: 6,
      from: 'Michael Smith',
      subject: 'Question about the presentation',
      preview: 'I have a few questions about the presentation for tomorrow\'s meeting. Can you clarify...',
      time: 'Sep 27',
      isRead: true,
      category: 'work'
    },
    {
      id: 7,
      from: 'Travel Booking',
      subject: 'Your flight confirmation',
      preview: 'Your upcoming flight to San Francisco has been confirmed. Here are your booking details...',
      time: 'Sep 25',
      isRead: true,
      category: 'important'
    },
    {
      id: 8,
      from: 'Newsletter',
      subject: 'This week in tech: AI developments',
      preview: 'The top stories in tech this week include major developments in AI, new product launches...',
      time: 'Sep 24',
      isRead: true,
      category: 'newsletters'
    },
    {
      id: 9,
      from: 'Calendar',
      subject: 'Reminder: Team meeting tomorrow',
      preview: 'This is a reminder that you have a team meeting scheduled for tomorrow at 10:00 AM...',
      time: 'Sep 23',
      isRead: true,
      category: 'work'
    },
    {
      id: 10,
      from: 'Invoice System',
      subject: 'Your monthly invoice',
      preview: 'Your invoice for September is now available. The total amount due is $129.99...',
      time: 'Sep 21',
      isRead: true,
      category: 'updates'
    }
  ];

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
      'important': { label: 'Important', variant: 'default' },
      'work': { label: 'Work', variant: 'secondary' },
      'personal': { label: 'Personal', variant: 'outline' },
      'updates': { label: 'Updates', variant: 'outline' },
      'newsletters': { label: 'Newsletter', variant: 'outline' }
    };

    const categoryInfo = categories[category];
    if (!categoryInfo) return null;

    return (
      <Badge variant={categoryInfo.variant} className="text-xs font-normal">
        {categoryInfo.label}
      </Badge>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-base font-medium">Inbox</h2>
        <span className="text-sm text-muted-foreground">12 unread</span>
      </div>
      <div className="divide-y divide-border">
        {emails.map((email) => (
          <div 
            key={email.id}
            onClick={() => onSelectEmail(email.id)}
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
        ))}
      </div>
    </div>
  );
};
