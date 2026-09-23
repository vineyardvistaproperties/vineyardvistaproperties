# Vineyard Vista Properties — Password-Protected Guest Guide

This package is designed for the same GitHub → Vercel workflow used for the Ikorodu Interiors website.

## Important: upload the files at the repository root

When you open the GitHub repository, you should immediately see:

- `index.html`
- `guide.html`
- `login.css`
- `styles.css`
- `script.js`
- `middleware.js`
- `vercel.json`
- `package.json`
- `robots.txt`
- `api/`
- `vvp-logo.jpeg`

Do **not** upload a parent folder that contains these files one level down.

## Vercel environment variables

In Vercel → Project → Settings → Environment Variables, create:

- `SITE_PASSWORD` = `MVY2027`
- `AUTH_SECRET` = your long private authentication secret

Apply both to **Production**. Applying them to Preview as well is recommended.

After adding or changing environment variables, create a **new Production deployment** (Redeploy is fine).

## Why this corrected version is more robust

The login form now submits directly to `/api/login` with an ordinary HTML POST request. It does not depend on `login.js` or browser JavaScript, so the password can no longer appear in the URL as `?password=...` if a script fails to load.

On a successful login, the server sets a secure HttpOnly authentication cookie and redirects to `/guide`. Routing middleware checks that cookie before allowing access to the guide.

## Test after deployment

1. Open a private/incognito browser window.
2. Visit your production domain.
3. Enter `MVY2027`.
4. You should be redirected to `/guide`.
5. Use the Sign Out link to clear the guest session.
