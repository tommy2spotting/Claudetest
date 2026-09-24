import { NextResponse, type NextRequest } from "next/server";

/**
 * Controllo veloce: senza cookie di sessione si va al login.
 * La verifica vera della firma avviene in ogni pagina e azione (richiediAdmin).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.get("vc_admin")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
