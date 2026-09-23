import crypto from 'node:crypto';

function timingSafeEqual(a, b) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function authToken(password, secret) {
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  const configuredPassword = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!configuredPassword || !secret) {
    return res.status(500).json({ ok: false, error: 'Server authentication is not configured.' });
  }

  const submitted = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!timingSafeEqual(submitted, configuredPassword)) {
    return res.status(401).json({ ok: false });
  }

  const token = authToken(configuredPassword, secret);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `vvp_guest=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${secure}`);
  return res.status(200).json({ ok: true });
}
