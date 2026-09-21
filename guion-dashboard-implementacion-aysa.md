# Guión del dashboard de implementación — Aysa · labIA (uso interno)

> **Qué es este documento:** acompaña al `dashboard-implementacion-aysa.html` (panel de seguimiento interno del despliegue de 4 semanas + arquitectura). Es **uso interno del equipo labIA** (ESI/EDI/liderazgo): no se comparte con el cliente.
> **Para qué sirve el dashboard:** es el "war room" del despliegue. Cuando la propuesta ya está aprobada, el debate ya no es "si" sino "cuándo/cómo". Este panel responde en una pantalla: dónde estamos, qué falta, qué depende del cliente y cuándo se decide.
> **No contiene negocio:** no hay narrativa comercial, problema del cliente, ROI ni costos del proyecto. Solo ejecución técnica.

---

## 1 · Cómo leer el dashboard (en 60 segundos)

**Objetivo de la mirada rápida:** cuatro cosas en orden:

1. **Resumen (sección 1):** 4 semanas base (3 opt / 6 pes), ~50K emails de baseline (a calibrar en S1), 2–3 campañas en la ventana (Mvp acotado), 8 capas y 10 componentes. Si no arrancó nada aún: todo esta en "warn".
2. **Plan (sección 2):** el timeline S0→S4. La línea de S0 (pre-arranque) es la condición de entrada: si el bloque 🔒 D1 no está tildado, no se puede hablar de "semana 1" real.
3. **Bloqueadores (sección 6):** lo único que puede tumbar el cronograma. Son 4 y tienen fecha. El seguimiento semanal del líder se hace por acá.
4. **Decisiones abiertas (sección 9):** las 6 decisiones técnicas con responsable y fecha. Cada una tiene dueño y deadline para que no quede "pendiente" eterno.

**Qué decir en la revisión semanal con el equipo:**
> "Esta semana seguimos 4 cosas: que IT entregue la muestra (D1, sin eso no hay días 1–4 reales), que el contrato de salida se firme el día 2, que el golden set avance con las sesiones del negocio (días 3–9), y que el acceso a la DB corporativa se pida el día 7 (D3). Lo demás es nuestro: componentes C1, C3, C4, C5 en ESI y el schema/prompts en EDI."

## 2 · El análisis detrás de cada sección

### 2.1 Resumen (sección 1)
| Número | De dónde sale |
|---|---|
| 4 semanas (base) / 3 (opt) / 6 (pes) | Del plan aprobado (`plan-4-semanas-aysa.md`). Optimista = EWS directo + golden set listo al día 1; pesimista = acceso demorado o golden set con re-etiquetado. |
| ~50K emails | Baseline del histórico inicial (acumulado de varios años; flujo recurrente bajo). **A calibrar con la muestra real en S1** — zanja la discrepancia con cifras previas (60K/23K). |
| 2–3 campañas | Alcance acotado del MVP aprobado por el Sponsor: se emiten datasets de las campañas priorizadas en la ventana; el resto post-go/no-go con el mismo motor. |
| 8 capas / 10 componentes | Arquitectura de `arquitectura-labia-aysa.md`: pipeline de 8 capas mapeado a componentes C1–C10. |

**Postura ante el número "4 semanas":** si alguien pregunta por qué tan rápido, la respuesta es: **no se comprime la validación** (golden set completo ~300, doble etiquetado, test congelado, 5 métricas), se comprime el alcance y el calendario (pre-arranque + paralelización). El número es defendible solo si D1 está disponible antes del día 1.

### 2.2 Plan (sección 2)
| Semana | Entregable que la define | Pregunta de control para decir "está OK" |
|---|---|---|
| S0 · Pre-arranque | Día 1 disponible + entorno listo | ¿Se puede leer la muestra, cargar planilla y ejecutar prompts sin permisos pendientes? |
| S1 · Baseline e ingesta | Esquema aprobado + primer lote leído + % útil medido | ¿BI firmó el contrato de salida el día 2? ¿El % útil real está aprobado por el negocio? |
| S2 · Golden set, modelo y juez | Golden set completo + métricas sobre validation | ¿Kappa ≥ 0.8? ¿El test está congelado fuera de alcance de ajuste? ¿Metas 90/95/<30 o gap documentado? |
| S3 · Cruce, examen final, datasets v1 | Métricas finales + correo real E2E | ¿El cruce corre contra datos reales (D3 habilitado)? ¿La métrica es la 1ª corrida honesta? |
| S4 · Datasets, informe, traspaso | H1 desplegado + informe listo | ¿Lote acotado procesado con el pipeline final? ¿5 metas cerradas? ¿Operación traspasada? |

