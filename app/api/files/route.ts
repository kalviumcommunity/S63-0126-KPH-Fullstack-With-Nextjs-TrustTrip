import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "@/lib/errorCodes";
import { handleAsyncError } from "@/lib/errorHandler";

/**
 * POST /api/files
 * Stores file metadata in the database after successful S3 upload
 *
 * Request body:
 * {
 *   "fileName": "profile.png",
 *   "fileURL": "https://bucket.s3.region.amazonaws.com/...",
 *   "fileSize": 2048,
 *   "fileType": "image/png",
 *   "userId": "user123",
 *   "expiresAt": "2026-02-09T10:00:00Z" (optional)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "file123",
 *     "name": "profile.png",
 *     "url": "https://bucket.s3.region.amazonaws.com/...",
 *     "fileType": "image/png",
 *     "size": 2048,
 *     "userId": "user123",
 *     "uploadedAt": "2026-02-02T10:00:00Z"
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { fileName, fileURL, fileSize, fileType, userId, expiresAt } = body;

    // Validate required fields
    if (!fileName || !fileURL || !fileSize || !fileType || !userId) {
      return sendError(
        "Missing required fields",
        ERROR_CODES.VALIDATION_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // Validate file size is a number
    if (typeof fileSize !== "number" || fileSize <= 0) {
      return sendError(
        "Invalid file size",
        ERROR_CODES.VALIDATION_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // Check if file URL is unique (prevent duplicates)
    const existingFile = await prisma.file.findUnique({
      where: { url: fileURL },
    });

    if (existingFile) {
      return sendError(
        "File with this URL already exists",
        HTTP_STATUS_CODES.CONFLICT,
        "DUPLICATE_FILE"
      );
    }

    // Create file record in database
    const file = await prisma.file.create({
      data: {
        name: fileName,
        url: fileURL,
        size: fileSize,
        fileType: fileType,
        userId: userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return sendSuccess(
      {
        id: file.id,
        name: file.name,
        url: file.url,
        size: file.size,
        fileType: file.fileType,
        userId: file.userId,
        uploadedAt: file.uploadedAt,
        expiresAt: file.expiresAt,
        user: file.user,
      },
      "File metadata stored successfully",
      HTTP_STATUS_CODES.CREATED
    );
  } catch (error) {
    return handleAsyncError(error, "POST", "/api/files", {
      operation: "file_metadata_storage",
    });
  }
}

/**
 * GET /api/files
 * Retrieves all files for the authenticated user
 * Supports pagination and filtering
 *
 * Query Parameters:
 * - userId: string (required - the user ID to fetch files for)
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - sortBy: "uploadedAt" | "name" | "size" (default: "uploadedAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 *
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "files": [...],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "total": 25,
 *       "totalPages": 3
 *     }
 *   }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "10"))
    );
    const sortBy = searchParams.get("sortBy") || "uploadedAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase();

    // Validate userId
    if (!userId) {
      return sendError(
        "userId query parameter is required",
        HTTP_STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Validate sortBy
    const validSortFields = ["uploadedAt", "name", "size"];
    if (!validSortFields.includes(sortBy)) {
      return sendError(
        "Invalid sortBy parameter",
        HTTP_STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Validate sortOrder
    if (!["asc", "desc"].includes(sortOrder)) {
      return sendError(
        "Invalid sortOrder parameter",
        HTTP_STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Count total files for user
    const total = await prisma.file.count({
      where: { userId },
    });

    // Fetch files with pagination
    const files = await prisma.file.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        url: true,
        size: true,
        fileType: true,
        uploadedAt: true,
        expiresAt: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(
      {
        files,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      "Files retrieved successfully"
    );
  } catch (error) {
    return handleAsyncError(error, "GET", "/api/files");
  }
}

/**
 * DELETE /api/files?fileId=...
 * Deletes a file record from the database
 * Note: This only removes the database record. You need to delete the actual S3 object separately.
 *
 * Query Parameters:
 * - fileId: string (required)
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "File deleted successfully"
 * }
 */
export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return sendError(
        "fileId query parameter is required",
        HTTP_STATUS_CODES.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Check if file exists
    const existingFile = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!existingFile) {
      return sendError(
        "File not found",
        HTTP_STATUS_CODES.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Delete file record
    await prisma.file.delete({
      where: { id: fileId },
    });

    return sendSuccess(
      { id: fileId },
      "File deleted successfully",
      HTTP_STATUS_CODES.OK
    );
  } catch (error) {
    return handleAsyncError(error, "DELETE", "/api/files", {
      operation: "file_deletion",
    });
  }
}
