
import React from 'react';
import { Mail, Send, Archive, Trash, File, Calendar, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  onComposeClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  onToggle, 
  activeFolder, 
  onFolderChange,
  onComposeClick
}) => {
  const sidebarItems = [
    { id: 'inbox', icon: Mail, label: 'Inbox', count: 12 },
    { id: 'sent', icon: Send, label: 'Sent' },
    { id: 'archive', icon: Archive, label: 'Archive' },
    { id: 'draft', icon: File, label: 'Drafts', count: 3 },
    { id: 'trash', icon: Trash, label: 'Trash' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'reminders', icon: Clock, label: 'Reminders', count: 1 },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <h1 className={`text-xl font-semibold transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          SmartMail
        </h1>
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-sidebar-accent transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="px-2 pt-4">
        <Button 
          className={`w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-md ${
            collapsed ? 'px-2' : 'px-4'
          }`}
          onClick={onComposeClick}
        >
          <Plus size={18} />
          {!collapsed && <span>Compose</span>}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto scroll-hidden">
        <ul className="space-y-1">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onFolderChange(item.id)}
                className={`sidebar-item w-full flex justify-between ${
                  activeFolder === item.id ? 'sidebar-item-active' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && item.count && (
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {item.count}
                  </span>
                )}
                {collapsed && item.count && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          {!collapsed && (
            <>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                <span className="text-xs font-medium">JD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john.doe@example.com</p>
              </div>
            </>
          )}
          {collapsed && (
            <div className="mx-auto w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              <span className="text-xs font-medium">JD</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
