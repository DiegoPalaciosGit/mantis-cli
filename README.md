# Mantis CLI — Agentic Software Engineering Orchestrator

Mantis CLI is a local, agent-driven software development loop that orchestrates context scanning, validation testing, self-healing code correction, deployment, and documentation logging.

---

## Ecosistema de Agentes y Comandos

Mantis se compone de varios agentes especializados que cooperan de forma automática:

* **Propagule (`propagule`)**: Agente escáner. Analiza recursivamente el proyecto actual para detectar lenguajes, frameworks activos, convenciones de commits de Git y la suite de pruebas configurada. Inicializa y guarda la configuración en `.mantis/context.json`.
* **Tide (`tide`)**: Agente verificador de código (Adversarial Reviewer). Ejecuta dinámicamente comandos de linter y pruebas unitarias basadas en el contexto del proyecto y captura las trazas completas de error.
* **Anemophily (`anemophily`)**: Agente de despliegue (CD). Resuelve de manera automática comandos de despliegue (ej. scripts de NPM o Vercel) y los corre tras pasar los controles de calidad.
* **Heron (`heron`)**: Agente documentador. Sincroniza y registra de forma automatizada cada actividad o despliegue exitoso directamente en las notas diarias (`Daily/YYYY-MM-DD.md`) de tu bóveda de Obsidian.

### Comandos de la REPL
Ejecutando `mantis` sin argumentos entras a la REPL interactiva, la cual soporta:
* `propagule` — Inicia el escaneo.
* `tide` — Corre verificaciones.
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

## 🌲 Mangrove Developer Skills

Este repositorio incluye las habilidades fundamentales de desarrollo de **Mangrove** bajo la carpeta `skills/`. Estas especificaciones guían a los agentes inteligentes en la toma de decisiones técnicas de alto nivel durante el flujo de trabajo de Mantis. Cada habilidad mapea una parte biológica del ecosistema del manglar con un pilar de ingeniería de software:

* **🌬️ [mangrove-hypoxia](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-hypoxia/SKILL.md) (Estrategia e Incertidumbre)**
  * *Biología*: El manglar sobrevive en fango con bajo oxígeno (hipoxia) adaptando su metabolismo.
  * *Ingeniería*: Auditoría y consultoría comercial en *Mist Mode* o *Harsh Mode* para evaluar propuestas de valor, ventas y modelos de negocio hostiles.
* **🌱 [mangrove-pneumatophorous](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-pneumatophorous/SKILL.md) (Bases y Conceptos Teóricos)**
  * *Biología*: Raíces aéreas (neumatóforos) que suben a la superficie para capturar aire.
  * *Ingeniería*: Explicación de conceptos de computación y endpoints complejos mediante analogías físicas e intuitivas desde primeros principios.
* **🪵 [mangrove-proproot](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-proproot/SKILL.md) (Arquitectura y Diseño)**
  * *Biología*: Raíces zancudas que anclan y sostienen al árbol sobre suelo blando y móvil.
  * *Ingeniería*: Estándares estrictos de Clean/Hexagonal Architecture, inyección de dependencias, acoplamiento de componentes y patrones de diseño sólidos.
* **🪨 [mangrove-sediment](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-sediment/SKILL.md) (Persistencia y SQL)**
  * *Biología*: El sedimento del fondo donde se asientan, filtran y reciclan los nutrientes orgánicos.
  * *Ingeniería*: Modelado e implementación de bases de datos, optimización de queries SQL, control de caché y estrategias de persistencia.
* **🛡️ [mangrove-suberin](file:///C:/Users/dpalacios.BSN/develop/mangrove-suberin/SKILL.md) (Ciberseguridad)**
  * *Biología*: La suberina es una barrera impermeable en la corteza de la raíz que bloquea la sal tóxica.
  * *Ingeniería*: Auditorías de seguridad y pentesting en *Root Mode* o *Salt Mode* para prevenir inyecciones, vulnerabilidades y aplicar parches defensivos.
* **🔒 [mangrove-tannin](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-tannin/SKILL.md) (Criptografía y Cifrado)**
  * *Biología*: Los taninos son compuestos químicos de defensa que previenen el ataque de plagas y hongos.
  * *Ingeniería*: Implementación de hashing (SHA-256), firmas digitales, cifrado asimétrico y almacenamiento seguro de secretos.
* **🧪 [mangrove-xylem](file:///C:/Users/dpalacios.BSN/develop/mantis-cli/skills/mangrove-xylem/SKILL.md) (Redes y APIs)**
  * *Biología*: El xilema es el sistema vascular que transporta agua y nutrientes de forma ascendente.
  * *Ingeniería*: Diseño de APIs REST, WebSockets, protocolos de comunicación HTTP y conectividad robusta de red.
