---
name: add-doc-page
description: >-
  Scaffold a new docs or learn page: MDX, meta.json nav entry, colocated AL
  samples, and include wiring. Use when adding a new documentation page.
---

# Add a doc page

## 1. Choose the tree

| Goal | Path |
|---|---|
| Concept / how-it-works | `content/docs/concepts/` |
| Provider guide | `content/docs/providers/` |
| API reference | `content/docs/api/` |
| Tutorial / narrative | `content/learn/` |

## 2. Create MDX

- File: `<slug>.mdx` with `title` and `description` frontmatter
- Structure: lead → sample → details / tables → related links
- Follow `.cursor/rules/docs-voice.mdc` and `docs-structure.mdc`

## 3. Register navigation

Add the slug to the nearest `meta.json` `pages` array (order matters).

Nest folders by name (`"concepts"`), never extract with `"...concepts"`. Do not list `"index"` in a folder's `pages` (index is the folder page). Folder title and `index.mdx` title should match the category name.

## 4. Add AL samples

- Create `samples/<slug-or-topic>/File.al`
- Wire with:

```mdx
<include lang="al" meta='title="File.al"'>samples/<topic>/File.al</include>
```

## 5. Verify

- Confirm nav renders under `/docs` or `/learn`
- Run `pnpm build` if structure or site wiring changed
- Scan new MDX for human punctuation (see `docs-voice.mdc`). No em dashes or spaced hyphen asides.
