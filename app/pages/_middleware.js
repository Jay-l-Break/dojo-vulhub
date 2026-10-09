export function middleware(request) {
  if (request.nextUrl.pathname === '/login') return;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  const cookies = (request.headers.get('cookie') || '').split(';').map((value) => value.trim());
  if (expected && cookies.includes(`admin_session=${expected}`)) return;
  return new Response(null, {status: 302, headers: {Location: '/login'}});
}
