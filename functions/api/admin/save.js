import { getFile, putFile } from "../../_lib/github.js";
import { markdownToHtml } from "../../_lib/markdown.js";
import { isAuthorized, json } from "../../_lib/auth.js";
import {
  computeReadMinFromMarkdown,
  ensureLeadingSlashPath,
  escapeAttr,
  escapeHtml,
  formatDatePtShort,
  sanitizeUrl,
} from "../../_lib/util.js";

function applyTemplate(template, replacements) {
  let output = template;
  for (const [key, value] of Object.entries(replacements)) {
    output = output.split(`{{${key}}}`).join(String(value ?? ""));
  }
  return output;
}

function buildSecondaryCta(label, href) {
  if (!label || !href) return "";
  const safeHref = sanitizeUrl(href);
  if (!safeHref) return "";
  return `<a class="btn ghost glass" href="${escapeAttr(safeHref)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

function normalizeData(slug, incoming) {
  const data = incoming && typeof incoming === "object" ? { ...incoming } : {};
  const date = String(data.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid date, expected YYYY-MM-DD");
  }

  const image = ensureLeadingSlashPath(data.image || "");
  const coverImage = ensureLeadingSlashPath(data.coverImage || image) || image;
  const tags = Array.isArray(data.tags) ? data.tags.map((item) => String(item).trim()).filter(Boolean) : [];
  const content1 = String(data.content1 || "");
  const content2 = String(data.content2 || "");

  return {
    ...data,
    id: slug,
    title: String(data.title || "").trim(),
    excerpt: String(data.excerpt || "").trim(),
    category: String(data.category || "").trim() || "—",
    tags,
    date,
    readMin: Number.isFinite(Number(data.readMin)) && Number(data.readMin) > 0
      ? Number(data.readMin)
      : computeReadMinFromMarkdown(`${content1}\n${content2}`),
    featured: Boolean(data.featured),
    image,
    coverImage,
    content1,
    content2,
    tag: String(data.tag || tags[0] || "—").trim() || "—",
    cta1: data.cta1 && typeof data.cta1 === "object" ? data.cta1 : {},
    cta2: data.cta2 && typeof data.cta2 === "object" ? data.cta2 : {},
  };
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
    const body = await request.json();
    const slug = String(body?.slug || "").trim();
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return json(400, { ok: false, message: "invalid slug" });
    }

    const normalized = normalizeData(slug, body?.data);
    const postPath = `/data/blog/posts/${slug}.json`;
    const postCurrent = await getFile(env, postPath);
    await putFile(env, postPath, `${JSON.stringify(normalized, null, 2)}\n`, postCurrent?.sha || null, `save post ${slug}`);

    const blogPath = "/data/blog.json";
    const blogCurrent = await getFile(env, blogPath);
    const blogData = blogCurrent ? JSON.parse(blogCurrent.text || "{}") : { posts: [] };
    const posts = Array.isArray(blogData.posts) ? [...blogData.posts] : [];

    const summary = {
      id: slug,
      title: normalized.title,
      excerpt: normalized.excerpt,
      category: normalized.category,
      tags: normalized.tags,
      date: normalized.date,
      readMin: normalized.readMin,
      featured: normalized.featured,
      image: normalized.image,
      href: `/blog/p/${slug}/index.html`,
    };

    const index = posts.findIndex((item) => item && item.id === slug);
    if (index >= 0) posts[index] = summary;
    else posts.push(summary);
    posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    await putFile(env, blogPath, `${JSON.stringify({ posts }, null, 2)}\n`, blogCurrent?.sha || null, `update blog index ${slug}`);

    const templateUrl = new URL("/templates/post.html", request.url);
    const tplRes = await env.ASSETS.fetch(new Request(templateUrl.toString()));
    if (!tplRes.ok) throw new Error("Template not found: /templates/post.html");
    const template = await tplRes.text();

    const cta1 = normalized.cta1 || {};
    const cta2 = normalized.cta2 || {};

    const html = applyTemplate(template, {
      TITLE: escapeHtml(normalized.title),
      EXCERPT: escapeHtml(normalized.excerpt),
      CATEGORY: escapeHtml(normalized.category),
      TAG: escapeHtml(normalized.tag),
      DATE_PT: escapeHtml(formatDatePtShort(normalized.date) || normalized.date),
      READ_MIN: escapeHtml(normalized.readMin),
      COVER_IMAGE: escapeAttr(normalized.coverImage),
      CONTENT1_HTML: markdownToHtml(normalized.content1),
      CONTENT2_HTML: markdownToHtml(normalized.content2),
      CTA1_HEADLINE: escapeHtml(String(cta1.headline || "")),
      CTA1_SUBHEADLINE: escapeHtml(String(cta1.subheadline || "")),
      CTA1_PRIMARY_HREF: escapeAttr(sanitizeUrl(cta1.primaryHref || "") || "#"),
      CTA1_PRIMARY_LABEL: escapeHtml(String(cta1.primaryLabel || "")),
      CTA1_SECONDARY_HTML: buildSecondaryCta(cta1.secondaryLabel, cta1.secondaryHref),
      CTA2_HEADLINE: escapeHtml(String(cta2.headline || "")),
      CTA2_SUBHEADLINE: escapeHtml(String(cta2.subheadline || "")),
      CTA2_PRIMARY_HREF: escapeAttr(sanitizeUrl(cta2.primaryHref || "") || "#"),
      CTA2_PRIMARY_LABEL: escapeHtml(String(cta2.primaryLabel || "")),
      CTA2_SECONDARY_HTML: buildSecondaryCta(cta2.secondaryLabel, cta2.secondaryHref),
    });

    const outputPath = `/blog/p/${slug}/index.html`;
    const outputCurrent = await getFile(env, outputPath);
    await putFile(env, outputPath, html, outputCurrent?.sha || null, `publish post ${slug}`);

    return json(200, { ok: true });
  } catch (error) {
    return json(500, { ok: false, message: String(error?.message || error) });
  }
}
