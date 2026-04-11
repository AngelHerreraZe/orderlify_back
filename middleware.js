import { NextResponse } from 'next/server';

export async function middleware(req) {
  const url = req.nextUrl;
  const host = req.headers.get('host'); // empresa.orderlify.net

  if (!host) {
    return new NextResponse('Host inválido', { status: 400 });
  }

  const subdomain = host.split('.')[0];

  // 🧠 Ignorar dominio raíz
  if (subdomain === 'orderlify') {
    return NextResponse.next();
  }

  const pathname = url.pathname;

  // 🚫 No tocar API, assets, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  try {
    // 🔥 VALIDAR TENANT (llamando a tu backend)
    const res = await fetch(
      `https://api.orderlify.net/api/v1/tenants/validate?slug=${subdomain}`,
      {
        headers: {
          'x-subdomain': subdomain,
        },
        // Edge runtime necesita esto
        cache: 'no-store',
      },
    );

    // ❌ No existe → 404 inmediato
    if (!res.ok) {
      return new NextResponse('Empresa no encontrada', { status: 404 });
    }

    // 🔐 Verificar autenticación (cookie o token)
    const token = req.cookies.get('auth-token')?.value;

    const isLogin = pathname.startsWith('/login');

    if (!token && !isLogin) {
      const loginUrl = new URL('/login', req.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (err) {
    return new NextResponse('Error validando tenant', { status: 500 });
  }
}

export const config = {
  matcher: [
    /*
      Aplica a TODO excepto:
      - API
      - static
      - next internals
    */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
