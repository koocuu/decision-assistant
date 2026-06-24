import type { NextRequest } from "next/server";
import { ensureAnonRequest } from "@/lib/anon";

export function proxy(request: NextRequest) {
  return ensureAnonRequest(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"
  ]
};
