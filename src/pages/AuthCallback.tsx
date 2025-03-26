
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState<boolean>(true);

  useEffect(() => {
    // Process the authentication response
    const processAuth = async () => {
      try {
        setProcessingAuth(true);
        // Parse the hash fragment from OAuth redirect
        const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = fragmentParams.get('access_token');
        const expiresIn = fragmentParams.get('expires_in');
        
        if (!accessToken) {
          throw new Error('No access token received from Google');
        }

        console.log('Access token received, validating...');

        // Calculate token expiration time
        const expiresAt = expiresIn ? Date.now() + (parseInt(expiresIn) * 1000) : undefined;

        // Validate token by making a test request
        const testResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!testResponse.ok) {
          console.error('Token validation failed:', testResponse.status);
          throw new Error('Token validation failed. Please try again.');
        }

        const userData = await testResponse.json();
        console.log('Token validated successfully, creating user object');

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
          console.log('Sending auth data to parent window');
          window.opener.postMessage({
            type: 'auth_result',
            user
          }, window.location.origin);
          
          // Close the popup window
          window.close();
        } else {
          // If somehow the popup was navigated directly (not a popup)
          console.log('Not in popup window, storing auth data and redirecting');
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
      } finally {
        setProcessingAuth(false);
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="text-center max-w-md p-6 rounded-lg border border-border bg-card shadow-sm">
        {error ? (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Authentication Error</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Completing Authentication</p>
            <p className="text-muted-foreground">Please wait while we process your login...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
