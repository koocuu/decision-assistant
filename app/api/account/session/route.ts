import { NextResponse } from "next/server";
import { getBearerToken, getCurrentUser, getUserFromSessionToken, publicUser } from "@/lib/auth";

export async function GET(request: Request) {
  const bearerToken = getBearerToken(request.headers.get("authorization"));
  const user = bearerToken ? await getUserFromSessionToken(bearerToken) : await getCurrentUser();
  return NextResponse.json({ user: publicUser(user) });
}
