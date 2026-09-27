# Feature audit checklist

Run this audit before you document a new SDK feature, and again when you review
a page that changes an API claim. It takes a few minutes and catches the
mistakes `docs:check` cannot: a page that repeats what another page already
says, a claim about behavior that no test proves, or an old name left in prose.

Copy the checklist into your PR description or review notes and fill it in.

## 1. Pin

- [ ] `docs/sdk-source.json` names the SDK commit you are documenting. If the
      feature is newer than the pin, move the pin first (see
      [docs-harness.md](../docs-harness.md#sdk-source-pin)) and commit the
      regenerated `docs/public-api.json` with the page.
- [ ] `pnpm docs:api-sync --fetch` (or `--sdk <checkout>`) reports that the
      manifest matches the pin.

## 2. Existing docs and samples

- [ ] Search the docs for the feature and for each object it touches:
      `rg -n "<Feature>|<Object>|<Procedure>" content/`
- [ ] List the pages and samples that already mention it. Extend the page that
      owns the topic instead of adding a second explanation.
- [ ] Reuse an existing sample when it already shows the call. Add a new
      sample only for a new idea.

## 3. Public declaration and visibility

For every procedure, event, enum value, and object the page will name:

- [ ] `pnpm docs:api-review --name <Name>` shows it as `public` on the object
      the page will say owns it.
- [ ] The owning object is public, and its app is one the reader installs
      (Core, Provider Utils, or a provider app). Objects from the Examples app
      are demo code, not API.
- [ ] Each overload you document exists with that number of parameters.
      AL has no optional parameters, so a missing argument is a different
      overload or a mistake.
- [ ] Events are named as events and shown as subscribers, never as calls.
      Subscriber parameter names and `var` match the publisher.
- [ ] A local, internal, or protected procedure does not appear, even when it
      has a useful name. The check reports these as not public.

## 4. Source and test anchors

Every non-trivial behavior claim (errors, defaults, limits, ordering, retries)
needs an anchor at the pinned commit:

- [ ] The declaration link from `pnpm docs:api-review` for the API itself.
- [ ] A test in `apps/AIOpenSDK.Test` that proves the behavior, or the source
      lines that implement it when no test exists. Record the file and line in
      the PR or review notes, not on the page.
- [ ] If no source or test supports a claim, remove the claim or ask the SDK
      maintainer. Do not infer behavior from a changelog, a provider payload,
      or a private helper.

## 5. Stale names

- [ ] For each name the change removes or renames, run
      `pnpm docs:api-review --name <OldName>`. The "Used in docs and samples"
      list must be empty, or every remaining use must be intentional.
- [ ] Scan prose for verbs that echo an old API name (for example "registers"
      after `Register` was removed). Use the current procedure's verb.
- [ ] Check the hero snippets under `content/al/hero/` and the landing copy if
      the feature appears there.

## 6. Validate

- [ ] Procedure, method, and overload tables have an
      `{/* api-owner: "AIOS X" */}` comment above them.
- [ ] `pnpm docs:check` passes. It runs the ownership check and its
      regression tests.
- [ ] `pnpm docs:api-review` has no problems, and each entry under "Not
      attributed to an owner" was confirmed or qualified.
- [ ] An API reviewer ran the protocol in
      [`.cursor/skills/review-api/SKILL.md`](../.cursor/skills/review-api/SKILL.md).
- [ ] `pnpm build` passes.
