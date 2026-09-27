const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function json(res, status, body) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(JSON_HEADERS)) res.setHeader(key, value);
  res.end(JSON.stringify(body));
}

function clean(value, max = 2000) {
  return String(value ?? '').trim().slice(0, max);
}

function esc(value) {
  return clean(value, 10000)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || '';
  const [y, m, d] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(y, m - 1, d)));
}

function line(label, value) {
  if (!value) return '';
  return `<tr><td style="padding:7px 18px 7px 0;color:#66717B;font-size:12px;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${esc(label)}</td><td style="padding:7px 0;color:#0D2340;font-size:14px;vertical-align:top">${esc(value)}</td></tr>`;
}

async function sendResend(apiKey, payload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || 'Email delivery failed.');
  return result;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const bookingsEmail = process.env.BOOKINGS_EMAIL;
  if (!apiKey || !bookingsEmail) return json(res, 500, { error: 'Gathering request email is not configured.' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const firstName = clean(body.first_name, 100);
  const lastName = clean(body.last_name, 100);
  const email = clean(body.email, 254);
  const phone = clean(body.phone, 100);
  const eventDate = clean(body.event_date, 30);
  const occasion = clean(body.occasion, 160);
  const guestCount = Number(body.guest_count);
  const vendors = clean(body.vendors, 80);
  const startTime = clean(body.start_time, 20);
  const endTime = clean(body.end_time, 20);
  const overnight = clean(body.overnight_interest, 80);
  const notes = clean(body.event_notes, 5000);
  const acknowledged = Boolean(body.acknowledgement);

  if (!firstName || !lastName || !email || !phone || !eventDate || !occasion || !Number.isFinite(guestCount) || guestCount < 1 || !vendors || !acknowledged) {
    return json(res, 400, { error: 'Please complete all required gathering request fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(res, 400, { error: 'Please enter a valid email address.' });
  if (eventDate < '2026-10-01' || eventDate > '2027-05-31') return json(res, 400, { error: 'Please select a date within the current gathering-request window.' });

  const guestName = `${firstName} ${lastName}`;
  const prettyDate = formatDate(eventDate);
  const internalHtml = `
  <div style="font-family:Arial,sans-serif;max-width:720px;margin:auto;color:#1B2A3D">
    <div style="border-bottom:1px solid #D9D1C5;padding:0 0 18px;margin-bottom:24px">
      <div style="font-family:Georgia,serif;font-size:28px;color:#0D2340">Vineyard Vista Properties</div>
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#B89C7A;margin-top:4px">Private Gathering Request</div>
    </div>
    <p style="font-size:15px;color:#4D5660">A new private gathering request was submitted through the Vineyard Vista website.</p>
    <table style="border-collapse:collapse;width:100%;margin:20px 0">
      ${line('Guest', guestName)}
      ${line('Email', email)}
      ${line('Phone', phone)}
      ${line('Gathering date', prettyDate)}
      ${line('Occasion', occasion)}
      ${line('Guest count', String(guestCount))}
      ${line('Vendors', vendors)}
      ${line('Start time', startTime)}
      ${line('End time', endTime)}
      ${line('Overnight interest', overnight)}
    </table>
    ${notes ? `<div style="border-top:1px solid #D9D1C5;padding-top:18px"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#66717B;margin-bottom:8px">Gathering notes</div><div style="font-size:14px;line-height:1.7;color:#0D2340;white-space:pre-wrap">${esc(notes)}</div></div>` : ''}
  </div>`;

  const guestHtml = `
  <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#1B2A3D">
    <div style="font-family:Georgia,serif;font-size:30px;color:#0D2340;margin-bottom:4px">Vineyard Vista Properties</div>
    <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#B89C7A;margin-bottom:28px">Exceptional Homes. Timeless Memories.</div>
    <p style="font-family:Georgia,serif;font-size:25px;color:#0D2340;margin:0 0 16px">Thank you for your gathering request.</p>
    <p style="font-size:14px;line-height:1.75;color:#4D5660">We received your request for <strong>${esc(prettyDate)}</strong> and will review it against the property calendar and gathering details. This inquiry does not hold the date or create a reservation. We will follow up with availability, pricing, and next steps.</p>
    <div style="border-top:1px solid #D9D1C5;border-bottom:1px solid #D9D1C5;padding:16px 0;margin:22px 0">
      <div style="font-size:12px;color:#66717B;text-transform:uppercase;letter-spacing:.08em">Occasion</div>
      <div style="font-size:15px;color:#0D2340;margin-top:4px">${esc(occasion)} · ${guestCount} guest${guestCount === 1 ? '' : 's'}</div>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#66717B">If you need to add anything before we respond, simply reply to this email.</p>
  </div>`;

  try {
    await sendResend(apiKey, {
      from: `Vineyard Vista Properties <${bookingsEmail}>`,
      to: [bookingsEmail],
      reply_to: email,
      subject: `Private Gathering Request — ${prettyDate} — ${guestName}`,
      html: internalHtml
    });

    await sendResend(apiKey, {
      from: `Vineyard Vista Properties <${bookingsEmail}>`,
      to: [email],
      reply_to: bookingsEmail,
      subject: 'We received your Vineyard Vista gathering request',
      html: guestHtml
    });

    return json(res, 200, { message: 'Thank you. Your gathering request has been received.' });
  } catch (error) {
    console.error('gathering-request email error', error);
    return json(res, 500, { error: 'Unable to submit your gathering request right now. Please try again.' });
  }
}