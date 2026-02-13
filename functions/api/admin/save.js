import {
  applyTemplate,
  computeReadMinFromMarkdown,
  ensureAdmin,
  ensureLeadingSlash,
  formatDatePt,
  getFile,
  isValidDateYYYYMMDD,
  json,
  markdownToHtml,
  putFile,
  renderSecondaryCta,
  sortPostsByDateDesc,
} from './_shared.js';

export async function onRequestPost({ request, env }) {
  const denied = ensureAdmin(request, env);
  if (denied) return denied;

  try {
    const body = await request.json();
    const slug = String(body?.slug || '').trim();
    const input = body?.data || {};

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return json({ ok: false, message: 'invalid slug' }, 400);
    }

    const tags = Array.isArray(input.tags)
      ? input.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [];

    const date = String(input.date || '').trim();
    if (!isValidDateYYYYMMDD(date)) {
      return json({ ok: false, message: 'invalid date, expected YYYY-MM-DD' }, 400);
    }

    const image = ensureLeadingSlash(input.image || '/assets/blog/featured.webp');
    const coverImage = ensureLeadingSlash(input.coverImage || image || '/assets/blog/featured.webp');

    const normalized = {
      ...input,
      id: slug,
      slug,
      tags,
      date,
      image,
      coverImage,
      category: String(input.category || '').trim() || '—',
    };

    if (!Number.isFinite(Number(normalized.readMin)) || Number(normalized.readMin) < 1) {
      normalized.readMin = computeReadMinFromMarkdown(normalized.content1_markdown, normalized.content2_markdown);
    } else {
      normalized.readMin = Math.max(1, Math.round(Number(normalized.readMin)));
    }

    const sourcePath = `data/blog/posts/${slug}.json`;
    const oldSource = await getFile(env, sourcePath);
    await putFile(
      env,
      sourcePath,
      `${JSON.stringify(normalized, null, 2)}\n`,
      oldSource?.sha ?? null,
      `admin: save source for ${slug}`,
    );

    const listingPath = 'data/blog.json';
    const oldListing = await getFile(env, listingPath);
    const listing = oldListing ? JSON.parse(oldListing.text || '{}') : { posts: [] };
    const posts = Array.isArray(listing.posts) ? listing.posts : [];
    const listEntry = {
      id: slug,
      title: String(normalized.title || ''),
      excerpt: String(normalized.excerpt || ''),
      category: normalized.category,
      tags: normalized.tags,
      date: normalized.date,
      readMin: normalized.readMin,
      featured: Boolean(normalized.featured),
      image: normalized.image,
      href: `/blog/p/${slug}/index.html`,
    };

    const updatedPosts = sortPostsByDateDesc([...posts.filter((p) => p?.id !== slug), listEntry]);
    await putFile(
      env,
      listingPath,
      `${JSON.stringify({ posts: updatedPosts }, null, 2)}\n`,
      oldListing?.sha ?? null,
      `admin: update listing for ${slug}`,
    );

    const templateFile = await getFile(env, 'templates/post.html');
    if (!templateFile) {
      return json({ ok: false, message: 'template not found' }, 500);
    }

    const replacements = {
      TITLE: normalized.title || '',
      EXCERPT: normalized.excerpt || '',
      CATEGORY: normalized.category || '—',
      TAG: normalized.tags[0] || '—',
      DATE_PT: formatDatePt(normalized.date),
      READ_MIN: normalized.readMin,
      COVER_IMAGE: normalized.coverImage || normalized.image,
      CONTENT1_HTML: markdownToHtml(normalized.content1_markdown),
      CONTENT2_HTML: markdownToHtml(normalized.content2_markdown),
      CTA1_HEADLINE: normalized.cta1_headline || '',
      CTA1_SUBHEADLINE: normalized.cta1_subheadline || '',
      CTA1_PRIMARY_HREF: normalized.cta1_primary_href || '#',
      CTA1_PRIMARY_LABEL: normalized.cta1_primary_label || '',
      CTA1_SECONDARY_HTML: renderSecondaryCta(normalized.cta1_secondary_label, normalized.cta1_secondary_href),
      CTA2_HEADLINE: normalized.cta2_headline || '',
      CTA2_SUBHEADLINE: normalized.cta2_subheadline || '',
      CTA2_PRIMARY_HREF: normalized.cta2_primary_href || '#',
      CTA2_PRIMARY_LABEL: normalized.cta2_primary_label || '',
      CTA2_SECONDARY_HTML: renderSecondaryCta(normalized.cta2_secondary_label, normalized.cta2_secondary_href),
    };

    const renderedHtml = applyTemplate(templateFile.text, replacements);
    const htmlPath = `blog/p/${slug}/index.html`;
    const oldHtml = await getFile(env, htmlPath);
    await putFile(env, htmlPath, renderedHtml, oldHtml?.sha ?? null, `admin: generate html for ${slug}`);

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, message: error.message || 'failed' }, 500);
  }
}
