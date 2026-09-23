import crypto from 'node:crypto';
import pages from './templates.mjs';

function cookieMap(req) {
  if (req.cookies && typeof req.cookies === 'object') return req.cookies;
  return Object.fromEntries(
    String(req.headers.cookie || '')
      .split(';')
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => {
        const i = v.indexOf('=');
        if (i < 0) return [decodeURIComponent(v), ''];
        return [decodeURIComponent(v.slice(0, i)), decodeURIComponent(v.slice(i + 1))];
      })
  );
}

function token(area, secret) {
  return crypto.createHmac('sha256', secret).update(`vvp:${area}:authorized`).digest('hex');
}

function safeEqual(actual, expected) {
  if (!actual || !expected) return false;
  const a = Buffer.from(String(actual));
  const b = Buffer.from(String(expected));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export default function handler(req, res) {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return res.status(500).send('Authentication is not configured.');

    const route = String(req.query?.route || 'home');
    const managementRoutes = new Set(['management', 'rentals', 'house-standards', 'property']);
    if (!pages[route]) return res.status(404).send('Not found');

    const cookies = cookieMap(req);
    const siteOK = safeEqual(cookies.vvp_site, token('site', secret));
    const managementOK = safeEqual(cookies.vvp_management, token('management', secret));

    const nextMap = {
      home: '/',
      guide: '/guide',
      management: '/management',
      rentals: '/management/rentals',
      'house-standards': '/management/house-standards',
      property: '/management/property'
    };
    const next = encodeURIComponent(nextMap[route] || '/');

    if (!siteOK) return res.redirect(302, `/login?area=site&next=${next}`);
    if (managementRoutes.has(route) && !managementOK) {
      return res.redirect(302, `/login?area=management&next=${next}`);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.status(200).send(pages[route]);
  } catch (error) {
    console.error('VVP protected route error', error);
    return res.status(500).send('Unable to load this private page.');
  }
}
