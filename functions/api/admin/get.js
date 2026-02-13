import { getFile } from "../../_lib/github.js";
import { isAuthorized, json } from "../../_lib/auth.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!isAuthorized(request, env)) {
    return json(403, { ok: false, message: "forbidden" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = String(searchParams.get("slug") || "").trim();
    if (!slug) return json(400, { ok: false, message: "slug required" });

    const file = await getFile(env, `/data/blog/posts/${slug}.json`);
    if (!file) return json(404, { ok: false, message: "not found" });

    return json(200, { ok: true, data: JSON.parse(file.text) });
  } catch (error) {
    return json(500, { ok: false, message: String(error?.message || error) });
  }
}
