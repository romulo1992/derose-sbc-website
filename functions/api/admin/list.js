import { getFile } from "../../_lib/github.js";
import { isAuthorized, json } from "../../_lib/auth.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!isAuthorized(request, env)) {
    return json(403, { ok: false, message: "forbidden" });
  }

  try {
    const file = await getFile(env, "/data/blog.json");
    if (!file) return json(200, { posts: [] });

    const parsed = JSON.parse(file.text || "{}");
    const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
    posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));
    return json(200, { posts });
  } catch (error) {
    return json(500, { ok: false, message: String(error?.message || error) });
  }
}
