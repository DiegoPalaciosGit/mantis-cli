---
name: mantis-heron
description: "Trigger: mantis heron, log event, sync obsidian. Log mantis activities to the user's Obsidian daily note under Daily/YYYY-MM-DD.md."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill when logging execution outcomes, tracking agent activity history, or syncing CLI events to Obsidian.

## Hard Rules

- Read `OBSIDIAN_VAULT_PATH` from environment variables. If not set, log warning and exit silently without throwing errors.
- Resolve the daily note filename using local system time: `Daily/YYYY-MM-DD.md`.
- Ensure the `Daily/` directory exists inside the vault.
- If the daily note does not exist, create it with a standard markdown header: `# YYYY-MM-DD Daily Note` followed by `## Mantis Activities`.
- Append each event line with a timestamp format: `- **[HH:MM:SS] Mantis {eventType}**: {detail}`.

## Decision Gates

| Obsidian Vault Path | Action |
|---|---|
| Empty/Null | Skip sync; print subtle console info log. |
| Valid Path | Resolve path, check directory structure, append markdown entry. |

## Execution Steps

1. Check for `OBSIDIAN_VAULT_PATH` in environment variables.
2. Build daily note path using current date.
3. If note is missing, write initial template.
4. Append formatted timestamped log line.
5. Print confirmation log: `[Heron] Synced event to Obsidian.`

## Output Contract

Confirm whether event log was successfully synced to Obsidian or skipped.

## References

- [C:\Users\dpalacios.BSN\develop\mantis-cli\src\agents\heron.ts](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/src/agents/heron.ts) — main agent implementation.