**Nota de escenarios:** el plan tiene 3 columnas de tiempo en todos los números (3/4/6). Nunca presentar "4 semanas" como dato único dentro del equipo: la revisión semanal debe mirar el escenario vigente, no el nominal.

### 2.3 Arquitectura (sección 3)
- El pipeline de 8 capas es el patrón interno de referencia de labIA: **IA para interpretar/estructurar, código para exactitud y auditoría**.
- La capa 6 (cruce contra la fuente corporativa) es la **única que da evidencia de identidad** y es **determinística (nunca IA)**. Es el corazón anti-fraude y anti "confirmo a quien no es".
- La capa 3 (clasificación/extracción IA) opera **solo sobre correos útiles** (ya pasaron la capa 2 de filtro). Eso controla el cómputo y el costo de IA.
- La capa 8 (log de auditoría) es lo que hace la solución defendible ante compliance: todo resultado tiene rastro de quién, qué versión de modelo/prompt y qué fila de la fuente lo sustentó.

**Pregunta probable en revisión técnica:** *"¿Por qué el cruce no usa IA?"* → Porque la evidencia debe ser reproducible y auditable. Un LLM da una probabilidad; la regla + SQL dan un hecho que se puede mostrar (qué fila de la base sustentó el match). La IA clasifica y extrae; la regla confirma.

### 2.4 Componentes (sección 4)
| Estado | Significado | Acción |
|---|---|---|
| 🟢 Listo al kickoff | C6 (schema), C9 (esqueleto contrato), C10 (plantilla tablero) | Ya son entregables; no requieren acceso al cliente |
| 🟡 A construir | C1–C5, C7, C8 | Orden lógico: C1–C5 (S0–S1) → C7 (S2) → C8 (S3). ESI lidera |
| 🔴 Respaldo | C2 (PST) | Solo si IT no habilita conexión directa; desbloquea el cronograma (mitiga riesgo de acceso) |

**Dependencia interna clave:** C8 (cruce) no se puede validar con datos reales hasta que D3 (permiso lectura DB corporativa, días 7–10) esté entregado. Si D3 se demora, C8 se valida con datos de prueba y la evidencia final se revalida en S3 — se documenta.

### 2.5 Modelo de datos (sección 5)
- `stg_email` / `stg_adjunto`: append-only, nunca editar/borrar. Cada relectura es una fila nueva con checksum → trazabilidad total.
- `stg_extraccion`: guarda versión de modelo y versión de prompt **por fila** → se puede auditar con qué versión se clasificó cada correo.
- `seg_decision`: guarda `id_fila_que_valido` (evidencia) + reviewer + timestamp. Es el bloqueante del go/no-go: evidencia 100%.
- `seg_campana`: el dataset por campaña en el formato BI firmado.

**Regla de oro de datos:** si el JSON no parsea o no cumple el schema → el resultado se rechaza y el caso va a revisión. Nunca se persiste JSON mal formado ni valores inventados (null explícito).

### 2.6 Bloqueadores (sección 6)
| # | Riesgo si no llega | Escalada natural |
|---|---|---|
| D1 (Semana 0) | Todo el cronograma se corre al pesimista | IT/CMP → Sponsor |
| D2 (días 1–9) | Golden set se atrasa; test congelado se mueve | AF/negocio → Sponsor |
| D3 (días 7–10) | Cruce se valida sin datos reales | RDB/IT → Sponsor (adelanto que evita el retrabajo de la semana 7) |
| D4 (días 1–16) | No se cierra la decisión de despliegue (self-host/cloud) | CMP → Sponsor |

**Mensaje de cierre del líder:** *"Los bloqueadores no son excusas, son hitos del cliente con fecha. La revisión semanal es para destrabarlos, no para carpir."*

### 2.7 Métricas (sección 7)
- Se miden sobre el **golden set de test** (congelado en S2, nunca usado para ajustar). El resultado reportado es la **primera corrida honesta**.
- División de responsabilidad: EDI mide, el lado del cliente valida (contraloría cruzada). Nadie valida su propio output.
- La evidencia 100% es **bloqueante**: sin rastro de cruce en una fila, no hay go, pase lo que pase con el resto.

