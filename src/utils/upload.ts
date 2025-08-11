import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createS3Client, getBucketName, isStorageConfigured } from './storage';
import logger from '../config/logger';

/**
 * Upload a file to Cloudflare R2 or S3
 * @param key - The object key (filename) in the bucket
 * @param buffer - The file buffer to upload
 * @param contentType - The MIME type of the file
 * @returns Promise<string> - The URL of the uploaded file
 */
export async function uploadFile(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Storage is not configured. Please set up AWS/R2 environment variables.');
  }

  const s3Client = createS3Client();
  const bucketName = getBucketName();

  if (!s3Client || !bucketName) {
    throw new Error('Failed to create S3 client or get bucket name');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // Optional: Add cache control headers for better performance
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    // Construct the public URL
    // For Cloudflare R2, the URL format is: https://pub-<hash>.r2.dev/<key>
    // You'll need to configure your R2 bucket for public access and get the public URL
    const publicUrl = `https://pub-${process.env.R2_PUBLIC_HASH || 'your-public-hash'}.r2.dev/${key}`;
    
    logger.info({ key, bucketName, contentType }, 'File uploaded successfully');
    
    return publicUrl;
  } catch (error) {
    logger.error({ error, key, bucketName }, 'Failed to upload file');
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a unique filename to prevent conflicts
 * @param originalName - The original filename
 * @param userId - The user ID to include in the path
 * @returns string - A unique filename
 */
export function generateUniqueFilename(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `uploads/${userId}/${timestamp}-${randomString}-${baseName}.${extension}`;
}
