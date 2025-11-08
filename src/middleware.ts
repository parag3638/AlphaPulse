import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";


export function middleware(req: NextRequest) {
//   const token = req.cookies.get("token")?.value;

//   // If user is not authenticated, redirect to login
//   if (!token && req.nextUrl.pathname !== "/") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   try {
//     // Decode the token to check user role
//     const decoded = token ? jwtDecode<{ role: string }>(token) : null;

//     // 🔍 Restrict `/VaultX/user` to Admins only
//     if (req.nextUrl.pathname.startsWith("/VaultX/user") && decoded && decoded.role !== "admin") {
//       return NextResponse.redirect(new URL("/VaultX", req.url)); // Redirect non-admins to `/VaultX`
//     }
//   } catch (error) {
//     console.error("Invalid token:", error);
//     return NextResponse.redirect(new URL("/", req.url)); // Redirect to login on invalid token
//   }

  return NextResponse.next(); // Allow access if checks pass
}

// Apply middleware to protect specific routes
export const config = {
  matcher: ["/VaultX/:path*"], // Protects all `/dashboard/*` routes po
};