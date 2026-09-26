#!/usr/bin/env python3
"""sessionStart: inject docs-first orientation context."""

from __future__ import annotations

import json
import sys


CONTEXT = """AI Open SDK site (docs-first). Read docs-harness.md before editing. The audience is Business Central AL developers consuming the published SDK apps, not SDK maintainers. Content: content/docs, content/learn, colocated samples/*.al via <include>. Skills: write-docs, add-doc-page, review-docs. Write skim-friendly docs that sound human (no em dashes or spaced hyphen asides). Do not expose implementation details or invent AL APIs. Run pnpm docs:check and pnpm build."""


def main() -> None:
    try:
        json.load(sys.stdin)
    except json.JSONDecodeError:
        pass

    print(json.dumps({"additional_context": CONTEXT}))


if __name__ == "__main__":
    main()
