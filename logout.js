export default function handler(req, res) {
  res.setHeader('Set-Cookie', 'vvp_guest=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  res.statusCode = 303;
  res.setHeader('Location', '/');
  return res.end();
}
