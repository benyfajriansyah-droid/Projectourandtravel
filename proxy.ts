import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionToken, type Role } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

const ROLE_RESTRICTED_PREFIXES: { prefix: string; roles: Role[] }[] = [
  { prefix: "/users", roles: ["ADMIN"] },
  { prefix: "/keuangan", roles: ["ADMIN", "FINANCE"] },
];

function isEstimasiPath(pathname: string) {
  return /^\/departures\/[^/]+\/estimasi/.test(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const restricted = ROLE_RESTRICTED_PREFIXES.find((r) =>
    pathname.startsWith(r.prefix)
  );
  if (restricted && !restricted.roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    isEstimasiPath(pathname) &&
    !(["ADMIN", "FINANCE"] as Role[]).includes(session.role)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
