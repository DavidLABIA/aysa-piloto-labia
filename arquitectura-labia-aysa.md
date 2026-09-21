# Arquitectura técnica y plan de implementación labIA — Aysa · Calidad de Datos de Contacto

**Clasificación:** Confidencial — **uso interno del equipo labIA · Concentrix**
**Proyecto:** Aysa · Detección de inconsistencias en datos de contacto de campañas de comunicación
**Estado:** propuesta MVP aprobada → este documento define **qué construye labIA, cómo y en qué orden**
**Fecha:** 15/09/2026 · Versión v0.1

> **Para quién es este documento:** únicamente el equipo de labIA que ejecuta el despliegue (ESI + EDI + liderazgo). No se comparte con el cliente. Todo lo que aparece acá es **nuestra labor**: arquitectura, componentes, modelo de datos, pipeline, validación técnica e infraestructura. Lo que depende del negocio de Aysa figura solo como **dependencia de habilitación** (insumo externo), nunca como contenido a desarrollar ni como narrativa comercial.
> **Modelo de referencia:** adaptación del **patrón interno de labIA** (despliegues on-prem previos del equipo): huella mínima, "piso en código" para lo exacto/auditable, IA para lo interpretativo/estructurado, model routing para controlar el costo de IA, 3 escenarios, seguridad en formato mínimo. El patrón reutilizable es: **ingesta → normalización → reglas determinísticas → IA con schema estricto → juez → evidencia contra fuente de verdad → salidas/dashboard → log de auditoría**.
> **Files relacionados:** `plan-4-semanas-aysa.md` (cronograma oficial con el cliente), `guion-presentacion-aysa.md` (discurso/demo), `estrategias-aysa.md` (business case, referencia interna de costos ARS).

---

## 1 · Lo que labIA construye (en una frase)

Una tubería (pipeline) que **lee una casilla de correo** (solo lectura, dentro de la VPN), **separa ruido de contenido útil**, **clasifica cada correo útil en una de 5 clases**, **extrae 8 campos de contacto**, **valida la extracción con un juez**, **cruza contra la base de datos relacional corporativa** (evidencia determinística) y **publica datasets por campaña** con rastro de evidencia por fila + un tablero de métricas.

**Regla transversal del diseño:** la herramienta **sustenta, no decide**. Nada de lo que costruimos corrige, modifica o escribe en sistemas de origen o sobre los datos crudos.

**Límites de lo que construimos (explícito):**
- No escribimos en Exchange ni en la fuente corporativa (solo lectura).
- No definimos el significado de cada clase de negocio (lo hace el área del cliente); nosotros definimos el **schema técnico de salida** y lo versionamos.
- No reemplazamos ni tocamos procesos/productos actuales del cliente.

---

## 2 · Arquitectura de referencia (alto nivel)

Modelo derivado del patrón interno de labIA: las capas son idénticas en patrón a otros despliegues on-prem del equipo, cambia el dominio (operaciones → correos de campaña).

```
 CASILLA EXCHANGE (on-prem, red Ley 25.326)
   │  EWS / Graph — usuario de servicio SOLO LECTURA (mínimo privilegio)
   │  o importe PST (plan B de respaldo)
   ▼
[1 · INGESTA CONECTOR labIA]        → staging append-only en repositorio corporativo
   │     incremental + dedupe (ItemId + SHA-256) · sello de integridad
   ▼
[2 · FILTRO DETERMINÍSTICO]         → reglas de código SIN IA: OOO · bounces · spam · vacíos
   │     (no gasta cómputo de modelo)
   ▼
[3 · CLASIFICACIÓN + EXTRACCIÓN IA] → LLM con schema estricto + prompt por campo (Instructor/DocInfo)
   │     salida JSON validada por código · campos ausentes marcados, nunca inventados
   ▼
[4 · JUEZ DE VALIDACIÓN]            → 2º pase sobre zona gris (~30% de casos), coherencia + formato
   │     si no confirma → DUDOSO → cola de revisión humana
   ▼
[5 · NORMALIZACIÓN]                 → trim · mayúsculas · sin tildes · formatos cuenta/documento (versionado)
   ▼
[6 · CRUCE DETERMINÍSTICO]          → contra fuente de datos corporativa relacional (solo lectura)
   │     evidencia: Coincide · No coincide · Requiere revisión (+ motivo)      ← sin IA
   ▼
[7 · SALIDAS + TABLERO]             → datasets por campaña (contrato BI) + evidencia por fila + dashboard
   ▼
[8 · LOG DE AUDITORÍA]              → quién vio qué · qué versión de modelo/prompt · firma humana del cierre
```

