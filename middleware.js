import { next } from '@vercel/functions';

function decodeB64url(value) {
  let s = value.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

async function verify(token, area, secret) {
  if (!token || !secret) return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    const sigBytes = Uint8Array.from(decodeB64url(sig), c => c.charCodeAt(0));
    const ok = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(body)
    );
    if (!ok) return false;

    const data = JSON.parse(decodeB64url(body));
    return data.area === area && Number(data.exp) > Date.now();
  } catch {
    return false;
  }
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

  if (
    path.startsWith('/api/') ||
    path === '/login.html' ||
    path.endsWith('.css') ||
    path.endsWith('.js') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.jpg') ||
    path.endsWith('.png') ||
    path === '/favicon.ico'
  ) {
    return next();
  }

  const secret = process.env.AUTH_SECRET;
  const siteOk = await verify(getCookie(request, 'vvp_site'), 'site', secret);
  if (!siteOk) return loginRedirect(request, path + url.search, 'site');

  if (path === '/management' || path === '/management.html' || path === '/pitch' || path === '/pitch.html') {
    const managementOk = await verify(
      getCookie(request, 'vvp_management'),
      'management',
      secret
    );
    if (!managementOk) return loginRedirect(request, path + url.search, 'management');
  }

  return next();
}

export const config = {
  matcher: '/((?!api/|favicon.ico).*)',
};
