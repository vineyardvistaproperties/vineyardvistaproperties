import crypto from 'node:crypto';

function cookieMap(req) {
  if (req.cookies && typeof req.cookies === 'object') return req.cookies;
  return Object.fromEntries(
    String(req.headers.cookie || '').split(';').map(v => v.trim()).filter(Boolean).map(v => {
      const i = v.indexOf('=');
      if (i < 0) return [decodeURIComponent(v), ''];
      return [decodeURIComponent(v.slice(0, i)), decodeURIComponent(v.slice(i + 1))];
    })
  );
}
function token(secret) {
  return crypto.createHmac('sha256', secret).update('vvp:site:authorized').digest('hex');
}
function safeEqual(a, b) {
  if (!a || !b) return false;
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export default async function handler(req, res) {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret || !safeEqual(cookieMap(req).vvp_site, token(secret))) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const required = ['firstName', 'lastName', 'email', 'arrival', 'departure', 'adults'];
    if (required.some(k => !String(body[k] || '').trim())) {
      return res.status(400).json({ error: 'Please complete all required fields.' });
    }
    const reference = 'VVP-' + Date.now().toString(36).toUpperCase();
    console.log('Vineyard Vista stay request', reference, body);
    return res.status(202).json({
      ok: true,
      reference,
      message: `Request received. Reference ${reference}. This demo does not yet send confirmation email.`
    });
  } catch (error) {
    console.error('VVP stay request error', error);
    return res.status(500).json({ error: 'Unable to submit request.' });
  }
}
