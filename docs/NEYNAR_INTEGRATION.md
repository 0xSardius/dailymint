# Neynar Integration Documentation

## Overview
This document outlines the Neynar integration in the DailyMint application, which provides Farcaster authentication and social features.

## Core Components

### 1. Neynar Client (`src/lib/neynar.ts`)

#### Client Initialization
```typescript
function getNeynarClient(): NeynarAPIClient
```
- Singleton pattern implementation
- Requires `NEYNAR_API_KEY` environment variable
- Returns configured `NeynarAPIClient` instance

#### User Management
```typescript
async function getNeynarUser(fid: number): Promise<User | null>
```
- Fetches user profile by FID
- Returns `null` on error
- Uses bulk user fetch for efficiency

#### Frame Notifications
```typescript
async function sendNeynarFrameNotification({
  fid,
  title,
  body,
}: {
  fid: number;
  title: string;
  body: string;
}): Promise<SendFrameNotificationResult>
```
- Sends frame notifications to users
- Returns typed result with error handling
- Supports rate limiting and token validation

### 2. Authentication (`src/auth.ts`)

#### Configuration
- Uses NextAuth.js with Farcaster credentials provider
- Implements secure cookie handling
- Supports CSRF protection

#### Session Management
```typescript
interface Session {
  user: {
    fid: number;
  };
}
```
- Custom session type with FID
- Secure session token handling
- Proper CSRF protection

## Type Definitions

### User Type
```typescript
type User = WebhookUserCreated['data'];
```

### Notification Result Type
```typescript
type SendFrameNotificationResult =
  | { state: "error"; error: unknown; }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };
```

## Environment Variables
Required environment variables:
- `NEYNAR_API_KEY`: Your Neynar API key
- `NEXTAUTH_URL`: Your application URL
- `NEXT_PUBLIC_URL`: Public URL for frame notifications

## Usage Examples

### Fetching User Profile
```typescript
const user = await getNeynarUser(fid);
if (user) {
  // Handle user data
}
```

### Sending Frame Notification
```typescript
const result = await sendNeynarFrameNotification({
  fid: userFid,
  title: "Daily Creation Ready",
  body: "Your daily creation is ready to be minted!"
});
```

### Authentication Flow
```typescript
const session = await getSession();
if (session?.user?.fid) {
  // User is authenticated
}
```

## Error Handling
- All functions include proper error handling
- Errors are logged to console
- Null returns for failed operations
- Typed error states for notifications

## Security Considerations
1. API key is never exposed to the client
2. Session tokens are HTTP-only
3. CSRF protection is implemented
4. Secure cookie settings
5. Proper error handling to prevent information leakage

## Future Improvements
1. Add retry logic for failed API calls
2. Implement caching for user profiles
3. Add rate limiting for notifications
4. Enhance error reporting
5. Add comprehensive logging

## Testing
- Unit tests needed for client initialization
- Integration tests for user fetching
- End-to-end tests for authentication flow
- Notification delivery testing 