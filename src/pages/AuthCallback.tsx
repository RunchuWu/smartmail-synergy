
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Parse the hash fragment from OAuth redirect
    const processAuth = async () => {
      try {
        // In a real implementation, this is where you would:
        // 1. Extract the access token from URL hash
        // 2. Validate the token
        // 3. Get user info from Google API
        // 4. Store the token and user info

        // For demonstration, we'll just redirect back to the app
        toast({
          title: "Authentication received",
          description: "Processing your login..." 
        });
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } catch (error) {
        console.error('Authentication callback error:', error);
        toast({
          title: "Authentication failed",
          description: "Could not complete the authentication process",
          variant: "destructive"
        });
        navigate('/login', { replace: true });
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
