(() => {
  "use strict";

  const POSTS = [
    {
      id: "respiracao-3-minutos",
      title: "Respiração Transformadora em 3 minutos: estabilize energia e ruído mental",
      excerpt:
        "Um protocolo simples para você baixar ruído, organizar foco e começar o dia com mais clareza — sem misticismo e sem drama.",
      category: "Respiração",
      tags: ["Respiratórios", "Foco", "Rotina"],
      date: "2026-01-20",
      readMin: 4,
      featured: true,
      image: "../assets/blog/respiracao.webp",
      href: "./p/respiracao-3-minutos/index.html",
    },
    {
      id: "mobilidade-postura",
      title: "Mobilidade & Força Útil: o básico que muda postura e eficiência",
      excerpt:
        "Se você treina, trabalha sentado ou sente o corpo travado, este é o mapa de prioridades para recuperar eixo e estabilidade.",
      category: "Mobilidade",
      tags: ["Força & Flexibilidade", "Postura"],
      date: "2026-01-14",
      readMin: 6,
      featured: false,
      image: "../assets/blog/mobilidade.webp",
      href: "./p/mobilidade-postura/index.html",
    },
    {
      id: "recuperacao-profunda",
      title: "Recuperação Profunda: por que descansar não é perder tempo",
      excerpt:
        "Recuperação não é pausa passiva — é assimilação ativa. Entenda como melhorar recuperação física e emocional com técnica.",
      category: "Recuperação",
      tags: ["Descontração", "Estabilidade"],
      date: "2026-01-10",
      readMin: 5,
      featured: false,
      image: "../assets/blog/recuperacao.webp",
      href: "./p/recuperacao-profunda/index.html",
    },
    {
      id: "foco-centro",
      title: "Foco & Concentração: volte ao centro em qualquer rotina",
      excerpt:
        "Uma abordagem prática para treinar foco profundo e reduzir dispersão — útil para trabalho, estudo e decisões melhores.",
      category: "Foco",
      tags: ["Mindfulness & Meditação", "Discernimento"],
      date: "2026-01-05",
      readMin: 7,
      featured: false,
      image: "../assets/blog/foco.webp",
      href: "./p/foco-centro/index.html",
    },
    {
      id: "discernimento-decisoes",
      title: "Discernimento: decisões boas e repetíveis (sem depender de motivação)",
      excerpt:
        "Discernimento é clareza + consistência. Aqui vai um framework simples para reduzir arrependimento e aumentar previsibilidade.",
      category: "Mentalidade",
      tags: ["Discernimento", "Rotina"],
      date: "2025-12-22",
      readMin: 6,
      featured: false,
      image: "../assets/blog/discernimento.webp",
      href: "./p/discernimento-decisoes/index.html",
    },
    {
      id: "consistencia-ritual",
      title: "Consistência: como criar ritual sem virar prisão",
      excerpt:
        "A diferença entre disciplina rígida e ritual inteligente. Um jeito adulto de manter o prumo mesmo com rotina atribulada.",
      category: "Rotina",
      tags: ["Rotina", "Estabilidade"],
      date: "2025-12-12",
      readMin: 5,
      featured: false,
      image: "../assets/blog/consistencia.webp",
      href: "./p/consistencia-ritual/index.html",
    },
    {
      id: "ritual-manha",
      title: "Ritual de Manhã: 15 minutos para ajustar energia e intenção",
      excerpt:
        "Um roteiro curto para acordar com mais presença: hidratação, respiração e um checklist simples para alinhar o dia.",
      category: "Rotina",
      tags: ["Rotina", "Foco"],
      date: "2025-12-04",
      readMin: 4,
      featured: false,
      image: "../assets/blog/respiracao.webp",
      href: "./p/ritual-manha/index.html",
    },
    {
      id: "sono-performance",
      title: "Sono & Performance: ajustes rápidos para recuperar melhor",
      excerpt:
        "Entenda por que o sono é o eixo da performance e aplique micro-ajustes no ambiente para dormir com mais qualidade.",
      category: "Recuperação",
      tags: ["Recuperação", "Estabilidade"],
      date: "2025-11-28",
      readMin: 5,
      featured: false,
      image: "../assets/blog/recuperacao.webp",
      href: "./p/sono-performance/index.html",
    },
    {
      id: "mobilidade-expressa",
      title: "Mobilidade Expressa: destrave quadris e coluna em 8 minutos",
      excerpt:
        "Sequência curta e objetiva para desbloquear quadris, coluna torácica e melhorar postura sem equipamentos.",
      category: "Mobilidade",
      tags: ["Mobilidade", "Postura"],
      date: "2025-11-20",
      readMin: 6,
      featured: false,
      image: "../assets/blog/mobilidade.webp",
      href: "./p/mobilidade-expressa/index.html",
    },
  ];

  function setYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function createRevealObserver() {
    if (!("IntersectionObserver" in window)) return null;

    return new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
  }

  function revealElement(el, io) {
    if (!el) return;
    if (io) io.observe(el);
    else el.classList.add("in");
  }

  function disablePlaceholderLinks() {
    document.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
      a.addEventListener("click", (e) => e.preventDefault());
    });
  }

  function initDrawer() {
    if (window.Navbar && typeof window.Navbar.openDrawer === "function") return;

    const drawer = document.getElementById("drawer");
    const toggle = document.getElementById("mobileToggle");
    const closeBtn = document.getElementById("drawerClose");

    if (!drawer) return;

    function openDrawer() {
      drawer.classList.add("open");
      drawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeDrawer() {
      drawer.classList.remove("open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (toggle) toggle.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);

    drawer.addEventListener("click", (e) => {
      if (e.target === drawer) closeDrawer();
    });

    drawer.querySelectorAll("[data-close]").forEach((el) => {
      el.addEventListener("click", closeDrawer);
    });
  }

  function initBlog(io) {
    const grid = document.getElementById("grid");
    const empty = document.getElementById("empty");
    const search = document.getElementById("search");
    const category = document.getElementById("category");
    const sort = document.getElementById("sort");
    const tagbar = document.getElementById("tagbar");

    if (!grid || !empty || !search || !category || !sort || !tagbar) return;

    const pageSize = 6;
    let visibleCount = pageSize;
    let state = { q: "", category: "all", tag: "all", sort: "new" };
    let lastFilteredCount = 0;

    function formatDateISO(iso) {
      try {
        const [y, m, d] = iso.split("-").map(Number);
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch (e) {
        return iso;
      }
    }

    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function unique(arr) {
      return Array.from(new Set(arr));
    }

    function buildTaxonomy() {
      const cats = unique(POSTS.map((p) => p.category)).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      );
      const tags = unique(POSTS.flatMap((p) => p.tags)).sort((a, b) =>
        a.localeCompare(b, "pt-BR")
      );

      category.innerHTML = `
        <option value="all">Todas</option>
        ${cats
          .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
          .join("")}
      `;

      const chip = (label, { active = false, alt = false } = {}) => `
        <div class="chip ${active ? "active" : ""} ${alt ? "alt" : ""}" role="button" tabindex="0"
             data-tag="${escapeHtml(label)}" aria-pressed="${String(active)}">
          <span class="dot" aria-hidden="true"></span>
          ${escapeHtml(label)}
        </div>
      `;

      tagbar.innerHTML = [
        chip("Todas", { active: true }),
        ...tags.map((t) =>
          chip(t, {
            alt: t.toLowerCase().includes("flex") || t.toLowerCase().includes("medit"),
          })
        ),
      ].join("");
    }

    function pickFeatured() {
      const featured =
        POSTS.slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .find((p) => p.featured) ||
        POSTS.slice().sort((a, b) => b.date.localeCompare(a.date))[0];

      if (!featured) return;

      const link = document.getElementById("featuredLink");
      const img = document.getElementById("featuredImg");
      const cat = document.getElementById("featuredCat");
      const meta = document.getElementById("featuredMeta");
      const title = document.getElementById("featuredTitle");
      const excerpt = document.getElementById("featuredExcerpt");
      const tagPill = document.getElementById("featuredTagPill");

      if (!link || !img || !cat || !meta || !title || !excerpt || !tagPill) return;

      link.href = featured.href;
      img.src = featured.image || "../assets/blog/featured.webp";
      img.alt = featured.title;

      cat.textContent = featured.category;
      meta.textContent = `${formatDateISO(featured.date)} • ${featured.readMin} min`;
      title.textContent = featured.title;
      excerpt.textContent = featured.excerpt;
      tagPill.textContent = featured.tags?.[0] ? featured.tags[0] : "Leitura";
    }

    function matches(post) {
      const q = state.q.trim().toLowerCase();

      const inText =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.category.toLowerCase().includes(q);

      const inCat = state.category === "all" || post.category === state.category;
      const inTag = state.tag === "all" || post.tags.includes(state.tag);

      return inText && inCat && inTag;
    }

    function sortPosts(list) {
      const out = list.slice();
      if (state.sort === "new") out.sort((a, b) => b.date.localeCompare(a.date));
      else if (state.sort === "old")
        out.sort((a, b) => a.date.localeCompare(b.date));
      else if (state.sort === "read")
        out.sort((a, b) => (a.readMin ?? 99) - (b.readMin ?? 99));
      return out;
    }

    const postsOverlay = document.getElementById("postsOverlay");
    const postsMore = document.getElementById("postsMore");
    const postsCount = document.getElementById("postsCount");
    const postsLessWrap = document.getElementById("postsLessWrap");
    const postsLess = document.getElementById("postsLess");

    function isSearchActive() {
      return state.q.trim().length > 0;
    }

    function resetPagination() {
      visibleCount = pageSize;
    }

    function updatePaginationUI(total, shown) {
      if (!postsOverlay || !postsCount || !postsMore || !postsLessWrap) return;

      const canPaginate = !isSearchActive() && total > pageSize;
      const showOverlay = canPaginate && shown < total;
      const showLess = canPaginate && shown >= total;

      postsOverlay.classList.toggle("is-hidden", !showOverlay);
      postsLessWrap.classList.toggle("is-visible", showLess);

      postsCount.textContent = `${shown} de ${total} posts`;
    }

    function renderPosts() {
      const filtered = sortPosts(POSTS.filter(matches));
      lastFilteredCount = filtered.length;
      const shown = isSearchActive()
        ? filtered
        : filtered.slice(0, Math.min(visibleCount, filtered.length));

      if (filtered.length === 0) {
        grid.innerHTML = "";
        empty.style.display = "block";
        revealElement(empty, io);
        updatePaginationUI(0, 0);
        return;
      }

      empty.style.display = "none";

      grid.innerHTML = shown
        .map((p) => {
          const tagLine = (p.tags || []).slice(0, 2).join(" • ");

          return `
          <article class="post glass reveal" data-id="${escapeHtml(p.id)}">
            <a href="${escapeHtml(p.href)}" aria-label="Abrir post: ${escapeHtml(p.title)}">
              <div class="post-media" aria-hidden="true">
                <img src="${escapeHtml(p.image || "../assets/blog/featured.webp")}" alt="${escapeHtml(p.title)}" loading="lazy" />
              </div>
              <div class="post-body">
                <div class="post-top">
                  <div class="post-cat"><span class="dot" aria-hidden="true"></span>${escapeHtml(
                    p.category
                  )}</div>
                  <div class="post-date">${escapeHtml(formatDateISO(p.date))}</div>
                </div>
                <h3>${escapeHtml(p.title)}</h3>
                <p>${escapeHtml(p.excerpt)}</p>
                <div class="post-bottom">
                  <div class="post-meta">
                    <span>${escapeHtml(p.readMin)} min</span>
                    <span>•</span>
                    <span>${escapeHtml(tagLine || "Leitura objetiva")}</span>
                  </div>
                  <span class="read">Ler →</span>
                </div>
              </div>
            </a>
          </article>
        `;
        })
        .join("");

      grid.querySelectorAll(".reveal").forEach((el) => revealElement(el, io));
      updatePaginationUI(filtered.length, shown.length);
    }

    function setTag(tag) {
      state.tag = tag === "Todas" ? "all" : tag;

      tagbar.querySelectorAll(".chip").forEach((ch) => {
        const t = ch.getAttribute("data-tag");
        const isAll = t === "Todas";
        const isActive =
          (state.tag === "all" && isAll) || (state.tag !== "all" && t === state.tag);
        ch.classList.toggle("active", isActive);
        ch.setAttribute("aria-pressed", String(isActive));
      });

      renderPosts();
    }

    search.addEventListener("input", (e) => {
      state.q = e.target.value || "";
      resetPagination();
      renderPosts();
    });

    category.addEventListener("change", (e) => {
      state.category = e.target.value || "all";
      resetPagination();
      renderPosts();
    });

    sort.addEventListener("change", (e) => {
      state.sort = e.target.value || "new";
      resetPagination();
      renderPosts();
    });

    tagbar.addEventListener("click", (e) => {
      const el = e.target.closest?.(".chip");
      if (!el) return;
      const t = el.getAttribute("data-tag");
      if (!t) return;
      resetPagination();
      setTag(t);
    });

    tagbar.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = e.target.closest?.(".chip");
      if (!el) return;
      e.preventDefault();
      const t = el.getAttribute("data-tag");
      if (!t) return;
      resetPagination();
      setTag(t);
    });

    if (postsMore) {
      postsMore.addEventListener("click", () => {
        visibleCount = Math.min(visibleCount + pageSize, lastFilteredCount);
        renderPosts();
      });
    }

    if (postsLess) {
      postsLess.addEventListener("click", () => {
        resetPagination();
        renderPosts();
      });
    }

    buildTaxonomy();
    pickFeatured();
    renderPosts();
  }

  function init() {
    if (!document.body.classList.contains("blog-page")) return;
    setYear();
    disablePlaceholderLinks();
    initDrawer();

    const io = createRevealObserver();
    document.querySelectorAll(".reveal").forEach((el) => revealElement(el, io));
    initBlog(io);
  }

  if (window.Utils && window.Utils.ready) window.Utils.ready(init);
  else document.addEventListener("DOMContentLoaded", init, { once: true });

  document.addEventListener("softnav:loaded", init);
})();
