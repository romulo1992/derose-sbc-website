import { getFile } from "../../_lib/github.js";
import { ensureAdmin, jsonResponse } from "../../_lib/util.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!ensureAdmin(request, env)) {
    return jsonResponse(403, { ok: false, message: "forbidden" });
  }

  try {
    const { searchParams } = new URL(request.url);
    const slug = String(searchParams.get("slug") || "").trim();
    if (!slug) return jsonResponse(400, { ok: false, message: "slug required" });

    const file = await getFile(env, `/data/blog/posts/${slug}.json`);
    if (!file) return jsonResponse(404, { ok: false, message: "not found" });

    return jsonResponse(200, { ok: true, data: JSON.parse(file.text) });
  } catch (error) {
    return jsonResponse(500, { ok: false, message: String(error?.message || error) });
  }
}
