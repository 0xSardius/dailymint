import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/frame-sdk';

interface User {
  fid: number;
  primaryAddress?: string;
}

interface UseQuickAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  logout: () => void;
}

const BACKEND_ORIGIN = typeof window !== 'undefined' 
  ? window.location.origin 
  : process.env.NEXTAUTH_URL || 'http://localhost:3000';

export function useQuickAuth(): UseQuickAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const response = await sdk.quickAuth.fetch(url, options);
      return response;
    } catch (err) {
      console.error('Authenticated fetch failed:', err);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    // Clear any stored token if the SDK provides a method for it
    // This might need to be updated based on SDK capabilities
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get the Quick Auth token
      const { token: authToken } = await sdk.quickAuth.getToken();
      setToken(authToken);

      // Make authenticated request to get user info
      const response = await authenticatedFetch(`${BACKEND_ORIGIN}/api/me`);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Notify the Frame SDK that we're ready
        if (typeof sdk.actions?.ready === 'function') {
          sdk.actions.ready();
        }
      } else {
        throw new Error(`Authentication failed: ${response.status}`);
      }
    } catch (err) {
      console.error('Quick Auth initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    // Only initialize if we're in a client environment and SDK is available
    if (typeof window !== 'undefined') {
      initializeAuth();
    } else {
      setIsLoading(false);
    }
  }, [initializeAuth]);

  return {
    user,
    isLoading,
    error,
    token,
    authenticatedFetch,
    logout,
  };
} 