import { ensureAdmin, getFile, json, sortPostsByDateDesc } from './_shared.js';

export async function onRequestGet({ request, env }) {
  const denied = ensureAdmin(request, env);
  if (denied) return denied;

  try {
    const listing = await getFile(env, 'data/blog.json');
    if (!listing) return json({ posts: [] });

    const parsed = JSON.parse(listing.text || '{}');
    const posts = sortPostsByDateDesc(Array.isArray(parsed.posts) ? parsed.posts : []);
    return json({ posts });
  } catch (error) {
    return json({ ok: false, message: error.message || 'failed' }, 500);
  }
}
