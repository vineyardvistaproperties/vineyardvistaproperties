export default function handler(req, res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `vvp_guest=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
  res.writeHead(302, { Location: '/' });
  res.end();
}
