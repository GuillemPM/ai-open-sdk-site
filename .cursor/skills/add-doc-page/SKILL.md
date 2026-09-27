---
name: add-doc-page
description: >-
  Scaffold a new docs or learn page: MDX, meta.json nav entry, colocated AL
  samples, and include wiring. Use when adding a new documentation page.
---

# Add a doc page

## 0. Audit the feature

Run the checklist in `docs/feature-audit.md`: search existing pages and
samples, and confirm with `pnpm docs:api-review --name <Name>` that each API
is public on the object you will name.

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
- Put `{/* api-owner: "AIOS X" */}` above any procedure, method, or overload table
- Run `pnpm docs:check` and `pnpm docs:api-review`, then ask for a `review-api` pass
- Run `pnpm build`
- Scan new MDX for human punctuation (see `docs-voice.mdc`). No em dashes or spaced hyphen asides.
