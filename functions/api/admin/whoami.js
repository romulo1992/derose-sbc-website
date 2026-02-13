import { json } from "../../_lib/auth.js";

function hasCookie(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((cookie) => cookie.startsWith("CF_Authorization="));
}

export async function onRequest(context) {
  const { request } = context;
  return json(200, {
    ok: true,
    hasJwt: Boolean(request.headers.get("Cf-Access-Jwt-Assertion")),
    hasCookie: hasCookie(request),
    emailHeader: request.headers.get("Cf-Access-Authenticated-User-Email") || null,
  });
}
