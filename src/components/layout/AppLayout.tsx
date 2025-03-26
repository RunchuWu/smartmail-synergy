
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../sidebar/Sidebar';
import { EmailList } from '../emails/EmailList';
import { EmailPreview } from '../emails/EmailPreview';
import { AIAssistant } from '../ai/AIAssistant';
import { SearchBar } from '../ui/SearchBar';
import { Settings, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ComposeEmail } from '../emails/ComposeEmail';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [folderUnreadCounts, setFolderUnreadCounts] = useState<Record<string, number>>({
    inbox: 0,
    draft: 0,
    reminders: 0
  });
  const { user, logout } = useAuth();

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
    setSelectedEmail(null); // Clear selected email when changing folders
  };

  const handleUnreadCountChange = (count: number) => {
    setFolderUnreadCounts(prev => ({
      ...prev,
      [currentFolder]: count
    }));
  };

  const handleEmailRead = (emailId: string) => {
    if (folderUnreadCounts[currentFolder] > 0) {
      setFolderUnreadCounts(prev => ({
        ...prev,
        [currentFolder]: prev[currentFolder] - 1
      }));
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div 
        className={`bg-sidebar transition-all duration-300 ease-in-out h-full ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
          activeFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onComposeClick={() => setComposeOpen(true)}
          folderUnreadCounts={folderUnreadCounts}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-border bg-white z-10">
          <div className="flex items-center gap-2">
            {sidebarCollapsed && (
              <button 
                onClick={() => setSidebarCollapsed(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                aria-label="Open Sidebar"
              >
                <span className="sr-only">Open Sidebar</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                </svg>
              </button>
            )}
            <div className="flex items-center w-full max-w-2xl">
              <SearchBar />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="button-icon" 
              onClick={() => setAssistantOpen(!assistantOpen)}
              aria-label="AI Assistant"
            >
              <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span className="text-sm font-semibold">AI</span>
              </span>
            </button>
            <button className="button-icon" aria-label="Notifications">
              <Bell size={20} className="text-foreground/70" />
            </button>
            <button className="button-icon" aria-label="Settings">
              <Settings size={20} className="text-foreground/70" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-2 h-8 w-8 rounded-full flex items-center justify-center overflow-hidden">
                  <Avatar>
                    {user?.picture ? (
                      <AvatarImage src={user.picture} alt={user.name || 'User'} />
                    ) : null}
                    <AvatarFallback>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex items-center gap-2">
                  <div className="font-medium">{user?.name || 'User'}</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive flex items-center gap-2">
                  <LogOut size={16} />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Email list */}
          <div className="w-80 border-r border-border overflow-y-auto bg-white">
            <EmailList 
              selectedEmail={selectedEmail} 
              onSelectEmail={setSelectedEmail} 
              currentFolder={currentFolder}
              onUnreadCountChange={handleUnreadCountChange}
            />
          </div>
          
          {/* Email preview */}
          <div className="flex-1 overflow-y-auto bg-white">
            <EmailPreview 
              emailId={selectedEmail} 
              onEmailRead={handleEmailRead}
            />
          </div>

          {/* AI Assistant Sidebar */}
          <div 
            className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 transform transition-transform duration-300 ease-in-out z-20 ${
              assistantOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <AIAssistant onClose={() => setAssistantOpen(false)} />
          </div>
        </div>
      </div>

      {/* Compose Email Dialog */}
      {composeOpen && (
        <ComposeEmail isOpen={composeOpen} onClose={() => setComposeOpen(false)} />
      )}
    </div>
  );
};
