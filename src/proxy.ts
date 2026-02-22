import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  const customerPaths = ["/book", "/dashboard", "/bookings", "/profile", "/saved-addresses"]
  if (customerPaths.some((p) => pathname.startsWith(p))) {
    if (!session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!session || !["ADMIN", "DISPATCHER"].includes(session.user.role)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
