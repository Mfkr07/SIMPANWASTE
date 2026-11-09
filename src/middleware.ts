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
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Ambil profil dari database untuk validasi peran
    const { data: profil } = await supabase
      .from("profil")
      .select("peran")
      .eq("id", user.id)
      .single();

    const peran = profil?.peran;

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
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
