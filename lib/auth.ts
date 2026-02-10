import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

// JWT secret key - in production, use a strong secret from environment variables
const JWT_SECRET: string =
  process.env.JWT_SECRET || "trusttrip-super-secret-key-change-in-production";

// Token expiry settings
export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";

/**
 * Generate an access token (short-lived)
 */
export function generateAccessToken(payload: JwtPayload | string): string {
  const options: SignOptions = { expiresIn: ACCESS_TOKEN_EXPIRY };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate a refresh token (long-lived) and return its token + jti
 */
export function generateRefreshToken(payload: JwtPayload | string): {
  token: string;
  jti: string;
} {
  const jti = randomUUID();
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY };
  const token = jwt.sign(
    { ...(typeof payload === "object" ? payload : {}), jti },
    JWT_SECRET,
    options
  );
  return { token, jti };
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload | string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload | string;
  } catch {
    return null;
  }
}

/**
 * Hash a token (used for refresh token storage)
 */
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

/**
 * Compare a token against a stored hash
 */
export async function compareToken(
  token: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(token, hash);
}

/**
 * Decode token without verifying signature (debugging)
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const decoded = jwt.decode(token);
    return decoded as Record<string, unknown>;
  } catch (error) {
    return null;
  }
}
