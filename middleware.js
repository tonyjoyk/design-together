// Vercel Routing Middleware: asks for a passcode (HTTP Basic Auth) before
// serving any page or API route. Set APP_PASSCODE in the Vercel project.

export const config = {
  matcher: '/:path*',
};

const REALM = 'Design Together';

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
}

async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function passcodeFromHeader(header) {
  if (!header || !header.startsWith('Basic ')) return null;
  try {
    const decoded = atob(header.slice(6));
    const sep = decoded.indexOf(':');
    return sep === -1 ? null : decoded.slice(sep + 1);
  } catch {
    return null;
  }
}

export default async function middleware(request) {
  const expected = process.env.APP_PASSCODE;
  if (!expected) {
    return new Response('Not configured: set APP_PASSCODE.', { status: 500 });
  }

  const given = passcodeFromHeader(request.headers.get('authorization'));
  if (given !== null && (await safeEqual(given, expected))) {
    return; // continue to the page or API
  }

  return new Response('Passcode required.', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"` },
  });
}
