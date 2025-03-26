
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on load
  useEffect(() => {
    const checkExistingSession = () => {
      const savedUser = localStorage.getItem('emailAppUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          localStorage.removeItem('emailAppUser');
        }
      }
      setLoading(false);
    };
    
    checkExistingSession();
  }, []);

  const login = async () => {
    try {
      // Google OAuth popup window settings
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      // Open popup for Google OAuth
      const popup = window.open(
        'https://accounts.google.com/o/oauth2/v2/auth?' +
        'client_id=355105230955-8ob8hge99n22ig2el2h1jdgfluc9e385.apps.googleusercontent.com' + 
        '&redirect_uri=' + encodeURIComponent(window.location.origin + '/auth/callback') +
        '&response_type=token' +
        '&scope=' + encodeURIComponent('https://www.googleapis.com/auth/gmail.readonly profile email') +
        '&prompt=select_account',
        'GoogleAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      if (!popup) {
        throw new Error('Failed to open popup window for authentication');
      }

      // This is for demo purposes only - in a real implementation, 
      // you would handle the OAuth callback properly
      toast({
        title: "Authentication Demo",
        description: "This is a demonstration. In a real app, Google OAuth would be fully implemented."
      });

      // For demonstration, we'll create a mock user after a delay
      setTimeout(() => {
        const mockUser = {
          id: '12345',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          picture: 'https://randomuser.me/api/portraits/men/1.jpg',
          accessToken: 'mock-token-xyz'
        };
        
        setUser(mockUser);
        localStorage.setItem('emailAppUser', JSON.stringify(mockUser));
        
        if (popup && !popup.closed) {
          popup.close();
        }
      }, 2000);
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Authentication failed",
        description: "Could not authenticate with Google",
        variant: "destructive"
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('emailAppUser');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