### Capas vs responsabilidad (corte del patrón interno de labIA)

| Pieza | Tipo | Motivo |
|---|---|---|
| Filtro de ruido · dedupe | **Código** | Determinístico, exacto, barato (no llama a modelo) |
| Normalización | **Código** | Reproducible y versionable; base de todo cruce |
| Clasificación / extracción | **IA (schema estricto)** | Interpretación de lenguaje natural; se la gobierna con JSON obligatorio |
| Juez de coherencia | **Código + IA** | Reglas de formato en código; contexto/coherencia con 2º pase del modelo |
| Cruce contra fuente corporativa | **Código (SQL/reglas)** | La evidencia debe ser reproducible y auditable: NUNCA IA |
| Datasets / dashboard | **Código** | Definidos por contrato BI; versionados |
| Log de auditoría | **Código** | Inmutable, no editable por nadie |

---

## 3 · Componentes a construir (nuestra labor, track ESI)

| # | Componente | Detalle técnico | Entregable |
|---|---|---|---|
| C1 | **Conector Exchange** | EWS (`SyncFolderItems`, watermark) vía `exchangelib`/`ews-javascript-api`, o Graph API (`users/{casilla}/messages` + paginación) si M365/híbrido. Cuenta de servicio de mínimo privilegio (sin login interactivo, solo lectura). Autenticación Basic Auth sobre TLS 1.2 u OAuth según AD. | Servicio/worker de ingesta |
| C2 | **Plan B PST** | `New-MailboxExportRequest` para histórico si IT no habilita conexión directa; parser de `.pst`→`.eml/.msg`. Más lento, desbloquea el cronograma. | Importador batch |
| C3 | **Dedupe + incremental** | Dedupe por `ItemId` (Exchange) + `SHA-256` del mensaje completo; cursor por watermark/`LastModifiedTime`; job cada 10–15 min o diario según volumen. Hash distinto → se marca revisado. | Lógica de idempotencia |
| C4 | **Staging append-only** | Tablas `stg_email` y `stg_adjunto`; nunca se edita ni borra; cada relectura es fila nueva con checksum. Rastro de `created_at`/`processed_at`. | Tablas en repositorio corporativo |
| C5 | **Filtro determinístico de ruido** | Reglas de código: asunto OOO, headers de "Delivery Status Notification", heurística spam/vacíos. `ruido=True` → fuera del pipeline del modelo. | Reglas + bitácoras |
| C6 | **Salida del dataset técnico** | Schema JSON de salida + tabla `stg_extraccion` (ver sección 4). | Schema + tabla |
| C7 | **Normalización** | trim, mayúsculas, sin tildes; formatos de cuenta y documento (ceros, guiones, espacios) versionados y aprobados contra la fuente por el lado del cliente. | Funciones + tablas de versiones |
| C8 | **Cruce determinístico** | Stored proc/vista que hace JOIN con la fuente corporativa. Evidencia `Coincide / No coincide / Requiere revisión` con motivo. Nunca escribe ni actualiza la fuente. | Vista/SQL + reglas versionadas |
| C9 | **Contrato de salida** | Esqueleto de la salida (CSV/vista BI) implementado desde la semana 1; formato definido con BI en el kickoff. Columnas, granularidad, periodicidad, publicación. | Vista `seg_campana` + export |
| C10 | **Tablero de métricas** | Leading: precisión, % derivación, tiempo/caso. Lagging: inconsist. por origen, datasets entregados, horas liberadas. Publicado como página/vista interna. | Dashboard + views |

