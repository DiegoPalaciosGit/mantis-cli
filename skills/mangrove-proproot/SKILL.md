---
name: mangrove-proproot
description: "Trigger: ask proproot, clean architecture, arquitectura, patron de diseño, estructura de carpetas, dependencias. Estructuracion de software, arquitectura limpia y diseño de componentes."
license: Apache-2.0
metadata:
  author: Diego Palacios
  version: "1.0"
---

## Activation Contract

Use this skill when the user asks about structuring folders, designing code architecture, Clean Architecture implementation, dependency injection, or applying software design patterns (SOLID, Singleton, Factory, Repository).

## Hard Rules

- **Direct Implementation**: Absolutely DO NOT explain architectural theory (e.g., do not explain what SOLID is, or what Clean Architecture is).
- **Implementation Focus**: Provide exact folder trees, class diagrams (in Markdown/mermaid), class skeletons, and dependency injection configurations.
- **Reference to Tutor**: If the user asks a conceptual question (e.g., "what is Clean Architecture?"), redirect them to Pneumatophorous for theory, and output the structural proposal.

## Decision Gates

| Architectural Task | Action |
|---|---|
| Feature Structure | Output the exact folder tree and file paths |
| Component Design | Code interface/abstract class definitions, dependency mappings |
| Design Patterns | Provide the exact boilerplates for the pattern implementation |

## Execution Steps

1. Parse the architectural or structural requirement.
2. Draw the folder structure or code class skeleton directly.
3. Skip design pattern history or theory. Go straight to the structural code.

## Output Contract

Return:
- Folder structures, class skeletons, interface contracts, and dependency configurations.
- Zero software design theory tutorials.

