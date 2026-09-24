# Vineyard Vista — authentication/routing replacement files

Replace only these three root files in the repository:

- middleware.js
- package.json
- vercel.json

Do not replace, delete, or edit anything in the `api/` folder.

This middleware matches the existing `.mjs` login token format:
HMAC-SHA256(AUTH_SECRET, `vvp:${area}:authorized`) as a hexadecimal string.

It also treats both `/login` and `/login.html` as public so Vercel `cleanUrls` cannot create a login redirect loop.
