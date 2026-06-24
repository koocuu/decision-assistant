import { cookies } from "next/headers";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";

export const sessionCookieName = "da_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const keyLength = 64;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  };
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, keyLength).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  await db.userSession.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, cookieOptions());

  return token;
}

export function getBearerToken(authorizationHeader?: string | null) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

export async function clearSession(tokenOverride?: string | null) {
  const cookieStore = await cookies();
  const token = tokenOverride || cookieStore.get(sessionCookieName)?.value;

  if (token) {
    await db.userSession.deleteMany({
      where: {
        tokenHash: sha256(token)
      }
    });
  }

  cookieStore.delete(sessionCookieName);
}

export async function getUserFromSessionToken(token?: string | null) {
  if (!token) {
    return null;
  }

  const session = await db.userSession.findUnique({
    where: {
      tokenHash: sha256(token)
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          createdAt: true
        }
      }
    }
  });

  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await db.userSession.delete({ where: { id: session.id } }).catch(() => null);
    }
    return null;
  }

  return session.user;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return getUserFromSessionToken(cookieStore.get(sessionCookieName)?.value);
}

export function publicUser(user: { id: string; email: string } | null) {
  return user ? { id: user.id, email: user.email } : null;
}
