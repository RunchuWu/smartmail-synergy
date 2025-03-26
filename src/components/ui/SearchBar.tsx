
import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div className={`relative w-full max-w-2xl transition-all duration-200 ${isActive ? 'scale-105' : ''}`}>
      <div 
        className={`flex items-center w-full px-3 py-2 bg-secondary rounded-md border ${
          isActive ? 'border-primary shadow-sm' : 'border-transparent'
        }`}
      >
        <Search size={18} className="text-muted-foreground mr-2 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search emails, smart search with AI..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
        />
        <div className={`text-xs text-muted-foreground ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
          Press / to focus
        </div>
      </div>
    </div>
  );
};
