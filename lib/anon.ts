import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const anonCookieName = "da_anon_id";
export const anonHeaderName = "x-anon-id";

const anonMaxAgeSeconds = 60 * 60 * 24 * 365;

export function createAnonId() {
  return crypto.randomUUID();
}

export function getAnonIdFromCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";").map((part) => part.trim());
  const prefix = `${anonCookieName}=`;
  const match = cookies.find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function getAnonIdFromRequest(request: Request) {
  return request.headers.get(anonHeaderName) || getAnonIdFromCookieHeader(request.headers.get("cookie"));
}

export function ensureAnonRequest(request: NextRequest) {
  const existing = request.cookies.get(anonCookieName)?.value || request.headers.get(anonHeaderName);
  const anonId = existing || createAnonId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(anonHeaderName, anonId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  if (!existing) {
    response.cookies.set(anonCookieName, anonId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: anonMaxAgeSeconds
    });
  }

  return response;
}
