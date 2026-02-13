import { getFile } from "../../_lib/github.js";
import { ensureAdmin, jsonResponse } from "../../_lib/util.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!ensureAdmin(request, env)) {
    return jsonResponse(403, { ok: false, message: "forbidden" });
  }

  try {
    const file = await getFile(env, "/data/blog.json");
    if (!file) return jsonResponse(200, { posts: [] });

    const parsed = JSON.parse(file.text || "{}");
    const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
    posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    return jsonResponse(200, { posts });
  } catch (error) {
    return jsonResponse(500, { ok: false, message: String(error?.message || error) });
  }
}
