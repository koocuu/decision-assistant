import { NextResponse } from "next/server";
import { getAnonIdFromRequest } from "@/lib/anon";
import { claimAnonData } from "@/lib/account";
import { getCurrentUser } from "@/lib/auth";

type ClaimPayload = {
  anonId?: unknown;
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as ClaimPayload;
  const anonId = typeof payload.anonId === "string" ? payload.anonId : getAnonIdFromRequest(request);
  await claimAnonData(user.id, anonId || "");
  return NextResponse.json({ ok: true });
}
