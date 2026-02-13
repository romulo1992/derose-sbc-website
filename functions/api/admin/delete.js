import { deleteFile, getFile, putFile } from "../../_lib/github.js";
import { isAuthorized, json } from "../../_lib/auth.js";

export async function onRequest(context) {
  const { request, env } = context;
  if (!isAuthorized(request, env)) {
    return json(403, { ok: false, message: "forbidden" });
  }
  if (request.method !== "POST") {
    return json(405, { ok: false, message: "method not allowed" });
  }

  try {
    const body = await request.json();
    const slug = String(body?.slug || "").trim();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return json(400, { ok: false, message: "invalid slug" });
    }

    const postPath = `/data/blog/posts/${slug}.json`;
    const htmlPath = `/blog/p/${slug}/index.html`;

    const postFile = await getFile(env, postPath);
    if (postFile) {
      await deleteFile(env, postPath, postFile.sha, `delete post source ${slug}`);
    }

    const htmlFile = await getFile(env, htmlPath);
    if (htmlFile) {
      await deleteFile(env, htmlPath, htmlFile.sha, `delete post page ${slug}`);
    }

    const blogPath = "/data/blog.json";
    const blogCurrent = await getFile(env, blogPath);
    const blogData = blogCurrent ? JSON.parse(blogCurrent.text || "{}") : { posts: [] };
    const posts = Array.isArray(blogData.posts) ? blogData.posts.filter((item) => item && item.id !== slug) : [];

    await putFile(env, blogPath, `${JSON.stringify({ posts }, null, 2)}\n`, blogCurrent?.sha || null, `remove post from index ${slug}`);

    return json(200, { ok: true });
  } catch (error) {
    return json(500, { ok: false, message: String(error?.message || error) });
  }
}
