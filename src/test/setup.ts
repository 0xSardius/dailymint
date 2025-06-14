import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEYNAR_API_KEY = 'test-api-key';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000';

// Mock Neynar client
vi.mock('@neynar/nodejs-sdk', () => ({
  NeynarAPIClient: vi.fn().mockImplementation(() => ({
    fetchBulkUsers: vi.fn().mockResolvedValue({
      users: [{
        fid: 1,
        username: 'testuser',
        displayName: 'Test User',
        pfp: { url: 'https://example.com/pfp.jpg' },
        profile: { bio: { text: 'Test bio' } },
        followerCount: 100,
        followingCount: 50,
      }],
    }),
    publishFrameNotifications: vi.fn().mockResolvedValue({
      notification_deliveries: [{ status: 'success' }],
    }),
    publishCast: vi.fn().mockResolvedValue({ success: true }),
  })),
  Configuration: vi.fn(),
})); 