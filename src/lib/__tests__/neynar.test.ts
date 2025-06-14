import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNeynarClient, getNeynarUser, sendNeynarFrameNotification, publishCast } from '../neynar';
import { NeynarError, NeynarErrorType } from '../types/neynar';

describe('Neynar Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNeynarClient', () => {
    it('should create a new client instance', () => {
      const client = getNeynarClient();
      expect(client).toBeDefined();
    });

    it('should throw error if API key is not configured', () => {
      process.env.NEYNAR_API_KEY = '';
      expect(() => getNeynarClient()).toThrow(NeynarError);
      expect(() => getNeynarClient()).toThrow(NeynarErrorType.API_KEY_MISSING);
    });
  });

  describe('getNeynarUser', () => {
    it('should fetch user by FID', async () => {
      const user = await getNeynarUser(1);
      expect(user).toBeDefined();
      expect(user?.fid).toBe(1);
      expect(user?.username).toBe('testuser');
    });

    it('should return null if user not found', async () => {
      const mockClient = getNeynarClient();
      vi.mocked(mockClient.fetchBulkUsers).mockResolvedValueOnce({ users: [] });
      
      const user = await getNeynarUser(999);
      expect(user).toBeNull();
    });
  });

  describe('sendNeynarFrameNotification', () => {
    it('should send notification successfully', async () => {
      const result = await sendNeynarFrameNotification({
        fid: 1,
        title: 'Test Notification',
        body: 'Test Body',
      });

      expect(result).toEqual({ state: 'success' });
    });

    it('should handle no token case', async () => {
      const mockClient = getNeynarClient();
      vi.mocked(mockClient.publishFrameNotifications).mockResolvedValueOnce({
        notification_deliveries: [],
      });

      const result = await sendNeynarFrameNotification({
        fid: 1,
        title: 'Test Notification',
        body: 'Test Body',
      });

      expect(result).toEqual({ state: 'no_token' });
    });
  });

  describe('publishCast', () => {
    it('should publish cast successfully', async () => {
      await expect(publishCast(
        'test-uuid',
        'Test cast',
        ['https://example.com']
      )).resolves.not.toThrow();
    });

    it('should handle cast failure', async () => {
      const mockClient = getNeynarClient();
      vi.mocked(mockClient.publishCast).mockRejectedValueOnce(new Error('Failed to publish'));

      await expect(publishCast(
        'test-uuid',
        'Test cast'
      )).rejects.toThrow(NeynarError);
    });
  });
}); 