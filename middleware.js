function readCookie(request, name) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';').map((part) => part.trim());
  for (const cookie of cookies) {
    const separator = cookie.indexOf('=');
    if (separator === -1) continue;
    const key = cookie.slice(0, separator);
    const value = cookie.slice(separator + 1);
    if (key === name) return decodeURIComponent(value);
  }
  return '';
}

async function hmacSha256(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export default async function middleware(request) {
  const password = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  const token = readCookie(request, 'vvp_guest');

  if (!password || !secret) {
    return Response.redirect(new URL('/?error=config', request.url));
  }

  const expected = await hmacSha256(password, secret);
  if (token !== expected) {
    return Response.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/guide', '/guide.html']
};
