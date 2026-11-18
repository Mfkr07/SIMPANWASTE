import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Proteksi Route Area Berdasarkan Peran
  const isWargaArea = pathname.startsWith("/warga");
  const isPetugasArea = pathname.startsWith("/petugas");
  const isAdminArea = pathname.startsWith("/admin");

  if (isWargaArea || isPetugasArea || isAdminArea) {
    // Periksa cookie frontend fallback
    const roleCookie = request.cookies.get("simpanwaste_role")?.value;
    const sessionCookie = request.cookies.get("simpanwaste_user_session")?.value;
    let cookiePeran = roleCookie;
    if (!cookiePeran && sessionCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sessionCookie));
        cookiePeran = parsed.peran || parsed.role;
      } catch {}
    }
    if (cookiePeran) {
      cookiePeran = cookiePeran.toLowerCase();
    }

    // Jika ada session Supabase
    if (user) {
      const { data: profil } = await supabase
        .from("profil")
        .select("peran")
        .eq("id", user.id)
        .single();

      const peran = profil?.peran || cookiePeran || "warga";

      if (isWargaArea && peran !== "warga" && peran !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/${peran}/dashboard`;
        return NextResponse.redirect(url);
      }

      if (isPetugasArea && peran !== "petugas" && peran !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/${peran}/dashboard`;
        return NextResponse.redirect(url);
      }

      if (isAdminArea && peran !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/${peran}/dashboard`;
        return NextResponse.redirect(url);
      }

      return response;
    }

    // Jika tidak ada user Supabase, periksa cookie fallback frontend
    if (cookiePeran) {
      if (isWargaArea && cookiePeran !== "warga" && cookiePeran !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/${cookiePeran}/dashboard`;
        return NextResponse.redirect(url);
      }

      if (isPetugasArea && cookiePeran !== "petugas" && cookiePeran !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/${cookiePeran}/dashboard`;
        return NextResponse.redirect(url);
      }

      if (isAdminArea && cookiePeran !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = `/${cookiePeran}/dashboard`;
        return NextResponse.redirect(url);
      }

      return response;
    }

    // Tidak ada auth Supabase maupun cookie frontend -> redirect ke login
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
