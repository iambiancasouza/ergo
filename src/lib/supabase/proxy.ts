import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const guestOnlyPaths = ["/auth", "/auth/login", "/auth/signUp"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Sem estes cabeçalhos, uma CDN poderia entregar a sessão de uma pessoa a outra.
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // Nada pode rodar entre a criação do cliente e o getClaims (recomendação do @supabase/ssr).
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);

  const { pathname } = request.nextUrl;
  const isAuthArea = pathname === "/auth" || pathname.startsWith("/auth/");

  if (!isLoggedIn && !isAuthArea) {
    return redirectTo(request, response, "/auth");
  }

  if (isLoggedIn && guestOnlyPaths.includes(pathname)) {
    return redirectTo(request, response, "/");
  }

  return response;
}

function redirectTo(request: NextRequest, response: NextResponse, path: string) {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
