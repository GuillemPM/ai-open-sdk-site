<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Open SDK Site: agent guide

Official site for **AI Open SDK**: provider-agnostic AI for Microsoft Dynamics 365 Business Central (AL).

## Bias

**Documentation quality first.** Prefer clear explanations, skim-friendly structure, and real AL samples. Change `app/`, `components/`, or `lib/` only when content needs site support (layouts, MDX, search, hero).

**Sound human in docs copy.** Do not use em dashes, en dashes, or spaced hyphen asides as clause separators. Prefer commas, periods, parentheses, or colons. See `.cursor/rules/docs-voice.mdc`.

## Pillars

| Route | Role |
|---|---|
| `/` | Product introduction |
| `/docs` | Reference (Fumadocs) |
| `/learn` | Tutorials and release notes |

## Package manager

Use **pnpm** only (`pnpm install`, `pnpm dev`, `pnpm lint`, `pnpm build`).

## Content map

| Path | Purpose |
|---|---|
| `content/docs/` | Reference MDX + `meta.json` nav |
| `content/learn/` | Tutorials / changelog |
| `content/*/samples/` | Colocated `.al` examples |
| `content/al/hero/` | Landing hero AL snippets |
| `source.config.ts` | Fumadocs MDX + AL Shiki lang |

Embed AL with `<include lang="al" meta='title="File.al"'>samples/.../File.al</include>`. Do **not** invent SDK APIs. Mirror existing samples or [GuillemPM/AL-AI-Toolkit](https://github.com/GuillemPM/AL-AI-Toolkit).

## Agent tooling

- Rules: `.cursor/rules/` (docs voice, structure, AL samples, Fumadocs)
- Skills: `write-docs`, `add-doc-page`, `review-docs` under `.cursor/skills/`
- Hooks: shell guardrails + session/content reminders in `.cursor/hooks.json`

Before Next.js / App Router edits, read `node_modules/next/dist/docs/` (see block above).

## Documentation harness

Before editing content, read [docs-harness.md](docs-harness.md). It defines the
consumer audience and the boundary between public SDK behavior and
implementation details.

## Verify

After content changes, run `pnpm docs:check` and `pnpm build`. Run `pnpm lint`
for site-code changes too. A successful build does not replace the consumer
review: ask whether an AL developer can use the page without reading the SDK
source.
