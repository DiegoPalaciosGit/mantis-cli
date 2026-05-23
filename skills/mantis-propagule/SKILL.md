---
name: mantis-propagule
description: "Trigger: mantis propagule, scan project, detect context, initialize mantis. Detect project language, frameworks, test runner, and git convention, saving them under .mantis/context.json."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill when the user requests to scan the codebase, initialize Mantis, or detect project context.

## Hard Rules

- Always execute context detection recursively up to depth 2.
- Look for standard marker files: `go.mod` (Go), `package.json` (JS/TS), `requirements.txt`/`pyproject.toml` (Python), `pubspec.yaml` (Dart/Flutter), `Cargo.toml` (Rust).
- Resolve linter and test runner configurations based on the detected language and packages.
- Check recent Git logs (at least 10 commits) to determine if Conventional Commits are used.
- Save the result in the target directory at `.mantis/context.json`.

## Decision Gates

| Detected File | Language/Framework Result | Default Test Command |
|---|---|---|
| `pubspec.yaml` with `flutter:` | Flutter | `flutter test` |
| `go.mod` | Go | `go test ./...` |
| `Cargo.toml` | Rust | `cargo test` |
| `package.json` | JS/TS (check tsconfig) | `npm test` (or package script fallback) |
| `requirements.txt` | Python | `pytest` |

## Execution Steps

1. Traverse the current working directory to identify project markers.
2. Parse package dependencies to identify specific frameworks (e.g. Nest.js, Bubbletea, FastAPI).
3. Query git log for commit patterns to classify convention.
4. Create the `.mantis/` directory if it does not exist.
5. Write the detected configuration to `.mantis/context.json`.

## Output Contract

Return a summary of detected languages, frameworks, resolved test command, git convention, and confirm configuration write.

## References

- [C:\Users\dpalacios.BSN\develop\mantis-cli\src\agents\propagule.ts](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/src/agents/propagule.ts) — main agent implementation.