---

## 4 · Modelo de datos (esquema de staging propio de labIA)

### Ingesta

```sql
-- stg_email
email_id        int PK, item_id varchar UNIQUE, hash sha256,
remitente, asunto, fecha_recibido datetime,
tamano int, tiene_adjuntos bool, raw_path,
created_at, processed_at

-- stg_adjunto
email_id int FK, nombre_archivo, formato, tamano, path
```

### Clasificación / extracción (schema técnico de salida del modelo)

```js
{
  "clase": "CONFIRMA | NO_ES_MIA | DUDOSO | OPTOUT | IRRELEVANTE",
  "campana": "string | null",
  "contacto": {
    "email": "string|null", "cuenta": "string|null", "nombre_apellido": "string|null",
    "direccion": "string|null", "telefono": "string|null",
    "documento_y_tipo": "string|null", "relacion_titular": "string|null",
    "titular": "string|null"
  },
  "confianza": "0.0-1.0",
  "razon": "string"
}
```

- Si el JSON no parsea o no cumple el schema → **resultado se rechaza**, el caso pasa a revisión. Nunca se persiste JSON mal formado.
- Campos ausentes → `null` explícito (nunca se inventa valor).

```sql
-- stg_extraccion
email_id FK, clase_pred, campana_pred,
email, cuenta, nombre_apellido, direccion, telefono, documento_y_tipo, relacion_titular, titular,
score, modelo_version, prompt_version, resultado_juez,
created_at
```

### Evidencia y decisión

```sql
-- seg_decision
email_id, estado (Coincide/No coincide/Requiere revisión), motivo,
id_fila_que_valido,      -- qué fila de la fuente sustentó el estado (evidencia)
reviewer, reviewed_at    -- si fue revisado por humano

-- seg_campana (dataset por campaña, formato BI)
campaña, estado, cuenta_id, email_id, fecha, evidencia
```

---

## 5 · Qué queda en IA y qué queda en código ("piso") — corte del patrón interno aplicado a Aysa

Este es el corte que nos protege de la objeción de exactitud y de auditoría:

### Se delega a IA (interpretación + estructuración de texto)
- **Clasificar** cada correo útil en una clase + asignación tentativa de campaña.
- **Extraer** los 8 campos de contacto desde el cuerpo/asunto.
- **2º pase del juez** sobre zona gris (coherencia, contradicciones internas: e.g. `CONFIRMA` sin contacto).
- **Explicación/razón** de cada clasificación (campo `razon`) y materiales de apoyo del equipo (agrupaciones, resúmenes).

### Se conserva en código (exactitud, repetibilidad, auditoría)
- Lectura de Exchange con usuario de solo lectura (C1, no escritura).
- Filtro de ruido determinístico (C5).
- Dedupe y dedupes/hash/integridad (C3).
- Normalización (C7) y cruce contra la fuente corporativa (C8) — evidencia reproducible y auditable.
- Log de auditoría inmutable + firma humana del cierre.

**Por qué:** la clasificación/extracción de texto es una tarea interpretativa (ideal IA); la identificación de "coincide o no contra la base" es un problema de exactitud y registro (ideal reglas + SQL). El LLM **sugiere**, la regla **confirma**.

---

## 6 · Model routing y control del costo de IA

Aplicamos el mismo criterio del patrón interno de labIA (la IA ve lo necesario, no todo a precio alto):

| Tarea | Frecuencia | Modelo |
|---|---|---|
| Filtro de ruido | — (no IA) | Código |
| Clasificación + extracción por email útil | Alta (1 por email) | **Liviano local**: `Qwen2.5-7B/14B` self-host en la VPN del cliente, prompt por campo |
| Juez · 2º pase zona gris | Media (~30% de emails) | Liviano (misma familia) |
| Explicación/razón por caso | Alta | Liviano |
| Agrupación / resúmenes para revisión | Baja | Potente (si el pipeline lo requiere) |
| Materiales de informe de cierre | Muy baja | Potente |

