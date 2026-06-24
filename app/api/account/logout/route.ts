import { NextResponse } from "next/server";
import { clearSession, getBearerToken } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSession(getBearerToken(request.headers.get("authorization")));
  return NextResponse.json({ ok: true });
}
