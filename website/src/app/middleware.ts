import { NextRequest, NextResponse } from "next/server";
import privy from "@/services/privy";

export async function handleIdentityToken(req: NextRequest) {
  // Get Auth token
  const bearerHeader = req.headers.get("Authorization");
  if (!bearerHeader) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  const authToken = bearerHeader.replace("Bearer ", "");

  // Redirect
  try {
    const verifiedClaims = await privy.verifyAuthToken(authToken);
    console.log(verifiedClaims);
    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/", req.url));
  }
}

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  await handleIdentityToken(req);
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/account/:path*",
};
