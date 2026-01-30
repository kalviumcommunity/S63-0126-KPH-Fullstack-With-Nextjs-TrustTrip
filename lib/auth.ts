import jwt from "jsonwebtoken";

// JWT secret key - in production, use a strong secret from environment variables
// Generate a secure secret: openssl rand -base64 32
const JWT_SECRET: string =
  process.env.JWT_SECRET || "trusttrip-super-secret-key-change-in-production";

// Token expiry time
export const JWT_EXPIRY = "1h";
export const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate a JWT token for a user
 * @param payload - Object containing user data (userId, email, etc.)
 * @param expiresIn - Token expiry time (default: '1h')
 * @returns JWT token string
 */
export function generateToken(
  payload: Record<string, unknown>,
  expiresIn: string = JWT_EXPIRY
): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, JWT_SECRET, {} as any);
    return decoded as unknown as Record<string, unknown>;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Decode token without verification (for debugging)
 * @param token - JWT token to decode
 * @returns Decoded payload or null if invalid
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as Record<string, unknown>;
  } catch (error) {
    return null;
  }
}
