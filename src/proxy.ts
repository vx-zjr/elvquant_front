import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authMode = process.env.AUTH_MODE ?? "local";
  if (authMode === "local") {
    return NextResponse.next();
  }

  const clerkUserId = request.headers.get("x-clerk-user-id");
  if (!clerkUserId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
