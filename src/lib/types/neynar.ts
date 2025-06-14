import { WebhookUserCreated, NotificationDeliveryStatusEnum, PostCastReqBodyEmbeds } from '@neynar/nodejs-sdk';

/**
 * Represents a Farcaster user profile
 */
export type User = WebhookUserCreated['data'];

/**
 * Result of a frame notification attempt
 */
export type SendFrameNotificationResult =
  | { state: "error"; error: unknown; }
  | { state: "no_token" }
  | { state: "rate_limit" }
  | { state: "success" };

/**
 * Parameters for sending a frame notification
 */
export interface FrameNotificationParams {
  fid: number;
  title: string;
  body: string;
}

/**
 * Configuration for the Neynar client
 */
export interface NeynarConfig {
  apiKey: string;
}

/**
 * Error types for Neynar operations
 */
export enum NeynarErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  NOTIFICATION_FAILED = 'NOTIFICATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  INVALID_FID = 'INVALID_FID',
}

/**
 * Custom error class for Neynar operations
 */
export class NeynarError extends Error {
  constructor(
    public type: NeynarErrorType,
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NeynarError';
  }
}

/**
 * Response type for bulk user fetch
 */
export interface BulkUsersResponse {
  users: User[];
  nextCursor?: string;
}

/**
 * Parameters for bulk user fetch
 */
export interface BulkUsersParams {
  fids: number[];
  cursor?: string;
}

/**
 * Parameters for publishing frame notifications
 */
export interface PublishFrameNotificationParams {
  targetFids: number[];
  notification: {
    title: string;
    body: string;
    target_url: string;
  };
}

/**
 * Response type for frame notification delivery
 */
export interface FrameNotificationDelivery {
  fid: number;
  status: NotificationDeliveryStatusEnum;
  error?: string;
}

/**
 * Response type for publishing frame notifications
 */
export interface PublishFrameNotificationResponse {
  notification_deliveries: FrameNotificationDelivery[];
}

/**
 * Parameters for publishing a cast
 */
export interface PublishCastParams {
  signerUuid: string;
  text?: string;
  embeds?: PostCastReqBodyEmbeds[];
  parent?: string;
  channelId?: string;
  idem?: string;
  parentAuthorFid?: number;
} 