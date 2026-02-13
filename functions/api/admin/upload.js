import { getFile, putFileBase64 } from "../../_lib/github.js";
import { isAuthorized, json } from "../../_lib/auth.js";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

function sanitizeBaseName(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeExtension(name, type) {
  const fromName = String(name || "").split(".").pop()?.toLowerCase() || "";
  if (ALLOWED_EXTENSIONS.has(fromName)) return fromName;

  const mimeToExt = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
  };
  return mimeToExt[String(type || "").toLowerCase()] || "";
}

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export async function onRequest(context) {
  const { request, env } = context;
  if (!isAuthorized(request, env)) {
    return json(403, { ok: false, message: "forbidden" });
  }
  if (request.method !== "POST") {
    return json(405, { ok: false, message: "method not allowed" });
  }

  try {
    const form = await request.formData();
    const image = form.get("image");
    const slugRaw = String(form.get("slug") || "").trim();

    if (!(image instanceof File)) {
      return json(400, { ok: false, message: "image file is required" });
    }
    if (!slugRaw || !/^[a-z0-9-]+$/.test(slugRaw)) {
      return json(400, { ok: false, message: "invalid slug" });
    }
    if (image.size <= 0) {
      return json(400, { ok: false, message: "empty file" });
    }
    if (image.size > MAX_UPLOAD_SIZE) {
      return json(413, { ok: false, message: "file too large (max 5MB)" });
    }

    const extension = normalizeExtension(image.name, image.type);
    if (!extension) {
      return json(400, { ok: false, message: "unsupported image format" });
    }

    const inputName = String(form.get("name") || "").trim();
    const safeBaseName = sanitizeBaseName(inputName || image.name) || `${slugRaw}-${Date.now()}`;
    const filename = `${slugRaw}-${safeBaseName}.${extension}`;
    const outputPath = `/assets/blog/uploads/${filename}`;

    const bytes = new Uint8Array(await image.arrayBuffer());
    const base64Content = bytesToBase64(bytes);
    const current = await getFile(env, outputPath);
    await putFileBase64(env, outputPath, base64Content, current?.sha || null, `upload image ${filename}`);

    return json(200, { ok: true, path: outputPath });
  } catch (error) {
    return json(500, { ok: false, message: String(error?.message || error) });
  }
}