**Regla de consumo:** el LLM no procesa el donde el filtro/código ya decidió. El recurrente de IA crece con los **emails útiles + casos de la cola humana**, y se estima solo después de la muestra real (semana 1). Sin muestra real no se emiten costos.

**Nota de volumetría (para dimensionar cómputo):** baseline ~50K emails históricos iniciales, % de utilidad a medir con la muestra (referencia a calibrar ~70% → ~35K útiles). Volumen anual recurrente bajo. Se procesa 1 embate: histórico en lote y recurrente en incremental.

---

## 7 · Infraestructura y despliegue (huella mínima)

### Dónde corre (decisión acordada con Aysa: local, sin nube)

| Opción | Detalle |
|---|---|
| **Local dentro de la VPN del cliente** | VM pequeña con el modelo (Qwen2.5-7B/14B) + base + servicios. Datos nunca salen de la red (Ley 25.326 sin transferencia de PII). Cómputo provisto por IT del cliente. |

Decisión tomada con Aysa: **todo corre local, sin nube**. El dimensionamiento final se confirma en los **días 16–20** con el cómputo real medido sobre la muestra (no por preferencia), coordinado con IT del cliente.

### Dimensionar huella (orientativo)

| Escenario | Cómputo (self-host) | DB | Costo mensual ref. |
|---|---|---|---|
| Pesimista (uso bajo) | 2 vCPU · 8 GB RAM | 100 GB · respaldo semanal | USD 100–150/mes |
| Base | 4 vCPU · 16 GB RAM | 300 GB · respaldo diario | USD 300–500/mes |
| Optimista (histórico completo + recurrente activo) | 8–16 vCPU · 32 GB RAM | 1 TB · respaldo diario + PITR | USD 800–1.500/mes |

> Los números son de referencia de despliegues on-prem previos de labIA ajustados a un caso de correo+bases pequeñas; se calibran con la muestra real. Si el cliente prefiere self-host en infra propia, el costo fijo se traslada a su hardware.

### Seguridad en formato mínimo (misma garantía del patrón interno, aplicada aquí)

- **Única puerta de acceso:** cuenta de servicio de solo lectura a Exchange; credenciales las crea TI del cliente; secreto en gestor de secretos de TI, jamás en código.
- **Roles internos de labIA en el repositorio:** lectura implícita para el pipeline; escritura solo a staging de labIA; nadie edita `seg_decision` una vez generado.
- **Log de auditoría:** cada cruce guarda `id_fila_que_valido`; cada cierre humano guarda reviewer + timestamp. Exportable para auditoría.
- **Residencia/red:** datos dentro de la VPN del cliente (local acordado, sin nube).

---

## 8 · Plan de implementación labIA (pasos técnicos, sin narrativa comercial)

Basado en `plan-4-semanas-aysa.md`, pero acá **solo nuestras tareas**: las tareas de habilitación del cliente aparecen como "hitos de entrada" (🔒). Adaptación del flujo del patrón interno (relevamiento → conector → reglas → calibración → operar).

