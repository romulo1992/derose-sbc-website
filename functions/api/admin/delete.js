import { deleteFile, ensureAdmin, getFile, json, putFile } from './_shared.js';

export async function onRequestPost({ request, env }) {
  const denied = ensureAdmin(request, env);
  if (denied) return denied;

  try {
    const body = await request.json();
    const slug = String(body?.slug || '').trim();

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return json({ ok: false, message: 'invalid slug' }, 400);
    }

    const sourcePath = `data/blog/posts/${slug}.json`;
    const source = await getFile(env, sourcePath);
    if (source) {
      await deleteFile(env, sourcePath, source.sha, `admin: delete source for ${slug}`);
    }

    const htmlPath = `blog/p/${slug}/index.html`;
    const html = await getFile(env, htmlPath);
    if (html) {
      await deleteFile(env, htmlPath, html.sha, `admin: delete html for ${slug}`);
    }

    const listingPath = 'data/blog.json';
    const listing = await getFile(env, listingPath);
    const parsed = listing ? JSON.parse(listing.text || '{}') : { posts: [] };
    const posts = Array.isArray(parsed.posts) ? parsed.posts : [];
    const nextPosts = posts.filter((post) => post?.id !== slug);

    await putFile(
      env,
      listingPath,
      `${JSON.stringify({ posts: nextPosts }, null, 2)}\n`,
      listing?.sha ?? null,
      `admin: remove listing for ${slug}`,
    );

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, message: error.message || 'failed' }, 500);
  }
}
