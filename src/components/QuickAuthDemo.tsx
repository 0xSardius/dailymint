"use client";

import { useQuickAuth } from "~/lib/hooks/useQuickAuth";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";

export function QuickAuthDemo() {
  const { user, isLoading, error, token, authenticatedFetch, logout } = useQuickAuth();

  const handleTestAuthenticatedRequest = async () => {
    try {
      const response = await authenticatedFetch('/api/me');
      const data = await response.json();
      console.log('Authenticated request successful:', data);
      alert(`Authenticated request successful! FID: ${data.fid}`);
    } catch (error) {
      console.error('Authenticated request failed:', error);
      alert('Authenticated request failed!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating with Quick Auth...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold mb-2">Authentication Error</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="bg-red-600 hover:bg-red-700"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-yellow-800 font-semibold mb-2">No User Authenticated</h3>
        <p className="text-yellow-700">Quick Auth did not return user information.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Quick Auth Status</h2>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-green-700 font-medium">Authenticated</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">User Information</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">FID:</span>
              <span className="font-mono text-gray-900">{user.fid}</span>
            </div>
            {user.primaryAddress && (
              <div className="flex justify-between">
                <span className="text-gray-600">Primary Address:</span>
                <span className="font-mono text-gray-900">
                  {truncateAddress(user.primaryAddress)}
                </span>
              </div>
            )}
            {token && (
              <div className="flex justify-between">
                <span className="text-gray-600">Token:</span>
                <span className="font-mono text-gray-900 text-sm">
                  {token.substring(0, 20)}...
                </span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Auth Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleTestAuthenticatedRequest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Test Authenticated Request
            </Button>
            <Button
              onClick={logout}
              className="bg-white border border-red-300 text-red-700 hover:bg-red-50"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-medium mb-2">About Quick Auth</h4>
        <p className="text-blue-700 text-sm">
          Quick Auth provides seamless authentication for Farcaster users without requiring 
          manual sign-in flows. The authentication happens automatically when the mini app loads.
        </p>
      </div>
    </div>
  );
} 