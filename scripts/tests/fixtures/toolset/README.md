# Tool Set regression fixtures

`before/` is the Tool Set page and samples from commit `99fdd50`, before the
fix in `2c74862`. The only change is the `api-owner` comments above the two
procedure tables, which the ownership check now requires. These files must
keep failing `docs:check` for the reasons listed in `scripts/tests/api-check.test.mjs`:

- `ToolSet.ToolDefinition(...)`: `ToolDefinition` is declared on `"AIOS Schema"`
- `ToolSet.Add(ToolDefinition(...))`: nested call without an owner
- `Register(...)`: not declared on any SDK object
- `SetHandler(...)`: local to `"AIOS Tool Set"`

`after/` is the corrected page and samples. They must pass.

Fixtures are frozen. Do not update them when the live page changes.
