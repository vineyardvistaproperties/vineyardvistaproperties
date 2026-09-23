import crypto from 'node:crypto';

function safeEqual(a, b) {
  const A = Buffer.from(String(a || ''));
  const B = Buffer.from(String(b || ''));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

function token(area, secret) {
  return crypto.createHmac('sha256', secret).update(`vvp:${area}:authorized`).digest('hex');
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const area = body.area === 'management' ? 'management' : 'site';
    const expected = area === 'management' ? process.env.MANAGEMENT_PASSWORD : process.env.SITE_PASSWORD;
    const secret = process.env.AUTH_SECRET;
    if (!expected || !secret) return res.status(500).json({ error: 'Site authentication is not configured.' });
    if (!safeEqual(body.password, expected)) return res.status(401).json({ error: 'Incorrect password.' });

    const name = area === 'management' ? 'vvp_management' : 'vvp_site';
    res.setHeader('Set-Cookie', `${name}=${token(area, secret)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('VVP login error', error);
    return res.status(500).json({ error: 'Unable to sign in.' });
  }
}
