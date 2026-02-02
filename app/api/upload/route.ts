import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * AWS S3 Configuration
 * Initializes S3Client with credentials from environment variables
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * File type whitelist for security
 * Only allow specific file types to be uploaded
 */
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/**
 * File size limits (in bytes)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1; // 1 byte

/**
 * Validates file type
 * @param fileType - MIME type of the file
 * @returns true if file type is allowed
 */
function isFileTypeAllowed(fileType: string): boolean {
  return ALLOWED_FILE_TYPES.includes(fileType);
}

/**
 * Validates file size
 * @param fileSize - File size in bytes
 * @returns true if file size is within allowed limits
 */
function isFileSizeValid(fileSize: number): boolean {
  return fileSize >= MIN_FILE_SIZE && fileSize <= MAX_FILE_SIZE;
}

/**
 * Generates a unique S3 key for the file
 * Format: uploads/[userId]/[timestamp]-[random].ext
 * @param userId - User ID uploading the file
 * @param filename - Original filename
 * @returns Unique S3 key
 */
function generateS3Key(userId: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop() || "bin";
  return `uploads/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * POST /api/upload
 * Generates a pre-signed URL for direct file upload to S3
 *
 * Request body:
 * {
 *   "filename": "profile.png",
 *   "fileType": "image/png",
 *   "fileSize": 2048,
 *   "userId": "user123"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "uploadURL": "https://bucket.s3.region.amazonaws.com/...",
 *   "s3Key": "uploads/user123/1234567890-abc123.png",
 *   "expiresIn": 3600
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (
      !process.env.AWS_BUCKET_NAME ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "AWS configuration is missing",
          error: "Missing AWS credentials or bucket name",
        },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { filename, fileType, fileSize, userId } = body;

    // Validate required fields
    if (!filename || !fileType || !fileSize || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          error: "filename, fileType, fileSize, and userId are required",
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isFileTypeAllowed(fileType)) {
      return NextResponse.json(
        {
          success: false,
          message: "File type not allowed",
          error: `Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isFileSizeValid(fileSize)) {
      return NextResponse.json(
        {
          success: false,
          message: "File size not valid",
          error: `File size must be between ${MIN_FILE_SIZE} and ${MAX_FILE_SIZE} bytes`,
        },
        { status: 400 }
      );
    }

    // Generate unique S3 key
    const s3Key = generateS3Key(userId, filename);

    // Create PutObjectCommand for S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      ACL: "public-read", // Makes file publicly accessible via URL
      Metadata: {
        "original-filename": filename,
        "user-id": userId,
        "upload-date": new Date().toISOString(),
      },
    });

    // Generate pre-signed URL (valid for 1 hour = 3600 seconds)
    const uploadURL = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    // Construct the public file URL
    const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json(
      {
        success: true,
        message: "Pre-signed URL generated successfully",
        uploadURL, // URL to PUT the file to
        fileURL, // Public URL of the file after upload
        s3Key, // S3 object key for reference
        expiresIn: 3600, // URL expires in 1 hour
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate pre-signed URL",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload
 * Returns configuration and constraints for file uploads
 * Useful for frontend to know limits and allowed types
 */
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      configuration: {
        maxFileSize: MAX_FILE_SIZE,
        minFileSize: MIN_FILE_SIZE,
        allowedFileTypes: ALLOWED_FILE_TYPES,
        urlExpiresIn: 3600,
        bucket: process.env.AWS_BUCKET_NAME,
        region: process.env.AWS_REGION,
      },
    },
    { status: 200 }
  );
}
