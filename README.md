# Mantis CLI — Agentic Software Engineering Orchestrator

Mantis CLI is a local, agent-driven software development loop that orchestrates context scanning, validation testing, self-healing code correction, deployment, and documentation logging.

Featuring custom 8-bit ANSI terminal rendering matching the brand colors from `cli.png` and deep context awareness, Mantis acts as the quality gate keeper for your local workspace.

---

## Ecosistema de Agentes y Comandos

Mantis se compone de varios agentes especializados que cooperan de forma automática:

* **Propagule (`propagule`)**: Agente escáner. Analiza recursivamente el proyecto actual para detectar lenguajes, frameworks activos, convenciones de commits de Git y la suite de pruebas configurada. Inicializa y guarda la configuración en `.mantis/context.json`.
* **Tide (`tide`)**: Agente verificador de código (Adversarial Reviewer). Ejecuta dinámicamente comandos de linter y pruebas unitarias basadas en el contexto del proyecto y captura las trazas completas de error.
* **Review (`review`)**: El bucle de auto-corrección autónomo (**Mantis Harness**). Ejecuta Propagule y Tide; si se detectan errores, lee el contexto de los archivos rotos, consulta al LLM (`gemini-2.5-flash`), presenta la propuesta de corrección en la terminal, la aplica tras tu aprobación y vuelve a correr Tide para verificar.
* **Anemophily (`anemophily`)**: Agente de despliegue (CD). Resuelve de manera automática comandos de despliegue (ej. scripts de NPM o Vercel) y los corre tras pasar los controles de calidad.
* **Heron (`heron`)**: Agente documentador. Sincroniza y registra de forma automatizada cada actividad, error corregido o despliegue exitoso directamente en las notas diarias (`Daily/YYYY-MM-DD.md`) de tu bóveda de Obsidian.

### Comandos de la REPL
Ejecutando `mantis` sin argumentos entras a la REPL interactiva, la cual soporta:
* `propagule` — Inicia el escaneo.
* `tide` — Corre verificaciones.
* `review` — Inicia el flujo auto-corrector.
* `anemophily` — Despliega la rama.
* `model <gemini|claude|opus> [model_name]` — Cambia dinámicamente el proveedor de LLM y el modelo (ej. `model gemini gemini-3.5-flash`).
* `ask <query>` — Realiza consultas con contexto inyectado automáticamente (incluye el contexto del proyecto de `.mantis/context.json` y la bitácora más reciente de Obsidian).
* `exit` / `quit` — Salir de la terminal.

---

## Configuración y Variables de Entorno

Mantis busca el archivo `.env` de manera jerárquica para permitir configuraciones locales y globales:
1. Directorio de trabajo local (`process.cwd()/.env`) para claves específicas del proyecto.
2. Directorio global del usuario (`~/.mantis/.env`).
3. Directorio de instalación del paquete.

Debe contener:
```env
GEMINI_API_KEY=tu_clave_gemini
ANTHROPIC_API_KEY=tu_clave_anthropic
OBSIDIAN_VAULT_PATH=C:\Ruta\A\Tu\SecondBrain
```

---

## Mangrove Developer Skills

Este repositorio incluye las habilidades fundamentales de desarrollo de **Mangrove** bajo la carpeta `skills/`. Estas especificaciones guían a los agentes inteligentes en la toma de decisiones técnicas de alto nivel durante el flujo de trabajo de Mantis:

1. **[mangrove-hypoxia](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-hypoxia/SKILL.md) (Estrategia y Auditoría)**: Guía de consultoría de negocio en *Mist Mode* o *Harsh Mode* para evaluar propuestas de valor, ventas y modelos comerciales.
2. **[mangrove-pneumatophorous](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-pneumatophorous/SKILL.md) (Conceptos Teóricos)**: Explicación de conceptos de computación teórica y endpoints utilizando analogías físicas e intuitivas de primeros principios.
3. **[mangrove-proproot](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-proproot/SKILL.md) (Arquitectura y Diseño)**: Lineamientos estrictos de Clean Architecture, inyección de dependencias, diseño de carpetas, patrones de diseño de software y acoplamiento de componentes.
4. **[mangrove-sediment](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-sediment/SKILL.md) (Persistencia y SQL)**: Reglas de optimización de bases de datos relacionales y no relacionales, diseño de consultas SQL complejas, caches y estrategias de persistencia.
5. **[mangrove-suberin](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-suberin/SKILL.md) (Ciberseguridad)**: Auditorías de seguridad de código en *Root Mode* o *Salt Mode* para buscar vulnerabilidades, inyecciones e implementar parches defensivos.
6. **[mangrove-tannin](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-tannin/SKILL.md) (Criptografía)**: Algoritmos de cifrado, hashing (SHA-256), firmas digitales y manejo seguro de llaves criptográficas.
7. **[mangrove-xylem](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-xylem/SKILL.md) (APIs y Redes)**: Diseño de protocolos de comunicación, APIs REST, WebSockets, optimización de red y conectividad backend-frontend.
