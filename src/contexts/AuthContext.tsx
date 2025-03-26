
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  accessToken: string;
  expiresAt?: number;
  refreshToken?: string;
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
          const parsedUser = JSON.parse(savedUser) as User;
          
          // Check if the token is expired
          if (parsedUser.expiresAt && parsedUser.expiresAt < Date.now()) {
            // Token expired, need to logout or refresh
            console.log('Token expired, logging out');
            localStorage.removeItem('emailAppUser');
            setUser(null);
          } else {
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Failed to parse saved user:', error);
          localStorage.removeItem('emailAppUser');
        }
      }
      setLoading(false);
    };
    
    checkExistingSession();
  }, []);
  
  // Setup message listener for OAuth popup window communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      
      // Check if this is an auth message from our popup
      if (event.data?.type === 'auth_result' && event.data?.user) {
        setUser(event.data.user);
        localStorage.setItem('emailAppUser', JSON.stringify(event.data.user));
        toast({
          title: "Authentication successful",
          description: `Welcome, ${event.data.user.name}!`,
        });
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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

      // The popup will redirect to our callback URL
      // We'll receive the result via the message event listener
      
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
