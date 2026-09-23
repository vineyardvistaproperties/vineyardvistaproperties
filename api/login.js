import crypto from 'node:crypto';

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ''), 'utf8');
  const bb = Buffer.from(String(b || ''), 'utf8');
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
}

function tokenFor(password, secret) {
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    const type = String(req.headers['content-type'] || '');
    if (type.includes('application/json')) {
      try { return JSON.parse(req.body); } catch { return {}; }
    }
    return Object.fromEntries(new URLSearchParams(req.body));
  }

  let raw = '';
  for await (const chunk of req) raw += chunk;
  const type = String(req.headers['content-type'] || '');
  if (type.includes('application/json')) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return Object.fromEntries(new URLSearchParams(raw));
}

function messagePage(title, message, status = 400) {
  return {
    status,
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>body{margin:0;background:#F7F5F0;color:#0D2340;font-family:Arial,sans-serif;display:grid;min-height:100vh;place-items:center}.card{max-width:560px;padding:48px 36px;text-align:center}.card h1{font-family:Georgia,serif;font-weight:500;font-size:42px;margin:0 0 14px}.card p{line-height:1.6}.card a{display:inline-block;margin-top:18px;color:#0D2340;text-underline-offset:4px}</style></head><body><main class="card"><h1>${title}</h1><p>${message}</p><a href="/">Return to sign in</a></main></body></html>`
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const configuredPassword = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!configuredPassword || !secret) {
    const page = messagePage('Configuration needed', 'The private guide is not yet configured on the server. Please contact Vineyard Vista Properties.', 500);
    return res.status(page.status).setHeader('Content-Type', 'text/html; charset=utf-8').send(page.html);
  }

  const body = await readBody(req);
  const submitted = typeof body.password === 'string' ? body.password : '';

  if (!safeEqual(submitted, configuredPassword)) {
    const page = messagePage('Please try again', 'That guest password was not recognized.', 401);
    return res.status(page.status).setHeader('Content-Type', 'text/html; charset=utf-8').send(page.html);
  }

  const token = tokenFor(configuredPassword, secret);
  res.setHeader('Set-Cookie', `vvp_guest=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  res.statusCode = 303;
  res.setHeader('Location', '/guide');
  return res.end();
}
