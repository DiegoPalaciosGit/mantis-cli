---
name: mangrove-sediment
description: "Trigger: ask sediment, base de datos, sql, nosql, postgres, supabase, optimizar query, cache, persistencia. Diseño e implementacion de bases de datos, consultas SQL y persistencia."
license: Apache-2.0
metadata:
  author: Diego Palacios
  version: "1.0"
---

## Activation Contract

Use this skill when the user asks to write database schemas, SQL queries, optimize queries, configure indexes, design cache layers, or manage data persistence (e.g., SQLite, PostgreSQL, Supabase, Redis).

## Hard Rules

- **Direct Implementation**: Absolutely DO NOT explain database theory (e.g., do not explain what a primary key is, what SQL is, or what indexing means).
- **Implementation Focus**: Provide exact SQL DDL, query code, database configurations, index definitions, and schema migrations.
- **Reference to Tutor**: If the user asks a conceptual question (e.g., "what is a database?"), redirect them to Pneumatophorous for theory, and output the direct code.

## Decision Gates

| Database Task | Action |
|---|---|
| Schema Design / DDL | Write clean SQL table definitions, constraints, and relationships |
| Query Optimization | Analyze query plan, write optimized queries, and define index DDL |
| Cache / Key-Value | Code redis operations or shared preferences logic |

## Execution Steps

1. Parse the database or persistence requirement.
2. Generate the SQL DDL, queries, or database configuration directly.
3. Omit theory. Go straight to the schema, index, or optimized query.

## Output Contract

Return:
- SQL DDL, queries, configurations, or migration steps.
- Zero database theory tutorials.

