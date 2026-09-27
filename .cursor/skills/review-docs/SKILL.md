---
name: review-docs
description: >-
  Review documentation changes for clarity, skim-ability, AL sample quality,
  nav/meta consistency, and API accuracy. Use when reviewing docs PRs or
  auditing MDX/AL content.
---

# Review docs

Read `docs-harness.md` first. Review from the perspective of an extension
developer who does not know the SDK implementation.

API accuracy has its own pass: run the `review-api` skill (or confirm its
report is attached) before this review. This checklist does not re-verify
signatures.

## Clarity

- [ ] Title and description match the page
- [ ] Opening defines the concept without fluff
- [ ] One job per section; headings skim cleanly
- [ ] Jargon introduced before use
- [ ] Sounds human: no em/en dashes or spaced hyphen asides (`word - word`); prefer commas, periods, parentheses, colons

## Examples

- [ ] Code lives in `.al` files and is embedded via `<include>`
- [ ] `meta` title matches filename
- [ ] Samples are minimal; no secrets or placeholder API keys as plaintext secrets
- [ ] Prose claims match what the sample shows
- [ ] No invented SDK APIs (`pnpm docs:check` passes and the `review-api` report has no blockers)

## Structure

- [ ] Page listed in the correct `meta.json`
- [ ] No orphan `.al` samples (unused) or broken include paths
- [ ] Concepts do not duplicate full API reference; cross-link instead
- [ ] Learn vs docs tree choice is appropriate
- [ ] Folders nested by name (not `"...folder"` extract); `index` not listed in folder `pages`

## Consistency

- [ ] Object names match existing docs (`"AIOS Client"`, `"AIOS Tool Set"`, etc.)
- [ ] Provider pages follow the same shape as existing provider MDX
- [ ] Links to related concepts / API / providers work

## Consumer boundary

- [ ] The page teaches a user task, not an internal code change
- [ ] No local or internal helper names appear in consumer guidance
- [ ] No provider wire fields, serialization details, or maintainer workflow
- [ ] Retry, tool-loop, and provider behavior is described only when it changes
      what the extension developer must do or handle
- [ ] The page can stand on public APIs and linked samples without source-code knowledge

## Report

Summarize findings as: blockers, improvements, nits. Prefer concrete edit suggestions.
