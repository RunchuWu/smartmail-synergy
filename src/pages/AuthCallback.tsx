
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Process the authentication response
    const processAuth = async () => {
      try {
        // Parse the hash fragment from OAuth redirect
        const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = fragmentParams.get('access_token');
        const expiresIn = fragmentParams.get('expires_in');
        
        if (!accessToken) {
          throw new Error('No access token received from Google');
        }

        // Calculate token expiration time
        const expiresAt = expiresIn ? Date.now() + (parseInt(expiresIn) * 1000) : undefined;

        // Fetch user profile information from Google
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile from Google');
        }

        const userData = await response.json();

        // Create the user object
        const user = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          accessToken: accessToken,
          expiresAt: expiresAt
        };

        // Send the user data back to the parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'auth_result',
            user
          }, window.location.origin);
          
          // Close the popup window
          window.close();
        } else {
          // If somehow the popup was navigated directly (not a popup)
          localStorage.setItem('emailAppUser', JSON.stringify(user));
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Authentication callback error:', error);
        setError(error instanceof Error ? error.message : 'Unknown authentication error');
        
        toast({
          title: "Authentication failed",
          description: error instanceof Error ? error.message : "Could not complete the authentication process",
          variant: "destructive"
        });
        
        // Delay redirect to show error
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center">
        {error ? (
          <div className="text-destructive mb-4">
            <p className="text-lg font-semibold">Authentication Error</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
        )}
        <p className="text-lg">{error ? "Redirecting to login..." : "Completing authentication..."}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
