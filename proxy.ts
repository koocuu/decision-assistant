import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return NextResponse.json({ error: "AI 功能需要访问密码。" }, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Decision Assistant", charset="UTF-8"'
    }
  });
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = atob(header.slice("Basic ".length));
    const separatorIndex = decoded.indexOf(":");

    if (separatorIndex < 0) {
      return null;
    }

    return {
      username: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const username = process.env.DECISION_AUTH_USER;
  const password = process.env.DECISION_AUTH_PASSWORD;

  if (!username || !password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Decision auth is not configured.", { status: 503 });
    }

    return NextResponse.next();
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));

  if (credentials?.username === username && credentials.password === password) {
    return NextResponse.next();
  }

  return unauthorized();
}

export const config = {
  matcher: ["/api/ai/:path*"]
};
