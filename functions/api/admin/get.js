import { ensureAdmin, getFile, json } from './_shared.js';

export async function onRequestGet({ request, env }) {
  const denied = ensureAdmin(request, env);
  if (denied) return denied;

  const url = new URL(request.url);
  const slug = (url.searchParams.get('slug') || '').trim();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return json({ ok: false, message: 'invalid slug' }, 400);
  }

  try {
    const post = await getFile(env, `data/blog/posts/${slug}.json`);
    if (!post) return json({ ok: false, message: 'not found' }, 404);
    return json(JSON.parse(post.text));
  } catch (error) {
    return json({ ok: false, message: error.message || 'failed' }, 500);
  }
}
