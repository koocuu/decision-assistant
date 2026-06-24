import { NextResponse } from "next/server";
import { getAnonIdFromRequest } from "@/lib/anon";
import { claimAnonData } from "@/lib/account";
import { createSession, normalizeEmail, publicUser, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

type LoginPayload = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as LoginPayload;
    const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "请输入邮箱和密码。" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true
      }
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
    }

    await createSession(user.id);
    await claimAnonData(user.id, getAnonIdFromRequest(request) || "");

    return NextResponse.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Failed to login", error);
    return NextResponse.json({ error: "登录失败，请稍后再试。" }, { status: 500 });
  }
}
