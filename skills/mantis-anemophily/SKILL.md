---
name: mantis-anemophily
description: "Trigger: mantis anemophily, deploy, CD. Execute deployment command based on configuration or auto-detect standard deployments (Vercel, NPM)."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Load this skill when triggering deployment steps, running continuous delivery tasks, or publishing validated code.

## Hard Rules

- Require context parsing first; read `deployCommand` from `.mantis/context.json`.
- If missing, auto-detect: check `package.json` for a `deploy` script (`npm run deploy`), or check for `vercel.json` (`vercel --prod`).
- If no deployment mechanism is resolved, skip execution and log a warning.
- Execute the deploy command and wait for completion.
- Log the deployment result (success or failure) to Obsidian daily notes using Heron.

## Decision Gates

| Detected Config | Action |
|---|---|
| `deployCommand` in context | Execute configured command. |
| `deploy` script in package.json | Fallback to `npm run deploy`. |
| `vercel.json` present | Fallback to `vercel --prod`. |
| None found | Warn and skip. |

## Execution Steps

1. Parse `.mantis/context.json` for `deployCommand`.
2. Perform auto-detection fallback checks.
3. Run the resolved deployment command using shell execution.
4. Call Heron to log deployment event.
5. Exit with success/failure boolean status.

## Output Contract

Return deployment stdout/stderr logs and final deployment status.

## References

- [C:\Users\dpalacios.BSN\develop\mantis-cli\src\agents\anemophily.ts](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/src/agents/anemophily.ts) — main agent implementation.
