
import React, { useState } from 'react';
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
  const { user, logout } = useAuth();

  const handleFolderChange = (folder: string) => {
    setCurrentFolder(folder);
    setSelectedEmail(null); // Clear selected email when changing folders
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getUserInitials = () => {
    if (!user || !user.name) return 'U';
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return user.name.charAt(0).toUpperCase();
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
          onToggle={handleToggleSidebar} 
          activeFolder={currentFolder}
          onFolderChange={handleFolderChange}
          onComposeClick={() => setComposeOpen(true)}
        />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 border-b border-border bg-white z-10">
          <div className="flex items-center w-full max-w-2xl">
            <SearchBar />
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
                    ) : (
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    )}
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
            />
          </div>
          
          {/* Email preview */}
          <div className="flex-1 overflow-y-auto bg-white">
            <EmailPreview emailId={selectedEmail} />
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
