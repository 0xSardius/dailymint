import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { APP_URL } from './constants';
import {
  User,
  SendFrameNotificationResult,
  FrameNotificationParams,
  NeynarConfig,
  NeynarError,
  NeynarErrorType,
  BulkUsersParams,
  BulkUsersResponse,
  PublishFrameNotificationParams,
} from './types/neynar';

let neynarClient: NeynarAPIClient | null = null;

/**
 * Initializes and returns a singleton instance of the Neynar client
 * @throws {NeynarError} If API key is not configured
 */
export function getNeynarClient(): NeynarAPIClient {
  if (!neynarClient) {
    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      throw new NeynarError(
        NeynarErrorType.API_KEY_MISSING,
        'NEYNAR_API_KEY not configured'
      );
    }
    const config = new Configuration({ apiKey });
    neynarClient = new NeynarAPIClient(config);
  }
  return neynarClient;
}

/**
 * Fetches a user profile by FID
 * @param fid - The Farcaster ID of the user
 * @returns The user profile or null if not found
 * @throws {NeynarError} If the API call fails
 */
export async function getNeynarUser(fid: number): Promise<User | null> {
  try {
    const client = getNeynarClient();
    const params: BulkUsersParams = { fids: [fid] };
    const response: BulkUsersResponse = await client.fetchBulkUsers(params);
    
    if (!response.users.length) {
      throw new NeynarError(
        NeynarErrorType.USER_NOT_FOUND,
        `User with FID ${fid} not found`
      );
    }
    
    return response.users[0];
  } catch (error) {
    if (error instanceof NeynarError) {
      throw error;
    }
    console.error('Error getting Neynar user:', error);
    return null;
  }
}

/**
 * Sends a frame notification to a user
 * @param params - The notification parameters
 * @returns The result of the notification attempt
 */
export async function sendNeynarFrameNotification(
  params: FrameNotificationParams
): Promise<SendFrameNotificationResult> {
  try {
    const client = getNeynarClient();
    const notificationParams: PublishFrameNotificationParams = {
      targetFids: [params.fid],
      notification: {
        title: params.title,
        body: params.body,
        target_url: APP_URL,
      },
    };

    const result = await client.publishFrameNotifications(notificationParams);

    if (result.notification_deliveries.length === 0) {
      return { state: "no_token" };
    }

    const delivery = result.notification_deliveries[0];
    if (delivery.status === 'failed') {
      throw new NeynarError(
        NeynarErrorType.NOTIFICATION_FAILED,
        'Failed to deliver notification'
      );
    }

    return { state: "success" };
  } catch (error) {
    if (error instanceof NeynarError) {
      if (error.type === NeynarErrorType.RATE_LIMITED) {
        return { state: "rate_limit" };
      }
      throw error;
    }
    return { state: "error", error };
  }
}

/**
 * Publishes a cast to Farcaster
 * @param signerUuid - The UUID of the signer
 * @param text - The text content of the cast
 * @param embeds - Optional array of URLs to embed
 * @throws {NeynarError} If the cast fails to publish
 */
export async function publishCast(
  signerUuid: string,
  text: string,
  embeds?: string[]
): Promise<void> {
  try {
    const client = getNeynarClient();
    await client.publishCast({
      signerUuid,
      text,
      embeds: embeds?.map(url => ({ url }))
    });
  } catch (error) {
    throw new NeynarError(
      NeynarErrorType.NOTIFICATION_FAILED,
      'Failed to publish cast',
      error
    );
  }
} 