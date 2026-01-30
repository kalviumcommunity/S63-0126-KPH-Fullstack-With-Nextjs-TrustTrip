import { NextRequest } from "next/server";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES, HTTP_STATUS_CODES } from "@/lib/errorCodes";

/**
 * GET /api/admin
 * Admin-only endpoint that returns admin dashboard information
 *
 * Required Authorization: Bearer <JWT_TOKEN> with role="admin"
 * Middleware will verify authentication and authorization before this handler executes.
 *
 * Response: Dashboard statistics and admin information
 */
export async function GET(request: NextRequest) {
  try {
    // User information is attached by middleware via custom headers
    const userEmail = request.headers.get("x-user-email") || "unknown";
    const userRole = request.headers.get("x-user-role") || "unknown";

    // Mock admin dashboard data
    const adminDashboard = {
      message: "Welcome to the Admin Dashboard",
      user: {
        email: userEmail,
        role: userRole,
      },
      statistics: {
        totalUsers: 245,
        activeProjects: 32,
        pendingBookings: 18,
        totalRevenue: 45320.5,
        currency: "USD",
      },
      recentActivity: [
        {
          id: 1,
          action: "User registration",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 2,
          action: "Payment processed",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 3,
          action: "Refund approved",
          timestamp: new Date(Date.now() - 10800000).toISOString(),
        },
      ],
    };

    return sendSuccess(
      adminDashboard,
      "Admin dashboard data retrieved successfully",
      HTTP_STATUS_CODES.OK
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching admin dashboard:", error);
    return sendError(
      "Failed to fetch admin dashboard",
      ERROR_CODES.INTERNAL_ERROR,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}

/**
 * POST /api/admin/users
 * Admin endpoint to manage users (ban, promote, demote, etc.)
 *
 * Request Body Example:
 * {
 *   "userId": "user-123",
 *   "action": "promote", // "promote", "demote", "ban", "unban"
 *   "newRole": "admin"
 * }
 *
 * Only accessible to users with role="admin"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, newRole } = body;

    // Validate required fields
    if (!userId || !action) {
      return sendError(
        "Missing required fields: userId, action",
        ERROR_CODES.VALIDATION_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // Validate action
    const validActions = ["promote", "demote", "ban", "unban"];
    if (!validActions.includes(action)) {
      return sendError(
        `Invalid action. Valid actions: ${validActions.join(", ")}`,
        ERROR_CODES.VALIDATION_ERROR,
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // Mock response for user management action
    const adminAction = {
      success: true,
      action,
      userId,
      newRole: newRole || "user",
      timestamp: new Date().toISOString(),
      message: `User ${userId} has been ${action}d successfully`,
    };

    return sendSuccess(
      adminAction,
      `User action '${action}' completed successfully`,
      HTTP_STATUS_CODES.OK
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error processing admin action:", error);
    return sendError(
      "Failed to process admin action",
      ERROR_CODES.INTERNAL_ERROR,
      HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      error
    );
  }
}
