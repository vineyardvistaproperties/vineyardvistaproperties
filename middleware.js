function readCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rawValue.join('='));
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

  if (!password || !secret) {
    return Response.redirect(new URL('/', request.url), 307);
  }

  const token = readCookie(request, 'vvp_guest');
  const expected = await hmacSha256(password, secret);
  if (token !== expected) {
    return Response.redirect(new URL('/', request.url), 307);
  }

  // Returning undefined allows the authorized request to continue.
}

export const config = {
  matcher: ['/guide', '/guide.html']
};
