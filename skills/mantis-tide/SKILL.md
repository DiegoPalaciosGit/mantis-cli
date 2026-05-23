---
name: mantis-tide
description: "Trigger: mantis tide, verify code, validate project, run tests, run linter. Run linter and tests based on resolved project context in .mantis/context.json."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill when validating code quality, running tests, checking linter output, or executing verifying loops.

## Hard Rules

- Always check if `.mantis/context.json` exists in the target directory first; if missing, fail immediately and prompt user to run `propagule`.
- Resolve the test command and linter command from the context file.
- If no linter command is set in the context, auto-resolve language-specific fallbacks (e.g. `eslint` for JS/TS, `go vet` for Go, `clippy` for Rust, `flake8`/`black` for Python).
- Execute commands using a secure shell execution mechanism, routing logs to stdout.
- If any validation step fails, capture the exact exit code and error logs for debugging.

## Decision Gates

| Linter/Test Status | Action |
|---|---|
| Linter fails, tests pass | Mark validation failed; capture linter output. |
| Linter passes, tests fail | Mark validation failed; capture test failure trace. |
| Both pass | Validation passes successfully. |

## Execution Steps

1. Read and parse `.mantis/context.json`.
2. Run the resolved linter command. Record output.
3. Run the resolved test command. Record output.
4. Log outcome results (success/failure) using Heron to Obsidian.
5. Exit with corresponding code 0 (pass) or 1 (fail).

## Output Contract

Return step-by-step stdout, final status (PASSED/FAILED), and logs of errors if any step failed.

## References

- [C:\Users\dpalacios.BSN\develop\mantis-cli\src\agents\tide.ts](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/src/agents/tide.ts) — main agent implementation.
