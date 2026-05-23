---
name: mantis-harness
description: "Trigger: mantis review, mantis harness, code review loop, run project verification. Orchestrate context scanning, linter and test validation, and activity logging without autonomous LLM corrections."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill to orchestrate the complete code quality review and verification cycle using Mantis.

## Hard Rules

- Run `propagule` to ensure `.mantis/context.json` is initialized and matches the workspace.
- Run `tide` to execute the validation suites (tests and linters).
- If validation succeeds:
  - Log successful event to Obsidian via `heron` (if configured) with details of passed validations.
  - Complete execution with code 0.
- If validation fails:
  - Intercept the error log from `tide` execution.
  - Print the detailed error traces to the console.
  - Log the failure event to Obsidian via `heron` (if configured) indicating which validations failed.
  - Exit immediately with code 1. Do NOT invoke any LLM or attempt autonomous code correction.

## Decision Gates

| Tide Validation Status | Action |
|---|---|
| Success | Log success to Obsidian, exit 0. |
| Failure | Log failure to Obsidian, exit 1. |

## Execution Steps

1. Execute context scan (`propagule`).
2. Run validation check (`tide`).
3. If check fails, output error traces and abort with exit code 1.
4. If check passes, run `heron` to log success to Obsidian daily notes and exit 0.

## Output Contract

Return summary of verification (PASSED/FAILED), test and lint outputs, and Obsidian log synchronization status.

## References

- [C:\Users\dpalacios.BSN\develop\mantis-cli\src\index.ts](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/src/index.ts) — entrypoint containing REPL and subcommand registration.
