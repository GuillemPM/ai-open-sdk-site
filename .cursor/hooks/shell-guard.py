#!/usr/bin/env python3
"""beforeShellExecution: deny destructive / credential-leaky shell commands."""

from __future__ import annotations

import json
import re
import sys


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print(json.dumps({"permission": "allow"}))
        return

    command = data.get("command") or ""
    lowered = command.lower()

    deny_patterns = [
        (r"\brm\s+(-[^\s]*\s+)*-r[^\s]*\s+/", "Recursive delete of a filesystem root path is blocked."),
        (r"\brm\s+(-[^\s]*\s+)*-rf?\s+/(?!\S)", "Recursive delete of / is blocked."),
        (r"\bgit\s+push\s+[^\n]*--force\b", "Force push is blocked."),
        (r"\bgit\s+push\s+[^\n]*\s-f\b", "Force push is blocked."),
        (r"\bgit\s+reset\s+[^\n]*--hard\b", "Hard reset is blocked."),
        (r">\s*\.env(\.|$|\s)", "Redirecting output into .env files is blocked."),
        (r"\btee\s+[^\n]*\.env\b", "Writing .env files via tee is blocked."),
    ]

    for pattern, message in deny_patterns:
        if re.search(pattern, command, re.IGNORECASE):
            print(
                json.dumps(
                    {
                        "permission": "deny",
                        "user_message": message,
                        "agent_message": message
                        + " Use a safer alternative or ask the user to run it manually.",
                    }
                )
            )
            return

    ask_patterns = [
        (r"\b(curl|wget|nc|ncat|netcat)\b", "Network command. Confirm before continuing."),
        (r"\bchmod\s+[^\n]*777\b", "World-writable chmod. Confirm before continuing."),
        (
            r"(api[_-]?key|secret|token|password|authorization:\s*bearer)",
            "Command may embed secrets. Confirm before continuing.",
        ),
    ]

    for pattern, message in ask_patterns:
        if re.search(pattern, lowered):
            print(
                json.dumps(
                    {
                        "permission": "ask",
                        "user_message": message,
                        "agent_message": message,
                    }
                )
            )
            return

    print(json.dumps({"permission": "allow"}))


if __name__ == "__main__":
    main()