### 2.8 Riesgos técnicos (sección 8)
- Es un registro **interno de labIA** (T1–T9), distinto del registro de riesgos del cliente (R1–R7 del deck). Acá solo hay riesgos que controla el equipo técnico.
- Los de mayor atención en la ventana: **T1** (alucinación de campos → schema/juez/golden set), **T5** (acuerdo de etiquetado < 0.8 → re-etiquetar), **T7/T8** (cómputo y costo real → decidir con la muestra de la S1, días 16–20).
- Gates de control: día 10, día 20, gate final (día 28). Incrustar estos gates en el calendario del equipo.

### 2.9 Decisiones abiertas (sección 9)
Cada una tiene responsable y fecha. Dos de ellas son las que más mueven el plan:
- **Self-host vs cloud (días 16–20):** se decide con el cómputo real medido sobre la muestra, no por preferencia. Self-host es la recomendación por Ley 25.326.
- **Campos de la fuente corporativa (D3, días 7–10):** define si el cruce se valida contra datos reales o de prueba.

## 3 · Posibles preguntas en la revisión y respuestas fundamentadas

- *"¿Por qué los componentes C6/C9/C10 están 'listos al kickoff' si no hay datos?"* → Son plantillas/esqueletos (schema JSON, estructura de salida BI, plantilla de tablero). No requieren datos del cliente para diseñarse; el formato es lo que se firma el día 2. Con datos reales se llenan, no se rediseñan.
- *"¿Qué pasa si el cliente no entrega D1?"* → No arrancamos sobre supuestos: el despliegue se replanifica al escenario pesimista (6 semanas). Es además un kill criterion de la propuesta (acceso no habilitado → cortar y documentar).
- *"¿Cómo sabemos que el modelo no inventa los campos?"* → T1: schema estricto + prompt por campo + juez; campos ausentes → null; JSON inválido → revisión humana. La métrica final se mide contra el golden set (≥90% y ≥95%).
- *"¿El dashboard tiene números reales todavía?"* → No: está en modo de seguimiento pre-arranque. Los números reales (volumen, % útil, métricas, cómputo) se cargan a partir de S1 (muestra real). Hasta entonces los únicos datos son los de diseño (baseline ~50K a calibrar).
- *"¿Quién es dueño de cada rectángulo del pipeline?"* → ESI: capas 1, 2, 5, 6, 7, 8 (integración/reglas/datos) · EDI: capas 3, 4 y el tablero (schema/modelo/juez). La separación ESI/EDI materializa "nadie valida lo que produce" en el nivel de componentes.

## 4 · Bloqueadores / decisiones abiertas del dashboard mismo

1. **Cargar el estado real cuando arranque:** el panel hoy está en pre-arranque (todo "pendiente"). Al día 1 del kickoff, actualizar: D1 entregado ✅, componentes en construcción, fechas reales por semana. **Responsable: líder del despliegue.**
2. **Definir dueño de actualización del panel:** si no hay un dueño fijo, el panel muere a la semana 2. **Responsable: Líder (propone) + equipo.**
3. **Vincular el panel con el plan oficial:** el `dashboard-implementacion-aysa.html` muestra la foto actual; el `plan-4-semanas-aysa.md` sigue siendo la fuente de verdad del detalle por tarea. Evitar duplicar decidir solo por el panel.
4. **Decisión de modelo y de hosting (días 16–20):** son las únicas decisiones de arquitectura que cambian la infraestructura del panel (dónde corre). **Responsable: ESI + EDI.**
5. **Confirmar si el equipo quiere versión PDF del dashboard** para distribuir en la reunión semanal (hay tooling de Chrome headless ya usado en `arquitectura-labia-aysa.pdf`).
6. **Ticket relacionado:** al cerrar este pack (arquitectura + dashboard + guión), el siguiente paso natural es el **kickoff interno de ejecución** (asignar ESI/EDI, reservar las sesiones del cliente, pedir D1 a IT) — documentarlo como ticket dependiente.

## 5 · Cierre (resumen de uso)

- **Frecuencia:** revisar el dashboard **una vez por semana** (work-in-progress) + en cada gate de control (días 10, 20 y 28).
- **Quién:** líder del despliegue (conduce) · ESI/EDI (reportan componentes) · se espeja con los bloqueadores con el cliente.
- **No hacer:** no mostrar este panel al cliente (es interno; el cliente tiene su propio deck/plan). No usarlo para vender nada: es una herramienta de ejecución.