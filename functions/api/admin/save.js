import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BLOG_DATA_PATH = path.join(ROOT, 'data', 'blog.json');
const POSTS_DIR = path.join(ROOT, 'data', 'blog', 'posts');
const TEMPLATE_PATH = path.join(ROOT, 'templates', 'post.html');

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function applyInlineMarkdown(text) {
  const escaped = escapeHtml(text);

  const withLinks = escaped.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_match, label, href) => {
    return `<a href="${escapeHtml(href)}" rel="noreferrer">${label}</a>`;
  });

  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return withItalic;
}

function markdownToHtml(markdown = '') {
  const lines = String(markdown).split(/\r?\n/);
  const html = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    html.push('<ul>');
    for (const item of listItems) {
      html.push(`<li>${applyInlineMarkdown(item)}</li>`);
    }
    html.push('</ul>');
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith('- ')) {
      listItems.push(line.slice(2).trim());
      continue;
    }

    flushList();

    if (line.startsWith('### ')) {
      html.push(`<h3>${applyInlineMarkdown(line.slice(4).trim())}</h3>`);
      continue;
    }

    if (line.startsWith('## ')) {
      html.push(`<h2>${applyInlineMarkdown(line.slice(3).trim())}</h2>`);
      continue;
    }

    if (line.startsWith('# ')) {
      html.push(`<h1>${applyInlineMarkdown(line.slice(2).trim())}</h1>`);
      continue;
    }

    html.push(`<p>${applyInlineMarkdown(line)}</p>`);
  }

  flushList();
  return html.join('\n');
}

function toDatePt(dateValue) {
  if (!dateValue) return '';
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function replacePlaceholders(template, values) {
  return Object.entries(values).reduce((acc, [key, value]) => {
    return acc.replaceAll(`{{${key}}}`, value ?? '');
  }, template);
}

function buildSecondaryCta(label, href) {
  if (!label || !href) return '';
  return `<a class="btn ghost glass" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
}

export async function onRequestPost(context) {
  try {
    const { slug, data } = await context.request.json();

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return Response.json({ error: 'Invalid slug.' }, { status: 400 });
    }

    await mkdir(POSTS_DIR, { recursive: true });
    await mkdir(path.join(ROOT, 'blog', 'p', slug), { recursive: true });

    const postData = {
      ...data,
      slug,
      id: slug,
      href: `/blog/p/${slug}/index.html`,
    };

    const postJsonPath = path.join(POSTS_DIR, `${slug}.json`);
    await writeFile(postJsonPath, `${JSON.stringify(postData, null, 2)}\n`, 'utf8');

    const rawBlog = await readFile(BLOG_DATA_PATH, 'utf8');
    const blogData = JSON.parse(rawBlog);
    const posts = Array.isArray(blogData.posts) ? blogData.posts : [];

    const summary = {
      id: slug,
      slug,
      title: data?.title || '',
      excerpt: data?.excerpt || '',
      category: data?.category || '',
      tags: Array.isArray(data?.tags) ? data.tags : [],
      date: data?.date || '',
      readMin: Number(data?.readMin || 0),
      featured: Boolean(data?.featured),
      image: data?.image || data?.coverImage || '',
      href: `/blog/p/${slug}/index.html`,
    };

    const idx = posts.findIndex((item) => (item.slug || item.id) === slug);
    if (idx >= 0) posts[idx] = { ...posts[idx], ...summary };
    else posts.unshift(summary);

    blogData.posts = posts;
    await writeFile(BLOG_DATA_PATH, `${JSON.stringify(blogData, null, 2)}\n`, 'utf8');

    const template = await readFile(TEMPLATE_PATH, 'utf8');

    const html = replacePlaceholders(template, {
      TITLE: escapeHtml(data?.title || ''),
      EXCERPT: escapeHtml(data?.excerpt || ''),
      COVER_IMAGE: escapeHtml(data?.coverImage || data?.image || ''),
      CATEGORY: escapeHtml(data?.category || ''),
      TAG: escapeHtml(Array.isArray(data?.tags) ? data.tags[0] || '' : ''),
      DATE_PT: escapeHtml(toDatePt(data?.date)),
      READ_MIN: escapeHtml(String(data?.readMin ?? '')),
      CONTENT1_HTML: markdownToHtml(data?.content1_markdown || ''),
      CONTENT2_HTML: markdownToHtml(data?.content2_markdown || ''),
      CTA1_HEADLINE: escapeHtml(data?.cta1_headline || ''),
      CTA1_SUBHEADLINE: escapeHtml(data?.cta1_subheadline || ''),
      CTA1_PRIMARY_LABEL: escapeHtml(data?.cta1_primary_label || ''),
      CTA1_PRIMARY_HREF: escapeHtml(data?.cta1_primary_href || '#'),
      CTA1_SECONDARY_HTML: buildSecondaryCta(data?.cta1_secondary_label, data?.cta1_secondary_href),
      CTA2_HEADLINE: escapeHtml(data?.cta2_headline || ''),
      CTA2_SUBHEADLINE: escapeHtml(data?.cta2_subheadline || ''),
      CTA2_PRIMARY_LABEL: escapeHtml(data?.cta2_primary_label || ''),
      CTA2_PRIMARY_HREF: escapeHtml(data?.cta2_primary_href || '#'),
      CTA2_SECONDARY_HTML: buildSecondaryCta(data?.cta2_secondary_label, data?.cta2_secondary_href),
    });

    const outputPath = path.join(ROOT, 'blog', 'p', slug, 'index.html');
    await writeFile(outputPath, html, 'utf8');

    return Response.json({ ok: true, slug });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Failed to save post.' }, { status: 500 });
  }
}
