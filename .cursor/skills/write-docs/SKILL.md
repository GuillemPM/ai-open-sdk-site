---
name: write-docs
description: >-
  Draft or edit professional MDX documentation for AI Open SDK (content/docs or
  content/learn). Use when writing docs, improving explanations, tightening
  structure, or pairing prose with AL samples.
---

# Write docs

Audience: Business Central AL developers adopting AI Open SDK.

Write for an extension developer consuming the published apps. Do not write a
maintainer changelog disguised as a guide. Public docs may explain observable
behavior, but should omit local or internal helpers, provider wire fields,
serialization, implementation history, and repository governance. Read
`docs-harness.md` before starting.

## Checklist

1. **Promise.** Frontmatter `description` states one outcome.
2. **Lead.** Opening paragraph defines the concept in 1-3 sentences.
3. **Teach then show.** Short explanation, then `<include>` sample, then edge cases.
4. **Decisions as tables.** Patterns, outcomes, prerequisites.
5. **Samples.** Real `.al` under colocated `samples/`; never invent APIs.
6. **Cross-links.** Related concepts, API pages, providers.
7. **Skim test.** Headings alone outline the page; no fluff or emojis.
8. **Human punctuation.** No em dashes, en dashes, or spaced hyphen asides. Prefer commas, periods, parentheses, or colons. See `docs-voice.mdc`.
9. **Consumer boundary.** If a detail does not help an extension developer
   install, call, configure, test, or handle the SDK, remove it or link to the
   appropriate maintainer documentation.

## Include pattern

```mdx
<include lang="al" meta='title="Example.al"'>samples/topic/Example.al</include>
```

## Quality bar

Match the tone of `content/docs/concepts/tools.mdx`: precise objects, clear steps, outcome tables, minimal samples. Write like a human docs engineer, not like a model filling a template.
