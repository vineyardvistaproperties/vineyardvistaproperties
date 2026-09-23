# Vineyard Vista Properties — Master Website

This is the master GitHub/Vercel version of the Vineyard Vista Properties password-protected guest guide.

## File structure

- `guide.json` — **primary content file**. Update this for recommendations, addresses, phone numbers, links, house notes, family/pet language, transportation, beaches, dining, etc.
- `guide.html` — guest-guide page structure. Usually leave this alone for content-only changes.
- `styles.css` — visual design, spacing, typography, responsive behavior.
- `script.js` — reads `guide.json` and renders the guide.
- `index.html` — password landing page.
- `login.css` — password landing page styling.
- `vvp-logo.jpeg` — current logo asset.

## Authentication / infrastructure — do not change for normal site edits

- `middleware.js`
- `vercel.json`
- `package.json`
- `robots.txt`
- `api/login.js`
- `api/logout.js`

Vercel environment variables remain:

- `SITE_PASSWORD` = `MVY2027`
- `AUTH_SECRET` = your existing long secret value

## Normal update workflow

1. Edit `guide.json` for ordinary content changes.
2. Replace `guide.json` in the GitHub repository and commit.
3. Vercel automatically deploys the new version.
4. Password protection and domain settings remain unchanged.

For design changes, update `guide.html`, `styles.css`, and/or `script.js` as needed.

## Important

Keep the `api` folder intact. Vercel uses `/api/login.js` and `/api/logout.js` as server-side functions.
