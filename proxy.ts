import { NextRequest, NextResponse } from "next/server"
import { decode } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token"

  const token = request.cookies.get(cookieName)?.value
  let isAuthenticated = false

  if (token) {
    try {
      const decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET!,
        salt: cookieName,
      })
      isAuthenticated = !!decoded
    } catch {
      isAuthenticated = false
    }
  }

  const { pathname } = request.nextUrl
  const isDashboard = pathname.startsWith("/dashboard")
  const isLogin = pathname === "/login"

  if (isDashboard && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (isLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
