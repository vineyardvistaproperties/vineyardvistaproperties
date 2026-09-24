import { next } from '@vercel/functions';

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';

  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');

    if (key === name) {
      return rest.join('=');
    }
  }

  return undefined;
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function expectedToken(area, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`vvp:${area}:authorized`)
  );

  return bytesToHex(new Uint8Array(signature));
}

async function verify(request, area, secret) {
  if (!secret) return false;

  const cookieName =
    area === 'management'
      ? 'vvp_management'
      : 'vvp_site';

  const actual = getCookie(request, cookieName);

  if (!actual) return false;

  const expected = await expectedToken(area, secret);

  return actual === expected;
}

function loginRedirect(request, pathname, area) {
  const url = new URL('/login.html', request.url);

  url.searchParams.set('next', pathname);
  url.searchParams.set('area', area);

  return Response.redirect(url, 302);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // These must remain accessible without authentication.
  if (
    path.startsWith('/api/') ||
    path === '/login.html' ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.jpg') ||
    path.endsWith('.png') ||
    path.endsWith('.svg') ||
    path === '/favicon.ico' ||
    path === '/robots.txt'
  ) {
    return next();
  }

  const secret = process.env.AUTH_SECRET;

  // First require the main-site password.
  const siteOk = await verify(request, 'site', secret);

  if (!siteOk) {
    return loginRedirect(
      request,
      path + url.search,
      'site'
    );
  }

  // Management and pitch require the second password as well.
  if (
    path === '/management' ||
    path === '/management.html' ||
    path === '/pitch' ||
    path === '/pitch.html'
  ) {
    const managementOk = await verify(
      request,
      'management',
      secret
    );

    if (!managementOk) {
      return loginRedirect(
        request,
        path + url.search,
        'management'
      );
    }
  }

  return next();
}

export const config = {
  matcher: '/((?!api/|favicon.ico).*)'
};
