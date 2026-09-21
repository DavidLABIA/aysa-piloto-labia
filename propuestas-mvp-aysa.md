# 4 propuestas para el despliegue MVP Aysa (a partir de la investigación) · labIA

> **Para qué es este documento:** presenta **4 opciones concretas** de cómo desplegar el MVP de Calidad de Datos de Contacto en el plazo de 4 semanas (y sus variantes), cada una derivada de lo que muestra la investigación de proyectos similares (`research-proyectos-similares-aysa.md`). Antes de construir el workbook, el equipo elige **una** propuesta (o una combinación declarada) para que el workbook se escriba sobre esa base y no sobre un híbrido confuso.
> **Cómo leerlo:** primero la tabla comparativa (sección 2), después cada propuesta (secciones 3–6), luego la recomendación (sección 7). Cada propuesta trae: idea en una frase, qué la motiva (con fuente de la investigación), qué cambia respecto al plan base, escenarios de duración, métricas/gate, ventajas/desventajas/riesgos con responsable, qué decir en 3 líneas, preguntas probables con respuesta y bloqueadores/decisiones abiertas.
> **Reglas que se mantienen en TODAS las propuestas (intocables):** la validación no se comprime; nadie valida lo que produce; el test congelado queda bajo custodia y fuera de todo ajuste; la evidencia del cruce es 100% bloqueante; todo corre local en la VPN (no se reabre el cloud como default); la decisión final es del área.

---

## 1 · De dónde salen las 4 propuestas (la palanca de cada una)

| Propuesta | Palanca central | Fuente de la investigación |
|---|---|---|
| **A · Plan base endurecido** | El plan actual + mejoras de bajo costo que **no cambian el plazo** ni el alcance | Email-Triage (safe-default, hash chain), GIGAGPU (caps), 94spec/Encord (kappa por clase), afras23 (resiliencia) |
| **B · Evidencia compuesta** | Cambiar el criterio de ruteo: **score de evidencia compuesto** en vez de confianza cruda del modelo | afras23 (40/40/20), SYJ (gate en código, no en prompt) |
| **C · Examen irrompible** | Endurecer el examen: **golden set 400–500**, freeze con hash-manifest, adjudicación explícita, acuerdo por clase | Robylon (300–600, etiquetar resultado), 94spec (freeze tamper-evident), Encord/Koji (alpha, honeypots) |
| **D · Fast-track 3 semanas** | Reuso + habilitaciones tempranas: **3 semanas como base**, señal antes | GIGAGPU (plantillas), SYJ (reconexión, readiness), BootLabs (HITL en herramienta existente) |

Todas comparten el mismo final: **H1 desplegado y traspasado con gate go/no-go sobre 5 métricas** y operación en manos del área de datos. Lo que cambia es **cómo se llega** y **cuánto blindaje/velocidad** se le compra al cronograma.

---

## 1-BIS · Arquitectura, herramientas y plataformas (explícita, común a las 4)

Esta sección es el **sustrato técnico** sobre el que se montan las 4 propuestas. Las cuatro comparten la misma tubería de 8 capas y los mismos 10 componentes (C1–C10) definidos en `arquitectura-labia-aysa.md`; lo que cambia entre propuestas es qué módulos se agregan y con qué profundidad (se detalla en cada propuesta).

### 1-BIS.1 · Pipeline de referencia (8 capas)

```
 CASILLA EXCHANGE ON-PREM (red Ley 25.326)
   │  EWS/Graph — cuenta de servicio SOLO LECTURA (mínimo privilegio)
   │  o importe PST (plan B)
   ▼
 [C1–C4 · INGESTA]          conector + plan B PST + dedupe (ItemId+SHA-256) + staging append-only
   │
   ▼
 [C5 · FILTRO DETERMINÍSTICO]   reglas de código SIN IA: OOO · bounces · spam · vacíos
   │
   ▼
 [C6 · CLASIFICACIÓN + EXTRACCIÓN IA]  LLM self-host, schema estricto JSON, prompt por campo
   │       ↳ campos ausentes = null · JSON inválido → rechazo → revisión (nunca se persiste mal formado)
   ▼
 [JUEZ · 2º PASE]           coherencia + formato sobre zona gris (~30%) → si no confirma: DUDOSO → cola humana
   │
   ▼
 [C7 · NORMALIZACIÓN]       trim · mayúsculas · sin tildes · formatos cuenta/documento (versionados)
   │
   ▼
 [C8 · CRUCE DETERMINÍSTICO]  JOIN contra fuente corporativa (solo lectura) → Coincide/No coincide/Requiere revisión + id_fila_que_valido
   │
   ▼
 [C9–C10 · SALIDAS + TABLERO]  vista seg_campana (contrato BI) + evidencia por fila + dashboard
   │
   ▼
 [LOG DE AUDITORÍA]         append-only · versiones de modelo/prompt/regla · firma humana del cierre
```

### 1-BIS.2 · Componentes C1–C10: qué herramienta y plataforma usa cada uno

