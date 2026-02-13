function hasAccessAuthorizationCookie(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((cookie) => cookie.startsWith("CF_Authorization="));
}

export function isAuthorized(request, env) {
  const hasJwtAssertion = Boolean(request.headers.get("Cf-Access-Jwt-Assertion"));
  const hasAuthorizationCookie = hasAccessAuthorizationCookie(request);
  if (hasJwtAssertion || hasAuthorizationCookie) return true;

  const adminKey = String(env?.ADMIN_KEY || "").trim();
  if (!adminKey) return false;
  return request.headers.get("X-Admin-Key") === adminKey;
}

export function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
