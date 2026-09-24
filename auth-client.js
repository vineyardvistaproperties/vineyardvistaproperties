// Client-side helper for the private Vercel deployment.
// Authentication is enforced server-side by middleware.js; this file only
// provides a consistent redirect if a future API call returns 401.
window.vvpAuthFetch = async function(input, init) {
  const response = await fetch(input, init);
  if (response.status === 401) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    location.href = '/login.html?next=' + next;
  }
  return response;
};
