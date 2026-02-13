function normalizePath(path) {
  return String(path || "").replace(/^\/+/, "");
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function normalizeBase64Content(content) {
  return String(content || "").replace(/\s+/g, "");
}

function decodeBase64(base64Text) {
  const binary = atob(String(base64Text || "").replace(/\n/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function getConfig(env) {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH;
  const token = env.GITHUB_TOKEN;
  if (!owner || !repo || !branch || !token) {
    throw new Error("Missing GitHub env vars");
  }
  return { owner, repo, branch, token };
}

async function githubFetch(env, url, init = {}) {
  const { token } = getConfig(env);
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "derose-sbc-pages-function",
      ...(init.headers || {}),
    },
  });
  return res;
}

export async function getFile(env, path) {
  const { owner, repo, branch } = getConfig(env);
  const cleanPath = normalizePath(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}?ref=${encodeURIComponent(branch)}`;
  const res = await githubFetch(env, url);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub getFile failed (${res.status})`);
  }
  const payload = await res.json();
  return { text: decodeBase64(payload.content || ""), sha: payload.sha };
}

export async function putFile(env, path, text, shaOrNull, message) {
  const { owner, repo, branch } = getConfig(env);
  const cleanPath = normalizePath(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  const body = {
    message,
    content: encodeBase64(text),
    branch,
  };
  if (shaOrNull) body.sha = shaOrNull;
  const res = await githubFetch(env, url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub putFile failed (${res.status})`);
  }
  return res.json();
}

export async function putFileBase64(env, path, base64Content, shaOrNull, message) {
  const { owner, repo, branch } = getConfig(env);
  const cleanPath = normalizePath(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  const body = {
    message,
    content: normalizeBase64Content(base64Content),
    branch,
  };
  if (shaOrNull) body.sha = shaOrNull;
  const res = await githubFetch(env, url, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`GitHub putFileBase64 failed (${res.status})`);
  }
  return res.json();
}

export async function deleteFile(env, path, sha, message) {
  const { owner, repo, branch } = getConfig(env);
  const cleanPath = normalizePath(path);
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;
  const res = await githubFetch(env, url, {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) {
    throw new Error(`GitHub deleteFile failed (${res.status})`);
  }
  return res.json();
}
