#!/usr/bin/env python3
"""Remind agents about include + meta.json after content edits.

Used by postToolUse (Write) and afterFileEdit. postToolUse injects
additional_context; afterFileEdit may ignore unknown fields but still runs.
"""

from __future__ import annotations

import json
import sys


def resolve_path(data: dict) -> str:
    tool_input = data.get("tool_input") or {}
    if isinstance(tool_input, str):
        try:
            tool_input = json.loads(tool_input)
        except json.JSONDecodeError:
            tool_input = {}
    if not isinstance(tool_input, dict):
        tool_input = {}

    path = (
        data.get("file_path")
        or tool_input.get("path")
        or tool_input.get("file_path")
        or ""
    )
    return str(path).replace("\\", "/")


def is_content_path(path: str) -> bool:
    return "/content/" in path or path.startswith("content/")


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("{}")
        return

    path = resolve_path(data)
    if not path or not is_content_path(path):
        print("{}")
        return

    print(
        json.dumps(
            {
                "additional_context": (
                    "Content edit under content/: keep the consumer audience from "
                    "docs-harness.md; keep AL in colocated .al files and embed with "
                    "<include>; update the nearest meta.json when adding or renaming "
                    "pages; run pnpm docs:check."
                )
            }
        )
    )


if __name__ == "__main__":
    main()
