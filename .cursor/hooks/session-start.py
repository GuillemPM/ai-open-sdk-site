#!/usr/bin/env python3
"""sessionStart: inject docs-first orientation context."""

from __future__ import annotations

import json
import sys


CONTEXT = """AI Open SDK site (docs-first). Content: content/docs, content/learn, colocated samples/*.al via <include>. Skills: write-docs, add-doc-page, review-docs. Write skim-friendly docs that sound human (no em dashes or spaced hyphen asides). Do not invent AL APIs. Use pnpm."""


def main() -> None:
    try:
        json.load(sys.stdin)
    except json.JSONDecodeError:
        pass

    print(json.dumps({"additional_context": CONTEXT}))


if __name__ == "__main__":
    main()
