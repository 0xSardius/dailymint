"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";

interface User {
  fid: number;
  primaryAddress?: string;
}

export function QuickAuthExample() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    initializeQuickAuth();
  }, []);

  const initializeQuickAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get Quick Auth token
      const { token: authToken } = await sdk.quickAuth.getToken();
      setToken(authToken);

      // Make authenticated request to get user info
      const response = await sdk.quickAuth.fetch('/api/me');
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        // Notify Frame SDK that we're ready
        if (typeof sdk.actions?.ready === 'function') {
          sdk.actions.ready();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Authentication failed: ${errorData.error || response.status}`);
      }
    } catch (err) {
      console.error('Quick Auth initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthenticatedRequest = async () => {
    try {
      setTestResult("Making authenticated request...");
      
      const response = await sdk.quickAuth.fetch('/api/me');
      const data = await response.json();
      
      setTestResult(`✅ Success! User FID: ${data.fid}, Address: ${data.primaryAddress ? truncateAddress(data.primaryAddress) : 'N/A'}`);
    } catch (error) {
      console.error('Test request failed:', error);
      setTestResult(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const retryAuth = () => {
    setTestResult("");
    initializeQuickAuth();
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Quick Auth</h2>
          <p className="text-gray-600">Authenticating with Farcaster...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-red-700">Authentication Error</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <Button 
            onClick={retryAuth}
            className="bg-red-600 hover:bg-red-700"
          >
            Retry Authentication
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      {/* Header */}
      <div className="text-center border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Auth Demo</h2>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">Authenticated</span>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">User Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">FID:</span>
              <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded border">
                {user.fid}
              </span>
            </div>
            {user.primaryAddress && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Primary Address:</span>
                <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded border text-sm">
                  {truncateAddress(user.primaryAddress)}
                </span>
              </div>
            )}
            {token && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">JWT Token:</span>
                <span className="font-mono text-gray-900 bg-white px-2 py-1 rounded border text-xs">
                  {token.substring(0, 15)}...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Quick Auth Actions</h3>
        <div className="space-y-2">
          <Button
            onClick={testAuthenticatedRequest}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            Test Authenticated Request
          </Button>
          <Button
            onClick={retryAuth}
            className="bg-gray-600 hover:bg-gray-700 w-full"
          >
            Refresh Authentication
          </Button>
        </div>
        
        {testResult && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-mono text-gray-700">{testResult}</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-semibold mb-2">About Quick Auth</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Seamless authentication for Farcaster users</li>
          <li>• No manual sign-in flow required</li>
          <li>• Uses JWT tokens for secure API access</li>
          <li>• Built on top of Sign In with Farcaster</li>
        </ul>
      </div>
    </div>
  );
} 