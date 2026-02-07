import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { ok: false, message: "Not authenticated" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: session,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { ok: false, message: "Auth check failed" },
      { status: 500 },
    );
  }
}
