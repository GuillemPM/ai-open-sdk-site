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

Use the public source and examples in
[AL-AI-Toolkit](https://github.com/GuillemPM/AL-AI-Toolkit) to verify API names.
When a local SDK checkout is available, inspect it before writing. Do not infer
an API from a changelog, a provider's JSON payload, or a private helper.

Every non-trivial API claim should have one of these anchors:

- a colocated `.al` sample
- a linked API reference page
- a public SDK source declaration or test that verifies the behavior

## Writing workflow

1. Start with the reader's task and write a one-sentence page promise.
2. Put the happy path first, with a minimal colocated AL sample.
3. Explain only the options the reader needs to choose.
4. Move limits and failure behavior after the working example.
5. Link to related concepts instead of duplicating deep reference material.
6. Run `pnpm docs:check` and `pnpm build`.
7. Review the page without source-code knowledge. If it reads like an SDK
   maintainer's changelog, rewrite it.

## Required validation

`pnpm docs:check` verifies frontmatter, includes, sample ownership, navigation,
human punctuation, and a small set of implementation-detail terms that do not
belong in consumer docs. The check is a guardrail, not a substitute for the
consumer review above.
