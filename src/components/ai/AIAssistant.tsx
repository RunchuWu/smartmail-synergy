
import React, { useState } from 'react';
import { X, Send, Sparkles } from 'lucide-react';

interface AIAssistantProps {
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI email assistant. I can help you with searching emails, creating summaries, managing your calendar, and setting reminders. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate AI response
    setTimeout(() => {
      let responseText = '';

      if (inputValue.toLowerCase().includes('summary')) {
        responseText = "I've analyzed your recent emails. You have 5 unread messages, mostly from your work team regarding the Q4 planning. There's one important email from Sarah about project timeline changes that requires your attention.";
      } else if (inputValue.toLowerCase().includes('search')) {
        responseText = "I found 3 emails matching your search. The most recent is from Sarah Johnson about 'Project timeline updates' sent this morning. Would you like me to open it for you?";
      } else if (inputValue.toLowerCase().includes('calendar') || inputValue.toLowerCase().includes('schedule')) {
        responseText = "Your calendar for today shows 2 meetings: a team standup at 10:00 AM and a client presentation at 2:30 PM. Tomorrow you have a project review at 11:00 AM. Would you like me to schedule something else?";
      } else if (inputValue.toLowerCase().includes('reminder')) {
        responseText = "I've set a reminder for you about the project deadline on Friday at 5:00 PM. I'll notify you when it's time. Is there anything else you'd like me to remind you about?";
      } else {
        responseText = "I can help you manage emails, summarize content, search for specific messages, organize your calendar, or set reminders. What would you like assistance with?";
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        text: responseText,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-l-lg animate-slide-in overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-white/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles size={16} className="text-primary" />
          </div>
          <h3 className="font-medium">AI Assistant</h3>
        </div>
        <button onClick={onClose} className="hover:bg-secondary p-1 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70 text-right">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-white/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask me anything about your emails..."
            className="flex-1 bg-white border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={`p-2 rounded-md ${
              inputValue.trim()
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-muted text-muted-foreground'
            } transition-colors`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
