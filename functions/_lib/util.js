export function escapeHtml(value) {
  return String(value ?? "")
    .split("&").join("&amp;")
    .split("<").join("&lt;")
    .split(">") .join("&gt;")
    .split('"').join("&quot;")
    .split("'").join("&#39;");
}

export function escapeAttr(value) {
  return escapeHtml(value);
}

export function sanitizeUrl(value) {
  const input = String(value ?? "").trim();
  if (!input) return "";
  if (input.startsWith("/") || input.startsWith("#")) return input;
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  return "";
}

export function formatDatePtShort(isoDate) {
  const match = String(isoDate ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  if (month < 1 || month > 12) return "";
  return `${day} ${months[month - 1]} ${year}`;
}

export function computeReadMinFromMarkdown(md) {
  const text = String(md ?? "").replace(/[`*_>#\-[\]()]/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function ensureAdmin(request, env) {
  const hasAccessHeader =
    Boolean(request.headers.get("Cf-Access-Jwt-Assertion")) ||
    Boolean(request.headers.get("Cf-Access-Authenticated-User-Email"));
  if (!hasAccessHeader) return false;

  const email = request.headers.get("Cf-Access-Authenticated-User-Email");
  if (!email) return true;

  const normalizedEmail = email.trim().toLowerCase();
  const adminEmailsCsv = String(env.ADMIN_EMAILS || "").trim();
  if (adminEmailsCsv) {
    const allowed = adminEmailsCsv
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    return allowed.includes(normalizedEmail);
  }

  const singleAdmin = String(env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!singleAdmin) return false;
  return normalizedEmail === singleAdmin;
}

export function ensureLeadingSlashPath(value) {
  const sanitized = sanitizeUrl(value);
  if (!sanitized || sanitized.startsWith("http://") || sanitized.startsWith("https://") || sanitized.startsWith("#")) {
    return "";
  }
  return sanitized.startsWith("/") ? sanitized : "";
}
