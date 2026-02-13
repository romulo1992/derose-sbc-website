const DEFAULT_IMAGE = '/assets/blog/featured.webp';

const state = {
  posts: [],
  filtered: [],
  currentSlug: '',
};

const el = {
  search: document.getElementById('search'),
  postList: document.getElementById('postList'),
  newPostBtn: document.getElementById('newPostBtn'),
  postForm: document.getElementById('postForm'),
  editorTitle: document.getElementById('editorTitle'),
  status: document.getElementById('status'),
  deleteBtn: document.getElementById('deleteBtn'),
};

const fields = Object.fromEntries(
  Array.from(el.postForm.elements)
    .filter((item) => item.name)
    .map((item) => [item.name, item])
);

function setStatus(text, type = '') {
  el.status.textContent = text;
  el.status.className = `status ${type}`.trim();
}

function toForm(data = {}) {
  fields.slug.value = data.slug || data.id || '';
  fields.title.value = data.title || '';
  fields.excerpt.value = data.excerpt || '';
  fields.category.value = data.category || '';
  fields.tags.value = Array.isArray(data.tags) ? data.tags.join(', ') : data.tags || '';
  fields.date.value = data.date || '';
  fields.readMin.value = data.readMin ?? '';
  fields.featured.checked = Boolean(data.featured);
  fields.image.value = data.image || DEFAULT_IMAGE;
  fields.coverImage.value = data.coverImage || fields.image.value || DEFAULT_IMAGE;

  const cta1 = data.cta1 && typeof data.cta1 === 'object' ? data.cta1 : {};
  const cta2 = data.cta2 && typeof data.cta2 === 'object' ? data.cta2 : {};

  fields.content1_markdown.value = data.content1_markdown || data.content1 || '';
  fields.cta1_headline.value = data.cta1_headline || cta1.headline || '';
  fields.cta1_subheadline.value = data.cta1_subheadline || cta1.subheadline || '';
  fields.cta1_primary_label.value = data.cta1_primary_label || cta1.primaryLabel || '';
  fields.cta1_primary_href.value = data.cta1_primary_href || cta1.primaryHref || '';
  fields.cta1_secondary_label.value = data.cta1_secondary_label || cta1.secondaryLabel || '';
  fields.cta1_secondary_href.value = data.cta1_secondary_href || cta1.secondaryHref || '';
  fields.content2_markdown.value = data.content2_markdown || data.content2 || '';
  fields.cta2_headline.value = data.cta2_headline || cta2.headline || '';
  fields.cta2_subheadline.value = data.cta2_subheadline || cta2.subheadline || '';
  fields.cta2_primary_label.value = data.cta2_primary_label || cta2.primaryLabel || '';
  fields.cta2_primary_href.value = data.cta2_primary_href || cta2.primaryHref || '';
  fields.cta2_secondary_label.value = data.cta2_secondary_label || cta2.secondaryLabel || '';
  fields.cta2_secondary_href.value = data.cta2_secondary_href || cta2.secondaryHref || '';
}

function fromForm() {
  const slug = fields.slug.value.trim();
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error('Slug inválido. Use apenas a-z, 0-9 e hífen.');
  }

  const tags = fields.tags.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const readMinRaw = fields.readMin.value.trim();
  const readMin = readMinRaw === '' ? undefined : Number(readMinRaw);
  if (readMinRaw !== '' && Number.isNaN(readMin)) {
    throw new Error('readMin deve ser número ou vazio.');
  }

  return {
    slug,
    title: fields.title.value.trim(),
    excerpt: fields.excerpt.value.trim(),
    category: fields.category.value.trim(),
    tags,
    date: fields.date.value,
    readMin,
    featured: fields.featured.checked,
    image: fields.image.value.trim() || DEFAULT_IMAGE,
    coverImage: fields.coverImage.value.trim() || fields.image.value.trim() || DEFAULT_IMAGE,
    content1: fields.content1_markdown.value,
    cta1: {
      headline: fields.cta1_headline.value.trim(),
      subheadline: fields.cta1_subheadline.value.trim(),
      primaryLabel: fields.cta1_primary_label.value.trim(),
      primaryHref: fields.cta1_primary_href.value.trim(),
      secondaryLabel: fields.cta1_secondary_label.value.trim(),
      secondaryHref: fields.cta1_secondary_href.value.trim(),
    },
    content2: fields.content2_markdown.value,
    cta2: {
      headline: fields.cta2_headline.value.trim(),
      subheadline: fields.cta2_subheadline.value.trim(),
      primaryLabel: fields.cta2_primary_label.value.trim(),
      primaryHref: fields.cta2_primary_href.value.trim(),
      secondaryLabel: fields.cta2_secondary_label.value.trim(),
      secondaryHref: fields.cta2_secondary_href.value.trim(),
    },
  };
}

