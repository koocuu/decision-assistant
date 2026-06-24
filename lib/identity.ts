import { cookies, headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { anonCookieName, anonHeaderName, createAnonId, getAnonIdFromRequest } from "@/lib/anon";
import { getCurrentUser, getUserFromSessionToken, sessionCookieName } from "@/lib/auth";

export type Identity =
  | { kind: "user"; userId: string; email: string }
  | { kind: "anon"; anonId: string };

function fallbackAnonId() {
  return createAnonId();
}

export function ownerData(identity: Identity) {
  return identity.kind === "user" ? { userId: identity.userId } : { anonId: identity.anonId };
}

export function decisionOwnerWhere(identity: Identity): Prisma.DecisionWhereInput {
  return identity.kind === "user" ? { userId: identity.userId } : { anonId: identity.anonId };
}

export function profileOwnerWhere(identity: Identity): Prisma.UserProfileWhereInput {
  return identity.kind === "user" ? { userId: identity.userId } : { anonId: identity.anonId };
}

export async function resolveIdentity(): Promise<Identity> {
  const user = await getCurrentUser();
  if (user) {
    return { kind: "user", userId: user.id, email: user.email };
  }

  const headerStore = await headers();
  const cookieStore = await cookies();
  const anonId =
    headerStore.get(anonHeaderName) || cookieStore.get(anonCookieName)?.value || fallbackAnonId();
  return { kind: "anon", anonId };
}

export async function resolveIdentityFromRequest(request: Request): Promise<Identity> {
  const sessionToken = getCookieValue(request.headers.get("cookie"), sessionCookieName);
  const user = await getUserFromSessionToken(sessionToken);
  if (user) {
    return { kind: "user", userId: user.id, email: user.email };
  }

  return { kind: "anon", anonId: getAnonIdFromRequest(request) || fallbackAnonId() };
}

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const prefix = `${name}=`;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}
