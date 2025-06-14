# Farcaster Quick Auth Implementation Guide

This guide demonstrates how to implement Quick Auth in your Farcaster mini app, providing seamless authentication without requiring manual sign-in flows.

## Overview

Quick Auth is a streamlined authentication method for Farcaster mini apps that:
- Automatically authenticates users when the app loads
- Provides JWT tokens for secure API access
- Eliminates manual sign-in flows
- Works seamlessly within the Farcaster ecosystem

## Implementation Files

### 1. Backend API Endpoint (`src/app/api/me/route.ts`)

This endpoint validates Quick Auth JWT tokens and returns user information:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient, Errors } from '@farcaster/quick-auth';

const client = createClient();

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }

  const token = authorization.split(' ')[1];
  const hostname = request.headers.get('host') || 'localhost:3000';

  try {
    const payload = await client.verifyJwt({ token, domain: hostname });
    const user = await resolveUser(parseInt(payload.sub));
    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    throw error;
  }
}
```

### 2. Frontend Hook (`src/lib/hooks/useQuickAuth.ts`)

A React hook that manages Quick Auth state:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { sdk } from '@farcaster/frame-sdk';

export function useQuickAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    return await sdk.quickAuth.fetch(url, options);
  }, []);

  // ... initialization logic
}
```

### 3. React Component (`src/components/QuickAuthExample.tsx`)

A complete example demonstrating Quick Auth functionality:

```typescript
export function QuickAuthExample() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  
  const initializeQuickAuth = async () => {
    const { token: authToken } = await sdk.quickAuth.getToken();
    const response = await sdk.quickAuth.fetch('/api/me');
    const userData = await response.json();
    setUser(userData);
  };

  // ... component logic
}
```

## Key Features

### 1. Automatic Authentication
- Quick Auth initializes automatically when the component mounts
- No user interaction required for authentication
- Seamlessly integrates with the Farcaster Frame SDK

### 2. Secure API Access
- Uses JWT tokens for authenticated requests
- Tokens are automatically included in API calls via `sdk.quickAuth.fetch()`
- Backend validates tokens using the Quick Auth client

### 3. Error Handling
- Comprehensive error states for failed authentication
- Retry mechanisms for network issues
- User-friendly error messages

### 4. User Information Display
- Shows authenticated user's FID (Farcaster ID)
- Displays primary Ethereum address if available
- Shows truncated JWT token for debugging

## Usage Instructions

### 1. Access the Demo
Visit `/quick-auth` in your application to see the Quick Auth demo in action.

### 2. Testing Authenticated Requests
- Click "Test Authenticated Request" to verify the token works
- The request will call `/api/me` and display the response
- Success shows user FID and primary address

### 3. Debugging
- Check browser console for detailed error messages
- JWT token preview helps verify token generation
- Error states provide specific failure reasons

## API Endpoints

### GET `/api/me`
Returns authenticated user information.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Response:**
```json
{
  "fid": 12345,
  "primaryAddress": "0x1234...5678"
}
```

**Error Responses:**
- `401`: Missing or invalid authorization
- `401`: Invalid JWT token
- `500`: Internal server error

## Dependencies

Make sure these packages are installed:

```json
{
  "@farcaster/quick-auth": "^0.0.6",
  "@farcaster/frame-sdk": ">=0.0.31"
}
```

## Environment Setup

No additional environment variables are required for Quick Auth. The implementation uses:
- Current domain for JWT validation
- Default localhost:3000 for development

## Security Considerations

1. **JWT Validation**: All tokens are validated server-side
2. **Domain Binding**: Tokens are bound to the requesting domain
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **Token Expiration**: Tokens have built-in expiration (handled by Farcaster)

## Troubleshooting

### Common Issues

1. **"Authentication failed" Error**
   - Ensure the app is running in a Farcaster context
   - Check that the Frame SDK is properly initialized
   - Verify network connectivity

2. **"Invalid token" Error**
   - Token may have expired
   - Domain mismatch between client and server
   - Try refreshing the authentication

3. **Network Errors**
   - Check API endpoint is accessible
   - Verify CORS settings if applicable
   - Ensure proper request headers

### Debug Steps

1. Check browser console for detailed error logs
2. Verify the Frame SDK is loaded: `console.log(sdk)`
3. Test token generation: `sdk.quickAuth.getToken()`
4. Check server logs for JWT validation errors

## Integration with Existing Auth

Quick Auth can coexist with your existing NextAuth setup:
- Quick Auth handles Farcaster mini app contexts
- NextAuth handles traditional web authentication
- Both can share user resolution logic

## Best Practices

1. **Error Boundaries**: Wrap Quick Auth components in error boundaries
2. **Loading States**: Always show loading indicators during authentication
3. **Retry Logic**: Implement retry mechanisms for network failures
4. **Token Refresh**: Handle token expiration gracefully
5. **Fallback Auth**: Provide alternative auth methods for non-Farcaster contexts

## Further Reading

- [Farcaster Quick Auth Documentation](https://miniapps.farcaster.xyz/docs/sdk/quick-auth)
- [Frame SDK Documentation](https://miniapps.farcaster.xyz/docs/sdk)
- [Sign In with Farcaster](https://docs.farcaster.xyz/auth-kit/installation) 