| Sesión | Tareas de labIA | Hito de entrada externo (🔒) | Entregable técnico |
|---|---|---|---|
| **Pre-arranque (S0)** | Entorno VPN, tablas staging, planilla golden set (admin, no etiquetado), templates de prompts, reserva de sesiones | Coordinación: muestra real + acceso lectura (IT) · CMP aprueba PII | Entorno listo, planilla y templates v0 |
| **Semana 1 (baseline e ingesta)** | Exploratorio con CSV de metadatos (volumen/año, campañas, % ruido, adjuntos, remitentes, incompletos) → doc "lectura de la casilla". Conector leyendo con dedupe + staging. Filtro determinístico v1. Esqueleto de salida (contrato BI) | Kickoff taxonomía (definición del negocio) · Firma contrato de salida BI (día 2) | `% útil real`, conector activo, filtro v1, esqueleto salida |
| **Semana 2 (golden set, modelo, juez)** | Split 70/15/15 con **test congelado** (labIA custodia el set; el etiquetado lo hacen 2 personas del negocio, veridad técnica por **kappa ≥ 0.8**). Prompts por campo (schema estricto), primer modelo sobre train, juez de coherencia + umbrales, calidad sobre validation (90/95/<30). Normalización v1. | Sesiones de etiquetado del negocio (días 3–9) · Permiso lectura DB corporativa (días 7–10) 🔒 | Test congelado, modelo v1, juez, reglas de normalización, consulta a DB funcionando |
| **Semana 3 (cruce, evaluación final, datasets v1)** | Cruce determinístico contra DB (JOIN + normalización). Primer correo real de punta a punta. **Evaluación final sobre test (nadie lo miró), 1ª corrida honesta**. Cola humana: tiempo por caso. Cómputo real → dimensionamiento local con IT. Datasets v1 por campaña | RDB valida reglas de cruce | Evidencia por correo, resultados versionados, huella local confirmada, datasets v1 |
| **Semana 4 (lote, docs, tablero, traspaso técnico)** | Procesar lote acotado (campañas priorizadas acordadas). Documentación técnica v1.0 versionada en repositorio del cliente. Tablero de actividades/métricas. Informe de cierre con escenarios. Entregables de traspaso | Firma del cierre (área de datos) | Datasets por campaña + evidencia + docs + dashboard + informe de cierre |

**Criterios de aceptación técnicos por hito (nuestros, medibles):**
- S0: se puede leer la muestra, cargar planilla y ejecutar prompts sin permisos pendientes.
- S1: lote real leído sin duplicados, sin tocar la casilla; ≥90% del ruido conocido descartado; doc de lectura aprobado.
- S2: kappa ≥ 0.8; test congelado fuera de alcance de todo ajuste; métricas sobre validation 90/95/<30 o gap documentado con plan.
- S3: primer correo de punta a punta validado; métricas finales sobre test; datasets v1 en formato firmado.
- S4: lote procesado, documentación v1.0, dashboard publicado, 5 métricas cerradas, traspaso documentado.

---

## 9 · Validación técnica y criterios de calidad (nuestro estándar de trabajo)

| Criterio | Referencia | Cómo se mide | Quién mide/válida (interno) |
|---|---|---|---|
| Precisión de clasificación | ≥ 90% | Golden set de test (predicha vs oro) | EDI mide · AF del cliente valida (contraloría) |
| Precisión de extracción | ≥ 95% | Campos correctos vs oro | EDI mide · cliente valida |
| Tasa de derivación a revisión | < 30% | % casos a cola humana | EDI mide · cliente valida |
| Cobertura por campaña | ≥ 95% emails útiles | Asignación correcta campaña/dataset | EDI mide · BI valida |
| Evidencia por email | 100% · bloqueante | Rastro de cruce en cada fila | RDB/client valida · bloqueante |

**Regla de integridad:** nadie de labIA valida su propio output: EDI produce, el lado del cliente/af valida, y el test congelado garantiza que la métrica final es la de la primera corrida honesta (no hay tuning post-test).

---

## 10 · Riesgos técnicos (registro interno labIA) y mitigación

