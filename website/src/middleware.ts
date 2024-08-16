import { NextRequest, NextResponse } from "next/server";
import privy from "@/services/privy";

export async function handleIdentityToken(req: NextRequest) {
  console.log("Fetching a protected route...");

  let redirectRes;
  if (req.method === "GET") {
    redirectRes = NextResponse.redirect(new URL("/sign-in", req.url));
  } else {
    redirectRes = NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Get access token from cookies
  const accessToken = req.cookies.get("privy-token")?.value;
  if (!accessToken) {
    return redirectRes;
  }

  // Verify the access token
  try {
    const verifiedClaims = await privy.verifyAuthToken(accessToken);
    console.log(verifiedClaims);
    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return redirectRes;
  }
}

export async function middleware(req: NextRequest) {
  console.log("Middleware called");

  if (req.nextUrl.pathname.startsWith("/~")) {
    return await handleIdentityToken(req);
  }

  if (req.nextUrl.pathname === "/api/names") {
    return await handleIdentityToken(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/~/:path*", "/api/:path*"],
};
