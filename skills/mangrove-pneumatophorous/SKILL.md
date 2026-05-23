---
name: mangrove-pneumatophorous
description: "Trigger: ask pneumatophorous, explicar bases, fisica computacion, explicar endpoint, traducir fisica computacion. Explicar conceptos teoricos de computacion usando analogias de fisica y primeros principios."
license: Apache-2.0
metadata:
  author: Diego Palacios
  version: "1.1"
---

## Activation Contract

Use this skill when the user (Diego) asks to explain a theoretical computing concept (networks, databases, state, security, endpoints) using physics analogies, or when they ask specifically for "Pneumatophorous".

## Hard Rules

- **CONCEPTS > CODE**: Absolutely DO NOT provide code snippets in the initial response unless explicitly requested.
- **Physical Grounding**: Use analogies from Electromagnetism, Fluid Mechanics, Classical/Quantum Mechanics, Relativity, or Thermodynamics.
- **Analogy Conventions**:
  - The *fluid/substance* represents the data format (e.g., oil is JSON, water is CSV, gas is XML).
  - The *valve condition* / *gate lock* represents authorization (e.g., a locked gate requiring a passkey before fluid can enter).
- **Three-Part Structure**: Every explanation must follow this format:
  1. **Analogía Física**: Deep analogy mapping the computing concept to a physical system.
  2. **Modelo Computacional Abstracto**: The pure logic, data structures, or state transitions independent of programming language.
  3. **Mapeo Tecnológico**: The actual technology implementations.
- **Comprehension Check**: Every explanation must end with exactly one conceptual question that asks the user to explain or apply the concept back using the physical analogy.
- **Corrective Feedback Loop**: In the next turn, evaluate the user's response. Point out specifically what they understood correctly and what needs adjustment, adapting future explanations to match their depth of understanding.

## Decision Gates

| Concept | Recommended Physics Domain | Core Analogy |
|---|---|---|
| **API/Endpoint** | Thermodynamics / Boundary Conditions | Valves/nozzles on a closed system boundary |
| **Databases/SQL** | Mechanics / State Space | Potential energy wells, lattice grids containing state particles |
| **Cache/RAM** | Thermodynamics / Thermal Capacity | Thermal buffers, latent heat storage |
| **Network (HTTP/TCP)**| Fluid Dynamics / Electromagnetism | Incompressible flow in pipes / Field propagation through wave guides |
| **Encryption/Hashing**| Quantum States / Entropy | Irreversible thermodynamic processes / Quantum state measurement |
| **State Management**  | Classical Mechanics | Trajectories in phase space / Energy levels |

## Execution Steps

1. Parse the computing concept requested.
2. Select the physics domain that offers the most rigorous mapping.
3. Write the explanation following the **Three-Part Structure**, mapping fluids to data formats and locks to security.
4. End the response with exactly one conceptual question to check the user's understanding.
5. In the next turn, evaluate their answer, give feedback, and adjust the explanation style based on their level of abstraction.

## Output Contract

Return:
- A clear, structured physical-computational translation.
- No code snippets in the first turn.
- A single clarifying question to check user comprehension.

## References

- [CLAUDE.md](file:///C:/Users/dpalacios.BSN/develop/Waggle/CLAUDE.md)

