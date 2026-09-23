# Vineyard Vista Properties — Password-Protected Guest Guide

This is a static HTML/CSS/JavaScript guest-guide website designed for deployment from GitHub to Vercel. The public root page is an elegant password screen. The private guest guide lives at `/guide` and is protected by Vercel Routing Middleware and an HttpOnly authentication cookie.

## Required Vercel environment variables

Before the site will allow access, add these in **Vercel → Project → Settings → Environment Variables**:

- `SITE_PASSWORD` = `MVY2027`
- `AUTH_SECRET` = a long random private string (at least 32 characters)

Add both variables to **Production**, **Preview**, and **Development** if you want the same behavior in all environments. Redeploy after adding or changing them.

## GitHub → Vercel deployment

1. Create a GitHub repository for the site.
2. Upload the contents of this folder to the repository root. Do not upload only the ZIP file.
3. In Vercel, choose **Add New → Project** and import the GitHub repository.
4. Framework Preset: **Other**.
5. Leave Build Command and Output Directory blank.
6. Add the two environment variables above before the production deployment, or add them afterward and redeploy.
7. Deploy.

After deployment, visiting the root URL displays the password screen. The guest enters `MVY2027`, receives a secure HttpOnly cookie, and is sent to `/guide`. The cookie lasts seven days. Selecting **Sign out** clears it and returns to the password page.

## Important security note

The password is checked server-side, not in browser JavaScript. For best privacy, keep the GitHub repository private so the guest-guide HTML itself is not publicly browsable through source control.

## Files

- `index.html` — password landing page
- `login.css` — password page styling
- `login.js` — submits the password to the server-side login endpoint
- `guide.html` — private guest guide
- `styles.css` — guest-guide styling
- `script.js` — guest-guide navigation behavior
- `api/login.js` — validates the password and creates the authentication cookie
- `api/logout.js` — clears the authentication cookie
- `middleware.js` — protects `/guide`
- `vercel.json` — clean URL, routing, privacy headers
- `assets/` — Vineyard Vista logo assets
