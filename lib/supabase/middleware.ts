import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/ventures", "/account", "/admin"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Misconfigured or unreachable Supabase should never take down the whole
  // site. Public routes still render; protected routes fail closed (send
  // to login) since we can't verify a session either way.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env vars are missing — auth checks are disabled for this request.");
    return redirectIfProtected(request, isProtected, pathname) ?? supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtected) {
      return redirectIfProtected(request, true, pathname)!;
    }

    return supabaseResponse;
  } catch (error) {
    console.error("Supabase auth check failed in proxy:", error);
    return redirectIfProtected(request, isProtected, pathname) ?? supabaseResponse;
  }
}

function redirectIfProtected(request: NextRequest, isProtected: boolean, pathname: string) {
  if (!isProtected) return null;
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
