import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { redis } from "@/lib/redis";

// POST /api/auth/logout - clear cookies and revoke refresh token
export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get("refreshToken");
    const raw = cookie?.value;

    if (raw) {
      const decoded = verifyToken(raw);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { userId, jti } = (decoded as any) || {};
      if (userId && jti) {
        await redis.del(`refresh:${userId}:${jti}`);
      }
    }

    const res = NextResponse.json(
      { success: true, message: "Logged out" },
      { status: 200 }
    );
    // clear cookies
    res.cookies.set({
      name: "accessToken",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    res.cookies.set({
      name: "refreshToken",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
