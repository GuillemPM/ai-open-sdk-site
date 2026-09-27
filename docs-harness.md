# AI Open SDK documentation harness

This repository documents AI Open SDK for Business Central AL developers who are
building extensions that consume the SDK.

## Reader test

A reader should be able to answer these questions from the documentation:

1. Which apps and provider dependencies does my extension need?
2. How do I create a model and call `AIOS Client`?
3. How do I request structured output or let a model call an AL tool?
4. How do I test the integration without a provider key?
5. What result or error should my extension handle?

If a paragraph does not help the reader make or debug one of those decisions, it
probably belongs in the SDK repository, a changelog, or nowhere.

## Public documentation boundary

Document the contract an extension developer can use:

- public codeunits, interfaces, procedures, events, request options, and result accessors
- provider setup, dependency declarations, credentials, and supported capabilities
- observable behavior, errors, warnings, limits, and test behavior
- small AL examples that can be copied into an extension

Do not document implementation details as normal usage guidance:

- local or internal procedures and test-only helpers
- provider wire fields, request serialization, or transport replay
- HTTP status classification and retry implementation details
- maintainer workflow, contribution rules, governance, or unfinished roadmap items
- internal commit history or explanations of how a bug was fixed

The custom-provider page is the one exception. It may describe the public
provider interfaces needed to implement a provider, but it should still hide
the internals of the built-in providers.

## Source of truth

The docs describe one exact revision of
[AL-AI-Toolkit](https://github.com/GuillemPM/AL-AI-Toolkit), recorded in
`docs/sdk-source.json`. Verify API names against that revision, not against
`main`, a changelog, a provider's JSON payload, or a private helper.

Every non-trivial API claim should have one of these anchors:

- a colocated `.al` sample
- a linked API reference page
- a public SDK source declaration or test at the pinned commit

### SDK source pin

`docs/sdk-source.json` records the repository, the commit, and the apps that
make up the public API. `docs/public-api.json` is generated from that commit:
every object, procedure, event, enum value, and table field with its access
level and a source line. Do not edit the manifest by hand.

Before you write or review an API claim, confirm the pin:

```bash
pnpm docs:api-sync --fetch            # clones the pinned commit into .cache/ and verifies
pnpm docs:api-sync --sdk ../AL-AI-Toolkit   # or verify against your checkout at the pinned commit
```

To document a newer SDK, check out the new commit and run
`pnpm docs:api-sync --sdk <checkout> --pin`. It moves the pin, regenerates the
manifest, and prints the API drift. Review every page that mentions a changed
object, then commit the pin, the manifest, and the page changes together.

Limits of the sync:

- It needs a local checkout or network access to GitHub. `docs:check` and the
  build do not; they trust the committed manifest and only confirm that it was
  generated from the pinned commit.
- Nothing moves the pin automatically. The docs can fall behind the SDK until
  someone runs `--pin`, which is intentional: a page is only as current as the
  revision it was checked against.
- The manifest is read from AL source with a small parser, not the AL
  compiler. It understands object headers, access modifiers, procedure and
  event signatures, enum values, and table fields. It does not resolve
  namespaces, extensions, or `internalsVisibleTo`.
- The Test app is excluded: consumers do not install it. The Examples app is
  included so pages can name demo objects, but it is not API.

### Public API ownership check

`pnpm docs:check` resolves every SDK reference in MDX pages, colocated
samples, and hero snippets against the manifest. It fails when:

- an `"AIOS ..."` object does not exist, is internal, or is used as the wrong
  object type (for example `Codeunit "AIOS Chat Request"`)
- `Owner.Member(...)` names a member the owner does not declare, and it says
  which object does (`ToolSet.ToolDefinition` points to `"AIOS Schema"`)
- the member is local, internal, or protected
- no overload takes that number of arguments
- an enum value, event subscriber, or subscriber parameter does not match
- a codeunit implementing an SDK interface is missing an interface method
- a bare SDK call is nested in another call (`ToolSet.Add(ToolDefinition(...))`)
- a procedure, method, or overload table has no owner

Sample fragments often use variables without declaring them. The conventional
names (`Client`, `Request`, `ToolSet`, `Schema`, ...) map to objects in
`apiAliases` in `docs/docs-policy.json`. A declaration in the sample wins.

Bare names in prose (`Add(Tool)`) have no owner of their own. Put an owner
comment above a procedure table or list, and the check resolves the bare names
in its first column, and bare calls in prose, against that object until the
next heading:

```mdx
{/* api-owner: "AIOS Tool Set" */}

| Procedure | Behavior |
|---|---|
| `Add(Tool)` | ... |
```

A quoted object earlier on the same prose line takes precedence. Bare calls
with no owner in scope are not checked; `pnpm docs:api-review` lists them for
the reviewer.

`apiExceptions` in `docs/docs-policy.json` lists known references to objects
that are not in the SDK (today only the landing hero). They print as warnings.
Do not add exceptions for reference pages.

## Writing workflow

1. Run the [feature audit](docs/feature-audit.md): search existing pages and
   samples, confirm each API is public on the object you name, find source or
   test anchors, and scan for stale names.
2. Start with the reader's task and write a one-sentence page promise.
3. Put the happy path first, with a minimal colocated AL sample.
4. Explain only the options the reader needs to choose.
5. Move limits and failure behavior after the working example.
6. Link to related concepts instead of duplicating deep reference material.
7. Run `pnpm docs:check`, `pnpm docs:api-review`, and `pnpm build`.
8. Ask for an API review with the `review-api` skill whenever the change adds
   or edits an API claim, then a docs review with `review-docs`.
9. Review the page without source-code knowledge. If it reads like an SDK
   maintainer's changelog, rewrite it.

## Required validation

| Command | What it proves |
|---|---|
| `pnpm docs:check` | Frontmatter, includes, sample ownership, navigation, human punctuation, forbidden implementation terms, public API ownership against the pinned manifest, and the regression tests in `scripts/tests/` |
| `pnpm docs:api-review` | Report for the changed pages: every reference with its signature and source anchor, problems, and calls without an owner |
| `pnpm docs:api-sync --fetch` | The committed manifest matches the pinned SDK commit |
| `pnpm build` | The site renders |

The checks are guardrails, not a substitute for the consumer review above.
They do not compile AL: a sample can pass and still fail to build, for example
through a type mismatch or a missing variable.
