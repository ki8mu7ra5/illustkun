import { NextResponse, type NextRequest } from "next/server";

function unauthorized(): NextResponse {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Area", charset="UTF-8"',
    },
  });
}

function verifyBasicAuth(request: NextRequest): boolean {
  const adminUser = process.env.ADMIN_USER?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminUser || !adminPassword) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const encoded = authorization.slice("Basic ".length);
  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const user = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return user === adminUser && password === adminPassword;
}

export function middleware(request: NextRequest) {
  if (!verifyBasicAuth(request)) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
