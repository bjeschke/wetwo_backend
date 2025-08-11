import { S3Client } from '@aws-sdk/client-s3';
import env from '../config/env';

/**
 * Configure S3 client for Cloudflare R2 or AWS S3
 * Uses jurisdiction-specific endpoints for R2
 */
export function createS3Client(): S3Client | null {
  // Only create client if all required environment variables are present
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.S3_ENDPOINT) {
    return null;
  }

  const config: any = {
    region: env.AWS_REGION || 'auto',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  };

  // If using Cloudflare R2, add the custom endpoint
  if (env.S3_ENDPOINT) {
    config.endpoint = env.S3_ENDPOINT;
    // R2 doesn't require region, but we can use 'auto'
    config.region = 'auto';
  }

  return new S3Client(config);
}

/**
 * Get the configured bucket name
 */
export function getBucketName(): string | null {
  return env.S3_BUCKET_NAME || null;
}

/**
 * Check if storage is properly configured
 */
export function isStorageConfigured(): boolean {
  return !!(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.S3_ENDPOINT && env.S3_BUCKET_NAME);
}
