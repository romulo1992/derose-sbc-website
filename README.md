# Site Structure

This repo is organized as a static site with clean, folder-based routes (each page lives in its own folder as `index.html`).

> Note: prefer `formacao/` (no accent) to avoid URL/encoding issues.

---

## Root

| Parent folder | Direct child folders |
| --- | --- |
| `/` (root) | `aulas/`, `cursos/`, `formacao/`, `eventos/`, `bistro/`, `blog/`, `lp/`, `assets/`, `data/` (optional) |

---

## Aulas

| Parent folder | Direct child folders |
| --- | --- |
| `/aulas/` | `presencial/`, `online/`, `1-1/` |

| Folder | Files |
| --- | --- |
| `/aulas/presencial/` | `index.html` |
| `/aulas/online/` | `index.html` |
| `/aulas/1-1/` | `index.html` |

---

## Cursos

| Parent folder | Direct child folders |
| --- | --- |
| `/cursos/` | `p/` |
| `/cursos/p/` | `<slug>/` |

| Folder | Files |
| --- | --- |
| `/cursos/` | `index.html` |
| `/cursos/p/<slug>/` | `index.html` |

---

## Formação

| Folder | Files |
| --- | --- |
| `/formacao/` | `index.html` |

---

## Blog

| Folder | Files |
| --- | --- |
| `/blog/` | `index.html` |
| `/blog/p/<slug>/` | `index.html` |

---

## Eventos

| Parent folder | Direct child folders |
| --- | --- |
| `/eventos/` | `p/` |
| `/eventos/p/` | `<slug>/` |

| Folder | Files |
| --- | --- |
| `/eventos/` | `index.html` |
| `/eventos/p/<slug>/` | `index.html` |

---

## Bistrô

| Parent folder | Direct child folders |
| --- | --- |
| `/bistro/` | `p/` |
| `/bistro/p/` | `<slug>/` |

| Folder | Files |
| --- | --- |
| `/bistro/` | `index.html` |
| `/bistro/p/<slug>/` | `index.html` |

---

## LP

| Parent folder | Direct child folders |
| --- | --- |
| `/lp/` | `p/` |
| `/lp/p/` | `<slug>/` |

| Folder | Files |
| --- | --- |
| `/lp/` | `index.html` (optional) |
| `/lp/p/<slug>/` | `index.html` |

---

## Assets

| Parent folder | Direct child folders |
| --- | --- |
| `/assets/` | `fonts/`, `img/`, `blog/`, `cursos/`, `eventos/`, `bistro/`, `css/` (optional), `js/` (optional) |

| Folder | Content |
| --- | --- |
| `/assets/fonts/` | Spartan-Black.ttf; Spartan-Bold.ttf; Spartan-ExtraBold.ttf; Spartan-ExtraLight.ttf; Spartan-Light.ttf; Spartan-Medium.ttf; Spartan-Regular.ttf; Spartan-SemiBold.ttf; Spartan-Thin.ttf |
| `/assets/img/` | favicon.svg; hero.png |
| `/assets/blog/` | featured.webp |
| `/assets/cursos/` | featured.webp |
| `/assets/eventos/` | featured.webp |
| `/assets/bistro/` | Bistro images (items, ambience, etc.) |
| `/assets/css/` (optional) | Shared CSS (if you want to move CSS out of HTML files) |
| `/assets/js/` (optional) | Shared scripts (navbar, theme, helpers, etc.) |

---

## Data

| Folder | Files |
| --- | --- |
| `/data/` | `blog.json`, `cursos.json`, `eventos.json`, `bistro.json` |
