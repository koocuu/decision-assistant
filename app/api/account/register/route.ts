import { NextResponse } from "next/server";
import { getAnonIdFromRequest } from "@/lib/anon";
import { claimAnonData } from "@/lib/account";
import { createSession, hashPassword, normalizeEmail, publicUser } from "@/lib/auth";
import { db } from "@/lib/db";

type RegisterPayload = {
  email?: unknown;
  password?: unknown;
};

function validate(email: unknown, password: unknown) {
  const normalizedEmail = typeof email === "string" ? normalizeEmail(email) : "";
  const normalizedPassword = typeof password === "string" ? password : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { error: "请输入有效邮箱。", email: normalizedEmail, password: normalizedPassword };
  }

  if (normalizedPassword.length < 8) {
    return { error: "密码至少需要 8 位。", email: normalizedEmail, password: normalizedPassword };
  }

  return { email: normalizedEmail, password: normalizedPassword };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => ({}))) as RegisterPayload;
    const parsed = validate(payload.email, payload.password);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const existing = await db.user.findUnique({
      where: { email: parsed.email },
      select: { id: true }
    });

    if (existing) {
      return NextResponse.json({ error: "这个邮箱已经注册，请直接登录。" }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email: parsed.email,
        passwordHash: hashPassword(parsed.password)
      },
      select: {
        id: true,
        email: true
      }
    });

    await createSession(user.id);
    await claimAnonData(user.id, getAnonIdFromRequest(request) || "");

    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (error) {
    console.error("Failed to register account", error);
    return NextResponse.json({ error: "注册失败，请稍后再试。" }, { status: 500 });
  }
}
