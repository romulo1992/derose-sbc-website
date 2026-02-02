# Root
Este é o diretório raíz do site

# Subpastas
# Site Structure

This repo is organized as a static site with clean, folder-based routes (each page lives in its own folder as `index.html`).

---

## Root

| Parent folder | Direct child folders |
| --- | --- |
| `/` (root) | `aulas/`, `cursos/`, `formacao/`, `eventos/`, `bistro/`, `blog/`, `lp/`, `assets/`, `data/` *(optional)* |

> Note: use `formacao/` (no accent) to avoid URL/encoding issues.

---

## Subfolders

### `/aulas/`

| Parent folder | Direct child folders |
| --- | --- |
| `/aulas/` | `presencial/`, `online/`, `1-1/` |

| Folder | Files |
| --- | --- |
| `/aulas/presencial/` | `index.html` |
| `/aulas/online/` | `index.html` |
| `/aulas/1-1/` | `index.html` |

---

### `/cursos/`

| Parent folder | Direct child folders |
| --- | --- |
| `/cursos/` | `p/` |
| `/cursos/p/` | `<slug>/` |

| Folder | Files |
| --- | --- |
| `/cursos/` | `index.html` |
| `/cursos/p/<slug>/` | `index.html` |

---

### `/formacao/`

| Folder | Files |
| --- | --- |
| `/formacao/` | `index.html` |

---

### `/blog/`

| Fol
