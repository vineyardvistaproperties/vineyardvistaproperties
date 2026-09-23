# Vineyard Vista Properties — Private Working Demo

## Access model
- Entire website: `MVY2027`
- Management: `ABCgang` (after the main-site password)

Set these Vercel environment variables exactly:
- `SITE_PASSWORD=MVY2027`
- `MANAGEMENT_PASSWORD=ABCgang`
- `AUTH_SECRET=<a long random secret>`

## Website structure
- `/` — house marketing + availability + Request Your Stay workflow
- `/guide` — Guest Experience / About This House
- `/management` — Governance
- `/management/rentals` — Rentals & Agreements
- `/management/house-standards` — House Standards
- `/management/property` — Property Management

Management is intentionally absent from the public navigation and main-page content. It appears only in the footer.

## Booking demo
The request form currently validates and submits to `/api/request`, which returns a demo reference number but does not send email or collect payment. The intended production workflow remains: request → approval → Rental Agreement (+ Pet Addendum when applicable) → signatures → payment → confirmed reservation → pre-arrival communications → About This House. Party/event requests occur only after the house booking is confirmed and require separate written approval and a Party Addendum.

## Deployment
Upload this folder to the GitHub repository connected to Vercel. The content pages are stored inside `api/templates.js` and served only after authentication, rather than existing as directly accessible static HTML files.

## Editable page files included

- `index.html` — main Vineyard Vista house marketing and booking experience
- `guide.html` — Guest Experience / About This House
- `login.html` — authentication screen
- `management.html` — Governance
- `rentals.html` — Rentals & Agreements
- `house-standards.html` — House Standards
- `property-management.html` — Property Management

The live Vercel routes are protected by `api/protected.js`. For convenience, the editable
HTML versions are also included at the project root. The same page markup is embedded in
`api/templates.js`, which is what the protected routes currently serve.

Required Vercel environment variables:

- `SITE_PASSWORD=MVY2027`
- `MANAGEMENT_PASSWORD=ABCgang`
- `AUTH_SECRET=<long random secret>`