| # | Componente | Herramienta / plataforma concreta | Lenguaje / runtime |
|---|---|---|---|
| **C1** | **Conector Exchange** | EWS con `exchangelib` (Python) o `ews-javascript-api` (Node); **Graph API** (`/users/{casilla}/messages` + paginación) si M365/híbrido; autenticación Basic Auth sobre TLS 1.2 u **OAuth2** según AD; cuenta de servicio sin login interactivo | Python 3.11+ / Node 18+ |
| **C2** | **Plan B PST** | `New-MailboxExportRequest` (Exchange PowerShell) → `.pst`; parser `.pst`→`.eml/.msg` con `libpff`/`readpst` (Linux) o `extract-msg`/`mailparser` (Python/Node) | PowerShell + Python |
| **C3** | **Dedupe + incremental** | `ItemId` de Exchange + `SHA-256` (`hashlib`) del mensaje; cursor por `LastModifiedTime`/watermark; scheduler `cron`/`APScheduler`, o el que IT ya opere (Windows Task Scheduler / Airflow) | Python |
| **C4** | **Staging append-only** | **PostgreSQL 16** (preferido) o **SQL Server corporativo** (si es el estándar de Aysa); tablas `stg_email`, `stg_adjunto`; checksum por relectura | SQL |
| **C5** | **Filtro determinístico de ruido** | Python: parseo de headers (`email`, `mailparser`) + regex de OOO/bounces/spam/vacíos; **sin IA** | Python |
| **C6** | **Clasificación + extracción** | **Qwen2.5-7B/14B-Instruct** servido con **vLLM** (endpoint OpenAI-compatible) o **Ollama** dentro de la VPN; salida JSON forzada con **Pydantic + Instructor/Outlines** (o guided decoding de vLLM); cliente `openai` SDK apuntando al endpoint local | Python |
| **Juez** | **2º pase de coherencia** | Código (Pydantic/regex) + mismo LLM de la familia Qwen para coherencia contextual; **score compuesto en Python** si se elige la propuesta B | Python |
| **C7** | **Normalización** | Python `unicodedata` (sin tildes), `re`, `str`; tablas de versiones de reglas de cuenta/documento | Python |
| **C8** | **Cruce determinístico** | Stored procedure/vista SQL en **PostgreSQL/SQL Server**; JOIN con normalización aplicada; **sin IA**; registra `id_fila_que_valido` | SQL |
| **C9** | **Contrato de salida** | Vista `seg_campana` + export **CSV**; o vista directa en la herramienta BI del cliente (**Power BI / Tableau / Metabase**) | SQL / BI |
| **C10** | **Tablero de métricas** | **FastAPI + HTML estático** propio (huella mínima), o **Streamlit/Metabase/Power BI**; vistas leading/lagging | Python / BI |
| **Log** | **Auditoría** | Tabla append-only + **cadena de hash SHA-256 encadenada**; columnas `modelo_version`, `prompt_version`, `reglas_version`, `reviewer`, `reviewed_at` | SQL |

### 1-BIS.3 · Modelo de datos (esquema de staging de labIA)

```sql
-- Ingesta (C4)
stg_email(email_id PK, item_id UNIQUE, hash sha256, remitente, asunto,
          fecha_recibido, tamano, tiene_adjuntos, raw_path, created_at, processed_at)
stg_adjunto(email_id FK, nombre_archivo, formato, tamano, path)

-- Clasificación / extracción (C6)
stg_extraccion(email_id FK, clase_pred, campana_pred, email, cuenta, nombre_apellido,
               direccion, telefono, documento_y_tipo, relacion_titular, titular,
               score, modelo_version, prompt_version, resultado_juez, created_at)

-- Evidencia y decisión (C8)
seg_decision(email_id, estado, motivo, id_fila_que_valido, reviewer, reviewed_at)

-- Salida por campaña (C9)
seg_campana(campana, estado, cuenta_id, email_id, fecha, evidencia)

-- Auditoría (log)
audit_log(id, ts, actor, evento, entidad, entidad_id, motivo,
          modelo_version, prompt_version, reglas_version, hash_previo, hash_actual)
```

### 1-BIS.4 · Stack transversal (aplica a todas las propuestas)

| Capa | Tecnología | Nota |
|---|---|---|
| **Lenguaje pipeline** | Python 3.11+ | conectar, filtrar, orquestar, validar schema |
| **Lenguaje datos** | SQL (PostgreSQL 16 o SQL Server) | cruce, evidencia, salidas |
| **Runtime de modelo** | **vLLM** o **Ollama** self-host en VM Linux | endpoint OpenAI-compatible dentro de la VPN |
| **Modelo** | **Qwen2.5-7B/14B-Instruct** (base cerrada); evaluar **Qwen3 8B** en B | licencia permisiva, probado extensivamente en la industria |
| **Validación de schema** | Pydantic v2 + Instructor/Outlines | JSON obligatorio; inválido → revisión |
| **Empaquetado** | Docker/Podman Compose o systemd nativo | según lo que IT opere |
| **API / observabilidad** | FastAPI (`/health`, `/ready`) + logs estructurados | readiness hace query real a la BD |
| **Secretos** | Gestor de TI (HashiCorp Vault / Azure Key Vault / Windows Credential Manager) | **nunca en código** |
| **Scheduler** | cron / APScheduler / Task Scheduler / Airflow | lo que IT prefiera operar |
| **Versionado** | Git (repo del cliente) + tabla de versiones de prompt/regla/umbral | todo cambio queda auditado |
| **Red** | 100% dentro de la VPN de Aysa | sin egress a nube (Ley 25.326) |