function renderList() {
  el.postList.innerHTML = '';
  for (const post of state.filtered) {
    const item = document.createElement('li');
    item.className = `post-item${post.slug === state.currentSlug ? ' active' : ''}`;
    item.innerHTML = `
      <strong>${post.title || '(sem título)'}</strong>
      <small>${post.slug || post.id || ''}</small>
      <small>${post.date || ''}</small>
    `;
    item.addEventListener('click', () => loadPost(post.slug || post.id));
    el.postList.appendChild(item);
  }
}

function filterList() {
  const q = el.search.value.trim().toLowerCase();
  state.filtered = state.posts.filter((p) => {
    const slug = (p.slug || p.id || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    return !q || slug.includes(q) || title.includes(q);
  });
  renderList();
}

async function fetchJSON(url, options) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    if (res.status === 403) {
      const err = new Error('Access session missing/expired — open /api/admin/list in a new tab to login');
      err.status = 403;
      throw err;
    }
    const text = await res.text();
    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function loadList() {
  setStatus('Carregando lista...');
  const data = await fetchJSON('/api/admin/list');
  state.posts = Array.isArray(data) ? data : data.posts || [];
  filterList();
  setStatus(`Lista carregada (${state.posts.length} posts).`, 'ok');
}

async function loadPost(slug) {
  state.currentSlug = slug;
  renderList();
  el.editorTitle.textContent = `Editando: ${slug}`;
  setStatus('Carregando post...');

  try {
    const response = await fetchJSON(`/api/admin/get?slug=${encodeURIComponent(slug)}`);
    const data = response?.data && typeof response.data === 'object' ? response.data : response;
    toForm({ ...data, slug });
    setStatus('Post carregado.', 'ok');
  } catch (err) {
    if (err.status === 404) {
      toForm({ slug, image: DEFAULT_IMAGE, coverImage: DEFAULT_IMAGE });
      setStatus('Conteúdo ainda não existe. Você pode criar e salvar agora.', '');
      return;
    }
    console.error(err);
    setStatus(`Erro ao carregar: ${err.message}`, 'error');
  }
}

async function savePost(event) {
  event.preventDefault();
  try {
    const data = fromForm();
    await fetchJSON('/api/admin/save', {
      method: 'POST',
      body: JSON.stringify({ slug: data.slug, data }),
    });
    state.currentSlug = data.slug;
    setStatus('Post salvo com sucesso.', 'ok');
    await loadList();
    await loadPost(data.slug);
  } catch (err) {
    console.error(err);
    setStatus(`Erro ao salvar: ${err.message}`, 'error');
  }
}

async function deletePost() {
  const slug = fields.slug.value.trim();
  if (!slug) {
    setStatus('Informe um slug para excluir.', 'error');
    return;
  }

  if (!window.confirm(`Excluir o post "${slug}"?`)) return;

  try {
    await fetchJSON('/api/admin/delete', {
      method: 'POST',
      body: JSON.stringify({ slug }),
    });
    setStatus('Post excluído.', 'ok');
    state.currentSlug = '';
    el.postForm.reset();
    toForm({ image: DEFAULT_IMAGE, coverImage: DEFAULT_IMAGE });
    el.editorTitle.textContent = 'Selecione um post';
    await loadList();
  } catch (err) {
    console.error(err);
    setStatus(`Erro ao excluir: ${err.message}`, 'error');
  }
}

function newPost() {
  state.currentSlug = '';
  renderList();
  el.editorTitle.textContent = 'Novo post';
  el.postForm.reset();
  toForm({ image: DEFAULT_IMAGE, coverImage: DEFAULT_IMAGE });
  setStatus('Novo post pronto para edição.');
  fields.slug.focus();
}

el.search.addEventListener('input', filterList);
el.newPostBtn.addEventListener('click', newPost);
el.postForm.addEventListener('submit', savePost);
el.deleteBtn.addEventListener('click', deletePost);

newPost();
loadList().catch((err) => {
  console.error(err);
  setStatus(`Erro ao carregar lista: ${err.message}`, 'error');
});
