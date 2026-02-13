import MarkdownIt from 'https://cdn.jsdelivr.net/npm/markdown-it@14/+esm';

const md = new MarkdownIt({ html: false, linkify: true, breaks: false });

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function ensureAdmin(request, env) {
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');

  if (!jwt && !email) {
    return json({ ok: false, message: 'unauthorized' }, 401);
  }

  if (email && email !== env.ADMIN_EMAIL) {
    return json({ ok: false, message: 'forbidden' }, 403);
  }

  return null;
}

function toBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function fromBase64Utf8(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function githubRequest(env, path, init = {}, ref) {
  const baseUrl = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`;
  const url = ref ? `${baseUrl}?ref=${encodeURIComponent(ref)}` : baseUrl;
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    'X-GitHub-Api-Version': '2022-11-28',
    ...init.headers,
  };

  return fetch(url, {
    ...init,
    headers,
  });
}

export async function getFile(env, path) {
  const res = await githubRequest(env, path, {}, env.GITHUB_BRANCH);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub getFile failed (${res.status}): ${await res.text()}`);
  }

  const body = await res.json();
  return {
    text: fromBase64Utf8(body.content.replace(/\n/g, '')),
    sha: body.sha,
  };
}

export async function putFile(env, path, text, shaOrNull, message) {
  const res = await githubRequest(env, path, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      message,
      content: toBase64Utf8(text),
      branch: env.GITHUB_BRANCH,
      ...(shaOrNull ? { sha: shaOrNull } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub putFile failed (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

export async function deleteFile(env, path, sha, message) {
  const res = await githubRequest(env, path, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: env.GITHUB_BRANCH }),
  });

  if (!res.ok) {
    throw new Error(`GitHub deleteFile failed (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

export function sortPostsByDateDesc(posts = []) {
  return [...posts].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
}

export function isValidDateYYYYMMDD(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function ensureLeadingSlash(value, fallback = '') {
  const v = String(value || fallback || '').trim();
  if (!v) return '';
  return v.startsWith('/') ? v : `/${v}`;
}

export function computeReadMinFromMarkdown(...markdownBlocks) {
  const words = markdownBlocks
    .map((m) => String(m || '').trim())
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export function markdownToHtml(markdown) {
  return md.render(String(markdown || ''));
}

export function formatDatePt(value) {
  const [y, m, d] = String(value).split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const parts = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatToParts(date);

  const day = parts.find((p) => p.type === 'day')?.value ?? String(d).padStart(2, '0');
  const month = (parts.find((p) => p.type === 'month')?.value ?? '').replace('.', '').toLowerCase();
  const year = parts.find((p) => p.type === 'year')?.value ?? String(y);

  return `${day} ${month} ${year}`;
}

export function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderSecondaryCta(label, href) {
  if (!label || !href) return '';
  return `<a class="btn ghost glass" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`;
}

export function applyTemplate(template, replacements) {
  let out = template;
  for (const [key, value] of Object.entries(replacements)) {
    out = out.replaceAll(`{{${key}}}`, String(value ?? ''));
  }
  return out;
}