### 1-BIS.5 · Despliegue e infraestructura (huella, referencia interna de labIA)

```
┌─────────────────────────────────────────── VPN AYSA ───────────────────────────────────────────┐
│                                                                                                 │
│  Exchange on-prem ──(EWS/Graph read-only)──►  VM Linux labIA (Docker/Podman)                    │
│                                                   ├─ worker ingesta (Python)                     │
│                                                   ├─ vLLM/Ollama  ── Qwen2.5-7B/14B (GPU/CPU)   │
│                                                   ├─ API/observabilidad (FastAPI)                │
│                                                   └─ PostgreSQL 16 (staging + evidencia + audit) │
│                                                                                                 │
│  Fuente corporativa (DB relacional) ──(solo lectura, JOIN)──►  cruce (C8)                       │
│                                                                                                 │
│  Salidas: CSV / vista BI / dashboard  ──►  Área de datos · BI · Dirección Comercial · Comms     │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Escenario | Cómputo self-host | DB | Costo mensual ref. (ARS/USD a calibrar) |
|---|---|---|---|
| Pesimista | 2 vCPU · 8 GB RAM | 100 GB · respaldo semanal | referencia baja |
| Base | 4 vCPU · 16 GB RAM | 300 GB · respaldo diario | referencia media |
| Optimista | 8–16 vCPU · 32 GB RAM | 1 TB · respaldo diario + PITR | referencia alta |

> Los valores son **referencia de despliegues on-prem previos de labIA** ajustada a un caso de correo + bases pequeñas; se **calibran con el cómputo real de la muestra** en los días 16–20 (S3) y se confirman con IT. No se promete huella sin dato.

### 1-BIS.6 · Qué se construye en cada track (responsabilidad)

| Track | Rol | Componentes | Herramientas |
|---|---|---|---|
| **Integración** | ESI | C1–C5, C7, C8, C9 + despliegue local | Python, EWS/Graph, SQL, Docker, scheduler |
| **Datos/IA** | EDI | C6, juez, golden set, score compuesto (B), model routing, calidad, tablero | Python, vLLM/Ollama, Qwen, Pydantic/Instructor, FastAPI/BI |
| **Validación** | AF + RDB + IT del cliente | Contraloría: taxonomía, golden set, cruce, formato, evidencia | Planilla golden set, BI del cliente |

---

## 2 · Tabla comparativa de las 4 propuestas

| | **A · Base endurecido** | **B · Evidencia compuesta** | **C · Examen irrompible** | **D · Fast-track 3 sem** |
|---|---|---|---|---|
| **Duración base** | 4 semanas | 4 semanas | 4 semanas (pesimista 5) | **3 semanas** |
| **Escenarios** | 3 / 4 / 6 | 3 / 4 / 6 | 3 / 4 / 5 | 3 / 3 / 6 |
| **Criterio de ruteo (cola humana)** | Confianza cruda del modelo | **Score compuesto 40/40/20** versionado | Confianza cruda + adjudicación explícita | Confianza cruda (mínimo viable) |
| **Golden set** | ~300 | ~300 | **400–500** + freeze con hash + kappa por clase | ~250 (piso aceptable) |
| **Campañas en ventana** | 2–3 | 2–3 | 2 | 2 (más acotado) |
| **Modelo** | Qwen2.5-7B/14B | Qwen2.5 + **evaluar Qwen3 8B en validation** | Qwen2.5-7B/14B | Qwen2.5-7B (el menor viable) |
| **Esfuerzo EDI extra** | Bajo (M1–M9) | Medio (definir/versionar pesos) | Medio-Alto (etiquetado + footprint) | Bajo (usa plantillas previas) |
| **Horas de negocio etiquetando** | ~40–70 h | ~40–70 h | **~60–100 h** | ~30–50 h |
| **Dependencia de habilitaciones** | D1 antes del día 1 | D1 antes del día 1 | D1 + 2 personas negocio días 1–9 | **Muy alta**: todo antes de D1, EWS directo |
| **Riesgo principal** | Derivación alta (28–30%) | Más variables a calibrar en ventana corta | Más horas de negocio; etiquetado es costo real de Aysa | Acceso no llega → vuelve a A |
| **Para qué stakeholder** | El que valora seguridad sin tocar nada | El que valora control fina del resultado (calidad/BI) | El que prevé objeciones de Compliance/auditoría | El que exige la primera señal en 3 semanas |
| **Cuando elegirla** | Default si no hay señal en contra | Recomendada técnica (balance) | Si hay historia de objeciones al "te creo el número" | Si IT/Compliance confirman habilitaciones YA |

---

## 3 · Propuesta A — Plan base endurecido (default)

**Idea en una frase:** el plan de 4 semanas tal como está aprobado en `plan-4-semanas-aysa.md`, con las mejoras de bajo costo que la investigación recomienda y **ninguna** que cambie plazo ni alcance.

**Qué la motiva (fuente):** Email-Triage (safe-default + hash chain), GIGAGPU (cap de contexto/tokens), 94spec/Encord (kappa por clase), afras23 (retry/circuit breaker, límite de costo).

**Qué cambia respecto al plan base:** nada de estructura. Solo se agregan:
- M4 · safe-default en cada etapa (falla de IA → correo a revisión con motivo, nunca se pierde).
- M5 · límite diario de inferencia + registro de costo por corrida.
- M6 · resistencia a prompt injection (instrucciones adversariales → baja confianza + revisión).
- M8 · cap de tokens y truncado de cuerpo.
- M1-lite · manifest con hash del test al congelarlo (sin cambiar las 300 etiquetas).
- M3-lite · reportar acuerdo por clase además del kappa global.
- M7 · cadena de hash encadenada en el log append-only.

**Arquitectura, herramientas y plataformas de esta propuesta (qué agrega sobre el sustrato común de 1-BIS):**
- **Stack:** pipeline C1–C10 completo, sin componentes nuevos. Python 3.11+ · PostgreSQL 16 (o SQL Server) · Qwen2.5-7B/14B servido por vLLM/Ollama · Pydantic + Instructor para el schema · FastAPI para `/health` y `/ready`.
- **M4 · safe-default:** wrapper Python por etapa (`try/except` → estado `REVISION` con motivo); middleware que captura timeout o caída del endpoint y **deriva el correo, nunca lo descarta**.
- **M5 · límite de costo:** contador diario de tokens por `modelo_version` + tabla `usage_diario`; costo estimado por corrida expuesto en el tablero.
- **M6 · anti prompt-injection:** detector de patrones ("ignorá tus instrucciones", `system:`, contenido entre delimitadores) que degrada a `confianza=0` → cola; el prompt encierra el correo en delimitadores y prohíbe ejecutar texto del cuerpo.
- **M8 · cap de tokens:** `max_tokens` fijo (~300) + truncado de cuerpo (~2.000–4.000 chars) antes de inferir.
- **M1-lite · manifest:** script `goldenset_freeze.py` que emite `manifest.json` con SHA-256 por registro + digest del set + seed del split; `verify` detecta cualquier cambio.
- **M3-lite · acuerdo por clase:** script `agreement.py` que calcula kappa global + kappa/alpha por etiqueta sobre la planilla del golden set.
- **M7 · log encadenado:** `audit_log.hash_actual = SHA256(hash_previo + payload)` → cadena inmutable y verificable.
- **Plataformas nuevas:** ninguna; todo corre en la VM Linux dentro de la VPN con las herramientas del sustrato.

**Escenarios de duración:** base 4 · optimista 3 (EWS y muestra al día 1) · pesimista 6 (acceso demorado o re-etiquetado).

**Métricas del gate:** las 5 del plan sin cambios (clasificación ≥ 90% · extracción ≥ 95% · derivación < 30% · cobertura ≥ 95% · evidencia 100% bloqueante).

**Ventajas:** mínima fricción; todo lo demás (guión, deck, guía de equipo) ya está alineado; los cambios son aditivos y reversibles.
**Desventajas:** el riesgo de "derivación rozando 30%" sigue ahí, porque la palanca de ruteo no se toca.
**Riesgos con mitigación y responsable:**
- R-A1 · Derivación ≥ 30% en el gate (Med/Alto) → mitigado con score compuesto como mejora post-gate; responsable: EDI + AF. (Nota: limpio para el gate, mala señal para el caso de negocio → se expresa en los 3 escenarios del informe.)
- R-A2 · Objeción de auditoría "¿y por qué debería creerle al número?" (Med/Med) → mitigado con M1-lite (hash del test) y M7 (log encadenado); responsable: labIA la implementa, IT la revisa.
- R-A3 · Fallas intermitentes del self-host en corridas (Baj/Med) → mitigado con M4/M5; responsable: ESI.

**Qué decir en 3 líneas:** "Es la propuesta que ya aprobaste, sin sorpresas: mismo plazo, mismo alcance, mismas métricas. Solo le agregamos las protecciones de bajo costo que la industria comprobó —nada que cambie el cronograma—: no perder correos si la IA falla, log a prueba de manipulación y control de costo por corrida. Elegí esta si tu prioridad es que nada se mueva de lo pactado."

**Preguntas probables (con respuesta):**
- *"¿Por qué agregar mejoras ahora si el plan ya estaba cerrado?"* → Son aditivas y no cambian plazo ni alcance; eliminan objeciones de auditoría antes de que aparezcan. Si preferís el plan literal, se sacan sin impacto.
- *"¿Cuánto más trabajo es M4/M6?"* → Son funciones determinísticas dentro del pipeline (no IA): una tarde de ESI/EDI en S2. No tocan la validación.

**Bloqueadores / decisiones abiertas:** ninguno nuevo; los D1–D4 del plan. Decisión abierta: ¿se incorporan M1-lite/M3-lite sí o no?

---

## 4 · Propuesta B — Evidencia compuesta (recomendada técnica)

**Idea en una frase:** idéntica a A, pero el criterio para derivar a cola humana pasa de "confianza cruda del modelo" a un **score de evidencia compuesto** y versionado, con gate en código (no en prompt).

**Qué la motiva (fuente):** afras23 (score = completitud 40% + cumplimiento de schema 40% + señal cruda 20%; tres vías: confía / cola / rechaza), SYJ (el modelo no puede "hablarse" para pasar el gate; la aprobación la decide código).

**Cómo funciona el score compuesto (para el workbook):**
```
score_evidencia = 0.40 × completitud_campos
                + 0.40 × coherencia_formato
                + 0.20 × señal_modelo