| # | Riesgo técnico | Prob | Imp | Mitigación (acción de labIA) |
|---|---|---|---|---|
| T1 | Retro-extracción: el LLM alucina campos de contacto | Med | Alto | Schema estricto + prompt por campo + juez + golden set; `null` explícito; JSON inválido → revisión |
| T2 | Exchange on-prem cambia a M365 / migración | Med | Med | Diseño agnóstico: mismo patrón con Graph API |
| T3 | Dedupe no alcanza (emails idénticos legítimos o hash inestable) | Baja | Med | Dedupe por ItemId + hash; `processed_at` y relectura trazable |
| T4 | Normalización no calza con la fuente (formatos de cuenta/documento) | Med | Med | Versionado de reglas; validación con RDB contra la fuente; casos a `Requiere revisión` |
| T5 | Acuerdo de etiquetado bajo 0.8 (el golden set no es consistente) | Med | Med | Reescribir definiciones con el negocio y re-etiquetar la franja (escenario pesimista) |
| T6 | Test congelado contaminado (se usa para ajustar) | Baja | Alto | Custodia por labIA, fuera del de ajuste; métrica = 1ª corrida |
| T7 | Cómputo local insuficiente para el volumen real | Med | Med | Dimensionar con cómputo real de la muestra (días 16–20) y reservar con IT del cliente |
| T8 | Costo de IA recurrente fuera de rango | Med | Med | Model routing; IA solo sobre útiles + zona gris; escenarios anclados en baseline |
| T9 | Permisos del entorno mal configurados (lectura/escritura indebida sobre fuentes) | Baja | Alto | Solo lectura, cuenta de servicio mínimo privilegio, secretos en gestor del cliente, revisión en hitos 10/20 |

**Hitos de revisión internos labIA:** día 10, día 20 y revisión final (día 28), con el registro vivo arriba.

---

## 11 · Decisiones técnicas abiertas (a resolver en el equipo labIA)

1. **Versión de modelo local para clasificación/extracción:** `Qwen2.5-7B` vs `14B` y familia potente para resúmenes — validar disponibilidad local y calidad de extracción en la muestra. **Responsable: EDI.**
2. **Campos de la fuente corporativa disponibles para el cruce** (tablas/permisos de lectura: cuenta, contrato, titular, documento). Sin esto el cruce usa datos de prueba. **Responsable: ESI (spec de acceso) + deps RDB.**
3. **Especificación exacta del perfil de solo lectura de Exchange** (EWS ApplicationImpersonation vs Full Access read-only vs Graph scoped). **Responsable: ESI.**
4. **Rutas de salida (CSV/vista BI) y periodicidad** — se cierra con el contrato de salida el día 2. **Responsable: ESI.**
5. **Volumen real de cómputo y almacenamiento local** — se estima con la muestra real (S1) y se reserva con IT. **Responsable: ESI + EDI + IT.**

---

## 12 · Definición de "done" técnica (para el kickoff interno)

Cada componente se considera "done" solo si:
- [ ] Corre dentro de la VPN / entorno local del cliente, solo lectura donde corresponde.
- [ ] Tiene tests sobre data real o sintética marcada (filtro ≥90% ruido detectado, cruce contras casos conocidos).
- [ ] Deja rastro: `modelo_version` / `prompt_version` / reglas versionadas / checksums.
- [ ] Su salida alimenta el siguiente paso sin reprocesamiento manual.
- [ ] Fue validado por una persona distinta a quien lo desarrolló (regla "nadie valida lo que produce").
- [ ] No escribe ni modifica nada fuera de su área (staging/decisiones).

---

## Anexo A · Patrón de referencia interno de labIA

Elementos del patrón que se reutilizan en Aysa (estándar interno del equipo en despliegues on-prem): ingesta desde el sistema de origen en solo lectura; motor de reglas determinístico (filtro + normalización + cruce con evidencia); clasificación/extracción con schema estricto (LLM) y prompt por campo; juez + cola humana con firma; model routing barato/potente; huella mínima (1 VM + 1 DB); 3 escenarios de costo anclados en baseline; log de auditoría inmutable + solo lectura; piloto acotado con informe de cierre.

**Diferencia clave de dominio en Aysa:** a diferencia de otros despliegues internos donde la IA solo explica alertas (las detecta la regla), acá la IA **sí clasifica y estructura el texto** (es el core) — el cruce determinístico aporta la evidencia de identidad. Por eso el LLM corre sobre los emails **útiles** (ya filtrados), nunca sobre todo el ruido.