import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import {
  verifyToken,
  compareToken,
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "@/lib/auth";

// POST /api/auth/refresh - rotate refresh token and issue new access token
export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get("refreshToken");
    const raw = cookie?.value;

    if (!raw) {
      return NextResponse.json(
        { success: false, error: "No refresh token" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(raw);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { userId, jti } = decoded as any;
    if (!userId || !jti) {
      return NextResponse.json(
        { success: false, error: "Malformed refresh token" },
        { status: 401 }
      );
    }

    const key = `refresh:${userId}:${jti}`;
    const stored = await redis.get(key);
    if (!stored) {
      return NextResponse.json(
        { success: false, error: "Refresh token not found" },
        { status: 401 }
      );
    }

    const matches = await compareToken(raw, stored);
    if (!matches) {
      return NextResponse.json(
        { success: false, error: "Refresh token mismatch" },
        { status: 401 }
      );
    }

    // token valid -> rotate: delete old, issue new refresh + access
    await redis.del(key);

    const newAccess = generateAccessToken({ userId });
    const { token: newRefresh, jti: newJti } = generateRefreshToken({ userId });
    const hashed = await hashToken(newRefresh);
    await redis.set(
      `refresh:${userId}:${newJti}`,
      hashed,
      "EX",
      60 * 60 * 24 * 7
    );

    const res = NextResponse.json(
      {
        success: true,
        data: { access: true },
        rotation: { old_jti: jti, new_jti: newJti },
      },
      { status: 200 }
    );

    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set({
      name: "accessToken",
      value: newAccess,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });
    res.cookies.set({
      name: "refreshToken",
      value: newRefresh,
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