```
- `completitud_campos`: % de los campos clave (email/cuenta/nombre/doc/teléfono/titular) presentes y no `null`.
- `coherencia_formato`: pasa si los formatos son válidos (cuenta, documento con dígitos de Aysa, email válido, telefono) — es la salida del juez de C6 (2º pase).
- `señal_modelo`: la confianza normalizada del clasificador.
- **Tres vías:** score ≥ umbral_alto → confianza (va a dataset); umbral_medio ≤ score < umbral_alto → cola humana (DUDOSO); score < umbral_medio → revisión manual (probablemente ruido/inyección no detectado).
- Pesos y umbrales los **aprueba AF con criterio de negocio** y se **versionan** como los umbrales hoy (queda registro por corrida). EDI puede recalibrar sin tocar prompts.

**Qué cambia respecto a A:** S2 · Tarea 2.3 incorpora la definición y versión del score; S3 · Tarea 3.3 reporta la derivación ya con el score (mismo test congelado). Nada del plazo cambia.

**Arquitectura, herramientas y plataformas de esta propuesta (qué agrega sobre A):**
- **Nuevo módulo `scoring.py`** (Python determinístico, **no IA**): recibe la salida validada de C6 + el resultado del juez y emite `score_evidencia` + vía (`confia`/`cola`/`rechaza`). Cálculo + validación de rangos.
- **Dos tablas de calibración versionadas:** `score_pesos(version, w_completitud, w_coherencia, w_senal, aprobado_por, fecha)` y `score_umbrales(version, bajo, alto, aprobado_por, fecha)`. Cada corrida guarda `score_version` y `umbral_version`.
- **Corte arquitectónico clave:** el juez (C6) deja de decidir la derivación por `confianza` cruda; la decide `scoring.py`. El schema de C6 **no cambia**; el score se calcula **fuera del LLM** → la IA no puede "hablarse" para pasar el gate.
- **Evaluación comparativa de modelo (opcional, recomendada):** el mismo endpoint vLLM/Ollama sirviendo `qwen2.5:14b` y `qwen3:8b`; se corre sobre validation y se reporta `model_version` ganador por costo/calidad (respalda la decisión D1 del plan).
- **Tablero:** nueva vista con distribución de vías por corrida (`% confía / % cola / % rechaza`) como métrica leading.
- **Plataformas nuevas:** ninguna; reutiliza el runtime y la BD del sustrato.

**Escenarios de duración:** idénticos a A (3/4/6).

**Métricas:** las 5 del plan; **adicional**: derivación objetivo del score < 30% (mismo gate) **y** registro de vías por corrida (cuánto va a cada una) como métrica leading del tablero.

**Ventajas:** deriva menos casos a humano si los campos salen bien (caso de negocio más fuerte); ajuste fino sin tocar prompts (menos riesgo de tocar el test indirectamente); decisión auditable y explicable ("este correo fue a revisión porque completo el 40% de los campos y no matchó formato").
**Desventajas:** más piezas que calibrar en la ventana corta; requiere que AF entienda el score (una sesión extra de 30–45 min en S2).
**Riesgos con mitigación y responsable:**
- R-B1 · Pesos mal calibrados → derivación rara en el examen final (Med/Med) → se arranca con pesos por defecto de la literatura y se calibra sobre validation en S2 (nunca sobre test); responsable: EDI.
- R-B2 · AF no internaliza el score y no lo aprueba con criterio (Baj/Med) → sesión de definición con ejemplos reales de la muestra; responsable: EDI + AF.
- R-B3 · Doble variable (modelo + score) en 4 semanas (Baj/Baj) → el score es determinístico y de bajo riesgo; responsable: ESI/EDI.

**Qué decir en 3 líneas:** "El cambio más importante que proponemos: decidir 'a quién se le cree' con un score de evidencia compuesto —campos completos, formato coherente, señal del modelo— en vez de solo la confianza del modelo. Es el patrón que usan los sistemas de producción maduros para que la máquina no 'se hable sola' y para que cada derivación sea explicable. No cambia el plazo ni el examen: hace más fuerte el caso de negocio bajando la tasa de derivación."

**Preguntas probables (con respuesta):**
- *"¿Esto no es agregar complejidad en 4 semanas?"* → Es una función de 15 líneas determinística dentro del juez que ya existe; el test congelado y las 5 métricas no cambian. La complejidad está en la explicación, no en la implementación.
- *"¿Quién decide los pesos?"* → El AF con criterio de negocio (qué campos importan), EDI implementa; se versionan y quedan auditables por corrida.
- *"¿Y si el score empeora la derivación?"* → Se calibra sobre validation con plan de cierre documentado (igual que hoy con umbrales); nunca se toca el test.

**Bloqueadores / decisiones abiertas:** D1–D4 + decidir los **pesos por defecto** y los **umbrales iniciales** (propuesta EDI en el kickoff, día 1–2). Responsable: EDI + AF.

---

## 5 · Propuesta C — Examen irrompible (blindaje máximo del resultado)

**Idea en una frase:** el plan A **con un golden set más grande (400–500), freeze a prueba de manipulación (hash-manifest), adjudicación explícita de disputas y acuerdo reportado por clase** — el examen más difícil de impugnar de todas las opciones.

**Qué la motiva (fuente):** Robylon (300–600 es el rango; ~300 es el piso → 400–500 da celdas finas por campaña; etiquetar el resultado, no el texto), 94spec (agreement antes de la métrica; adjudicación que se niega a adivinar; manifest con hash por registro y digest), Encord/Koji (reportar alpha y acuerdo por etiqueta, no solo el global).

**Qué cambia respecto a A:**
- Golden set de **400–500** (en vez de ~300), repartido por campaña (min. 50 por clase/campaña donde exista), doble etiquetado con solapamiento del 15–20% entre etiquetadores (no el 100% duplicado: el plan actual etiqueta todo ×2; acá se mantiene ×2 pero el solapamiento medible es 15–20% y el resto es etiquetado simple con muestreo de QA).
- **Etiquetar el resultado (actions/facts/escalation), no la redacción** — formato de planilla del golden set actualizado.
- **Freeze con manifest**: cada registro del test con su hash + digest del set + seed del split; quien modifica algo → se detecta al instante (`verify`). Test custodia labIA + copia sellada entregada a Compliance/IT.
- **Adjudicación explícita**: ninguna disputa se resuelve por mayoría simple; cada una lleva etiqueta final + motivo + quién decidió; sin resolver → el set no se produce.
- **Acuerdo por clase** reportado (kappa global + kappa/alpha por etiqueta); si una clase queda < 0.8 se reescribe la definición y se re-etiqueta esa franja (pesimista).
- Post-gate: **honeypots** (3–10% de ítems de control) + re-muestreo trimestral entran en operación (M10).

**Arquitectura, herramientas y plataformas de esta propuesta (qué agrega sobre A):**
- **Herramienta `goldenset` (script Python o plantilla con validaciones):** modos `sample` (muestreo estratificado por campaña/clase), `agreement` (kappa global + **Krippendorff alpha** por clase con IC bootstrap), `adjudicate` (etiqueta final + motivo + decisor), `freeze` (manifest SHA-256 por registro + digest + seed) y `verify`.
- **Formato de planilla ampliado:** campos `etiqueta_1`, `etiqueta_2`, `etiqueta_final`, `motivo_adjudicacion`, `decisor`, `hash_registro`; solapamiento 15–20% (el resto etiquetado simple con muestreo de QA).
- **Freeze tamper-evident:** `manifest.json` + copia sellada entregada a Compliance/IT; el pipeline **solo acepta el test si `verify` da OK** (si alguien editó → aborta con error).
- **Acuerdo por clase:** gate interno; si `alpha_clase < 0.8` → reescritura de definición (AF) y re-etiquetado de la franja, **antes** de correr el modelo.
- **Honeypots en operación (post-gate, M10):** 3–10% de ítems de control inyectados en la cola; mide la tasa de acierto del operador humano.
- **Tamaño:** 400–500 registros (vs ~300 de A); el cómputo de IA no cambia (mismo pipeline), solo más horas de etiquetado.
- **Plataformas nuevas:** ninguna; es planilla + scripts versionados sobre Git/BD.

**Escenarios de duración:** base 4 · optimista 3 (EWS y muestra al día 1 y etiquetado asistido) · **pesimista 5** (no 6: el golden set más grande se compensa con solapamiento medible en vez de doblar todo, pero puede pedir 1–2 sesiones extra de etiquetado).

**Métricas:** las 5 del plan (medidas sobre un set con mayor volumen por celda → más confiables). No se relaja ningún umbral.

**Ventajas:** la señal por campaña es más sólida; la impugnación ("cocinaron el número") queda imposible técnicamente; el techo del acuerdo se mide por clase y se ataca la causa (definición) antes del modelo.
**Desventajas:** más horas de negocio (60–100 h de etiquetado en ~9 días); el pesimista pasa a 5; exige que el negocio disponga de 2 personas con foco en los primeros días (bloqueador D2 crece).
**Riesgos con mitigación y responsable:**
- R-C1 · El negocio no dispone de las horas (Med/Alto) → entrenar a los etiquetadores el día 1 (1 h), sesiones de 2 h en días 3–9, en paralelo al track técnico; responsable: AF + SP (prioriza).
- R-C2 · Una clase con acuerdo < 0.8 fuerza re-etiquetado (Med/Med) → la re-escritura de definición es del día 1 al 3 (regla 8/10), no al final; responsable: AF.
- R-C3 · El freeze con hash sobrecarga la operación (Baj/Baj) → es una planilla/script, no infraestructura; responsable: EDI.

**Qué decir en 3 líneas:** "Esta opción sube el estándar del examen: más etiquetas por campaña, congelamiento a prueba de manipulación y acuerdo medido por clase —el techo del modelo se mide y se ataca la causa antes de correrlo. Si alguien tiene que creerle al número sin poder auditarlo, esta es la propuesta. El costo es más horas del negocio en los primeros 9 días y un pesimista de 5 semanas."

**Preguntas probables (con respuesta):**
- *"¿No alcanza con 300 como decían?"* → Su fuente de referencia sitúa el rango bueno en 300–600; 300 es el piso y funciona cuando una campaña domina. Si el histórico tiene 2–3 campañas bien diferenciadas, 400–500 da celdas confiables por campaña.
- *"¿Quién paga las horas de etiquetado?"* → Son del negocio (costo real de Aysa), como el plan ya pide; acá son más pero con solapamiento medible (15–20%) en vez de duplicar todo, y dejan la base de operación (honeypots).
- *"¿Esto retrasa la entrega?"* → Base sigue 4; pesimista pasa de 6 a 5 porque el solapamiento medible deroga el doble-etiquetado total.

**Bloqueadores / decisiones abiertas:** D1–D4 (D2 con más horas) + **definir el tamaño exacto por campaña** con AF en S0/S1 (responsable: AF + EDI) + **confirmar disponibilidad de las 2 personas** en días 1–9 (responsable: SP).

---

## 6 · Propuesta D — Fast-track 3 semanas (señal antes que todo)

**Idea en una frase:** hacer de la variante "optimista 3 semanas" del plan la **base**: reuso de componentes (plantillas de prompts, conector parametrizado, planilla golden set lista), golden set mínimo aceptable (~250), alcance reducido a 2 campañas, y dependencia fuerte de que IT/Compliance habiliten **todo antes del día 1** — sino, cae automáticamente a la propuesta A.

**Qué la motiva (fuente):** GIGAGPU (plantillas), SYJ (reconexión con backoff, readiness checks para operar sin fricción), BootLabs (integración con la herramienta que el cliente ya usa → caja de conexión pre-armada), 94spec (un set de 250 dentro del rango "funciona con celdas gruesas").

**Cómo se llega a 3 semanas (sin tocar la validación):**
- **S0 estricto (condición):** IT entrega **EWS directo** (no PST) + muestra real **antes del día 1**; Compliance firma el esquema en el kickoff; resume las sesiones del negocio los días 1–9.
- **Reuso labIA:** prompts por campo v0 precargados (a calibrar con la muestra), conector EWS/Graph parametrizado (config + validación, no desarrollo), planilla golden set con validaciones lista.
- **Golden set 250** (piso del rango aceptable) con 1 campaña dominante: suficiente para el examen si las celdas críticas son dos (clase principal + ruido).
- **Alcance:** 2 campañas priorizadas (no 3).
- **Parallelización máxima:** ESI y EDI en paralelo desde el día 1, sesiones de negocio reservadas en la S0.

**Arquitectura, herramientas y plataformas de esta propuesta (qué agrega/cambia sobre A):**
- **Conector EWS/Graph pre-armado:** a diferencia de A, C1 **no se desarrolla en S1**: se entrega parametrizado (config de casilla, credencial, carpeta) y solo se valida contra la muestra. La rama PST (C2) queda como respaldo documentado, no como plan A.
- **Templates de prompts v0 precargados:** los prompts por campo (Pydantic schema + plantillas) llegan pre-escritos; S2 solo los calibra contra la muestra.
- **Planilla golden set pre-validada:** reglas de validación de formato + script de acuerdo ya cargados; golden set objetivo 250.
- **Runtime:** idéntico (vLLM/Ollama + Qwen2.5); la diferencia es **operativa** (todo precargado), no arquitectónica.
- **Condición dura de infraestructura:** EWS directo + muestra **antes del día 1**; si no, reversa a A (kill criterion de acceso, días 1–3).
- **Plataformas nuevas:** ninguna; el ahorro viene del reuso, no de una herramienta distinta.

**Escenarios de duración:** base 3 · optimista 3 · pesimista 6 (si algo de la S0 no llega → se cae a A; el cronograma no arranca sobre supuestos).

**Métricas:** las 5 del plan (el examen se comprime en tamaño, no en calidad: misma doble etiqueta en el solapamiento medible, mismo test congelado — más chico).

**Ventajas:** la "primera señal" llega en 3 semanas (arma comercial de cierre con el Sponsor); máxima economía de recursos; reuso = menos errores de integración nuevos.
**Desventajas:** ventana congelada muy corta para re-etiquetar si una clase queda < 0.8 (una semana menos de holgura); la señal por campaña es más gruesa; dependencia altísima de IT/Compliance.
**Riesgos con mitigación y responsable:**
- R-D1 · Cualquier demora de S0 mata la propuesta (Med/Alto) → regla dura: si el día 1 no hay muestra EWS, se pasa a A sin drama (kill criterion de acceso en días 1–3); responsable: Sponsor + IT.
- R-D2 · Test congelado chico → señal menos granular (Med/Med) → compensar con acuerdo por clase y re-muestreo enfocado; responsable: EDI + AF.
- R-D3 · "3 semanas" suena a menos calidad (Med/Med) → hablar siempre de "mismo examen, ventana comprimida por habilitación temprana y reuso"; responsable: liderazgo labIA.

**Qué decir en 3 líneas:** "Si IT y Compliance confirman hoy mismo la muestra y el acceso directo, podemos cerrar el examen en 3 semanas —no recortando validación, sino arrancando con todo listo y reutilizando los componentes que ya tenemos. Si no llega a tiempo, volvemos a la propuesta A sin perder nada. Es la apuesta por la señal más rápida."

**Preguntas probables (con respuesta):**
- *"¿3 semanas alcanzan para el golden set?"* → 250 etiquetas con sesiones reservadas días 1–9 y doble etiqueta en el solapamiento medible; el test congelado se congela el día 8–9 y el examen corre en la semana 3. Está en el rango inferior reportado como aceptable (fuente: 300–600, 200 como piso absoluto).
- *"¿Y si IT no llega?"* → Kill criterion explícito: no arrancamos sobre supuestos; pasamos a A. La propuesta D es un condicional con reversa automática, no un compromiso ciego.
- *"¿Qué se pierde contra A?"* → Cobertura: 2 campañas en vez de 2–3, y un test más chico. Se gana: señal una semana antes.

**Bloqueadores / decisiones abiertas (los críticos de todas las propuestas):** D1 (muestra + EWS) **antes del día 1**, confirmado por IT+Compliance en la S0; disponibilidad de las 2 personas del negocio días 1–9; D3 adelantado (lectura fuente corporativa días 7–10). Decisión abierta: Sponsor prioriza "señal en 3 semanas" sobre "cobertura y holgura".

---

## 7 · Recomendación final

**Combinación recomendada: B (evidencia compuesta) como palanca de ruteo + C (examen irrompible) como blindaje, en ventana de 4 semanas (base) con D como variante si IT/Compliance confirman habilitaciones antes del día 1.**

Racional:
- De **A** mantenemos: 4 semanas base, 5 métricas, rol idéntico, cero nube, pipeline de 8 capas. Todo lo aprobado sigue vigente.
- De **B** tomamos el **score de evidencia compuesto**: es el cambio de mayor impacto con menor costo (función determinística dentro del juez ya existente), mejora el caso de negocio (menor derivación) y hace cada decisión explicable — que es lo que hoy un AF/BI va a preguntar en pantalla.
- De **C** tomamos el **blindaje del examen**: freeze con hash-manifest + adjudicación explícita + acuerdo por clase. A costo de más horas de etiquetado (60–100 h), elimina la única objeción que puede tumbar la demo: "¿y tu número de dónde sale?".
- **D** se guarda como variante condicional: si el Sponsor quiere señal en 3 semanas y IT/Compliance confirman, se ejecuta el cronograma D pero con el score compuesto y el freeze-hash ya incluidos (no los abandonamos por acelerar).

**Qué NO cambia con esta combinación:** los roles (ESI/EDI/AF/RDB/IT/CMP/SP), los 4 bloques semana a semana, el contrato de salida en el kickoff, el pre-arranque S0, la operación en marcha, los kill criteria y el gate del día 28.

**Impacto en documentos existentes:** el workbook se escribe sobre **B+C** (con D como anexo condicional). `plan-4-semanas-aysa.md`, `roadmap-rol-semana-aysa.md`, el deck y el guión se actualizan con la sección del score compuesto y del freeze-hash cuando se confirme la propuesta.

### Registro de riesgos de la decisión

| Riesgo | Prob/Impacto | Mitigación | Responsable |
|---|---|---|---|
| B+C + D suena a "mucha complejidad en 4 semanas" | Med/Med | La demo presenta B+C como 2 adiciones aisladas (score + freeze); D como variante condicional reversible | labIA (liderazgo) |
| Horas de etiquetado del negocio subestiman (C) | Med/Alto | Entrenar día 1, sesiones de 2 h en días 3–9, solapamiento medible 15–20%, no doble-etiquetado total | AF + SP |
| Score mal calibrado en la ventana (B) | Med/Med | Pesos por defecto + calibración en validation; nunca en test; plan de cierre documentado | EDI |
| D incapaz de arrancar (acceso) | Med/Alto | Kill criterion días 1–3 → reversa automática a A | Sponsor + IT |
| Test con 400 etiquetas exige re-etiquetado y pesimista 5 | Med/Baj | Regla 8/10 en días 1–3 ataca la definición antes | AF |

### Kill criteria (igual que el plan, vigentes en cualquier propuesta)
Desvío > 6 semanas (o > 5 en C) · adopción > 50% bajo lo previsto · precisión que no cierra ni con revisión · muestra/acceso nunca habilitados · costo operativo fuera de rango. Cierre con pérdida acotada al piloto y documentación del aprendizaje.

---

## 8 · Decisiones abiertas antes de escribir el workbook

| # | Decisión | Responsable | Para qué |
|---|---|---|---|
| 1 | Elegir propuesta: A / B / C / **B+C (recomendada)** / D | labIA + Sponsor (cliente no necesita; es decisión interna) | Escribir el workbook sobre la base correcta |
| 2 | Tamaño del golden set: ~300 (A/B/D) vs 400–500 (C) | AF + EDI | Dimensionar sesiones y bloqueador D2 |
| 3 | Si se adopta B: pesos y umbrales iniciales del score | EDI (propone) + AF (aprueba) | Tarea 2.3 del workbook |
| 4 | Si se adopta C: freeze-hash sobre el test (script/planilla) | EDI | Tarea 2.1 del workbook |
| 5 | Si se adopta D: confirmación de EWS + muestra con IT antes del día 1 | IT + CMP + Sponsor | Condición de entrada del fast-track |
| 6 | Post-gate: honeypots + re-muestreo trimestral en operación | AF + EDI + RDB | Sección "operación en marcha" del workbook |

**Dependencia:** el **workbook de 4 semanas** (próximo entregable) se construye sobre la decisión de la fila 1. Si no hay señal contraria, se escribe sobre **B+C con D como anexo condicional**.