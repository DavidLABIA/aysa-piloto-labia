# Aysa — Casilla de Email de Clasificación
## Propuesta de Solución IA: Procesamiento de ~23.000 Emails y Validación de Identidad de Cuentas

> **Proyecto independiente** de cualquier otro proyecto del equipo: datos, pipeline y espacio de trabajo propios.
> **Audiencia:** Dirección, CIO/CTO, Marketing y Operaciones.
> **Estructura:** Business case de 8 secciones + 5 estrategias + dashboard comparativo.
> **Moneda:** todos los valores en **pesos argentinos (ARS)**, referencia **1 USD ≈ ARS 1.500** (a ajustar con la paridad del día). Se indica el equivalente USD donde aplica.
> **Foco (ENTERPRISE):** Aysa es un cliente grande → el **destino es la Estrategia 5 (plataforma enterprise)**; las estrategias 1–4 son escalones hacia ella, y el piloto (E1) es solo la puerta de entrada.

---

# 1. Resumen Ejecutivo (1 página — se lee en aislamiento)

**El problema:** Aysa recibe ~23.000 emails en una casilla de email de clasificación, respuestas de distintas campañas. Hoy en día el proceso de identificar a quién pertenece cada cuenta, resolver y extraer dato útil es **manual, lento y no escala**.

**La solución:** Un pipeline de IA (ingestión → clasificación → **verificación de identidad** → apertura/cierre de casos → data para Marketing) con **triage asistido por LLM + cruce con fuente de verdad** para confirmar/rechazar titularidad de cuentas de forma auditable.

**El valor (impacto):**
| Nivel | Beneficio |
|---|---|
| Operación | Reducción del tiempo de resolución de ~4 días a <1 día (objetivo) |
| Riesgo | Menos errores de identidad → menos reclamos y fraude de servicio |
| Marketing | 100% de la data de campañas estructurada y explotable (confirmación/rechazo/opt-out) |

**La inversión y el retorno (escenario base):**

| Métrica | Valor (base) |
|---|---|
| Inversión piloto (Horizonte 1) | **ARS 12–30 millones** (USD 8.000–20.000) · set-up 4–6 sem |
| TCO 3 años (Estrategia 5 full) | ARS 67–135 millones (USD 45.000–90.000) |
| Payback estimado | **6–12 meses** |
| ROI 3 años (conservador) | **Positivo en escenario pesimista** → caso robusto |

**La recomendación (foco ENTERPRISE):** el destino es la **Estrategia 5 (plataforma enterprise)** — lo correcto para un cliente de la escala de Aysa. Aprobar **Solo el Horizonte 1** (Estrategia 1, puerta de entrada con go/no-go) para validar la tasa real de confirmación/rechazo sobre los 23k, y usarlo como **primer escalón hacia el enterprise** (E2→E3→E4→E5). El resto se decide con evidencia.

**Decisión pendiente (reunión de mañana):** **self-host vs cloud** — impacta costo, privacidad (Ley 25.326) y velocidad. Ambas soportadas por las 5 estrategias.

---

# 2. El Problema y su Costo Actual

## 2.1 Declaración del problema
El área recibe ~23.000 emails de respuesta a campañas. Cada uno requiere: identificar de qué campaña viene, a qué cuenta corresponde, si el usuario **confirma o rechaza** la titularidad, y qué hacer (abrir/cerrar caso, responder, registrar dato).

Hoy esto se hace **manualmente** o con reglas rígidas que no capturan intención libre.

## 2.2 Costo del "no hacer nada" (baseline)
| Ítem | Estimación |
|---|---|
| Tiempo manual por email | ~4–8 min |
| Volumen útil (70% tras filtrar ruido) | ~16.000 emails |
| Horas totales | ~1.100–2.100 horas-hombre |
| Costo operativo anualizado (referencia) | ARS 45–90 millones (USD 30.000–60.000) en trabajo manual |
| Costo de error de identidad | Alto (reclamos, fraude, multas/Ley 25.326) |

> **Regla de oro:** la confirmación de identidad **nunca** se decide solo por lo que "dice" un LLM. Se cruza con una **fuente de verdad** (BBDD de clientes / remitente de campaña). El LLM extrae e interpreta; la fuente confirma.

---

# 3. Por Qué la IA es la Solución Correcta (build vs buy)

## 3.1 Alternativas evaluadas
| Alternativa | Veredicto |
|---|---|
| **Proceso manual / más staff** | No escala, cara, lenta, propensa a error |
| **Reglas / RPA determinístico** | Bueno para filtrar ruido, **falla** en intención libre y en extracción de identidad |
| **Herramienta SaaS de email triage** | No cubre validación de identidad con fuente de verdad propia de Aysa ni data de campaña a medida |
| **IA (LLM + cruce con BBDD)** | **Correcta**: escala, captura intención, y la validación se ancla en dato de Aysa |

## 3.2 Matriz build vs buy
| Situación | Recomendación | Justificación para este caso |
|---|---|---|
| Diferenciado / requiere conocimiento de dominio | **Build (sobre modelo fundación)** | Validación de identidad con la BBDD propia → no lo da un SaaS genérico |
| Industria regulada, evidencia auditable | **Build o vendor especializado** | Ley 25.326 exige control y trazabilidad |
| Integración profunda con sistemas internos (CRM, BBDD clientes) | **Build** | La integración es la línea dominante del TCO; build da flexibilidad |

---

# 4. La Solución Propuesta

## 4.1 Pipeline común (todas las estrategias)
```
IMAP (casilla Aysa)
   │
   ▼
[1] Ingesta & limpieza (determinístico, SIN IA — el ~70% del volumen)
   ├─ Metadatos: From, To, Subject, Date, Message-ID, In-Reply-To, X-Campaign, Reply-To
   ├─ Detección de adjuntos → ruta OCR (factura/empadronamiento)
   ├─ Dedupe por hilo (Message-ID / In-Reply-To)
   └─ Filtro de ruido: spam, out-of-office, bounce, unsubscribe, virus → descartar
   │
   ▼
[2] Clasificación & extracción (LLM)
   ├─ Tipo de mensaje: [CONFIRMA] [RECHAZA] [NO_ES_MIA] [DUDA] [OPTOUT] [IRRELEVANTE] [NO_CLASIFICABLE]
   ├─ Campaña: por header / subject / contenido
   └─ Campos de identidad: n.º servicio, nombre, DNIS, dirección, n.º cliente
   │
   ▼
[3] Verificación de identidad (CRUCE con fuente de verdad — CRÍTICO)
   └─ Resultado: CONFIRMADA / RECHAZADA / REQUIERE_HUMANO (según umbral de confianza)
   │
   ▼
[4] Acción & salida
   ├─ Abrir / cerrar caso en CRM
   ├─ Respuesta (plantilla) al usuario
   └─ Data estructurada → Marketing (por campaña)
```

## 4.2 Decisiones técnicas
| Área | Opciones | Nota |
|---|---|---|
| **Modelo LLM** | `Qwen2.5:14b` self-host **o** `gpt-5-mini`/`gemini-3-flash` cloud | Según decisión de hosting |
| **OCR adjuntos** | `Qwen2.5-VL` self-host **o** vision cloud | Si hay facturas/empadronamientos |
| **Embeddings (E4/E5)** | `bge-m3` / `nomic-embed` self-host | Dedupe semántico + data Marketing |
| **Juez/validación** | Runner local (schema + juez) | Detecta alucinaciones en extracción |
| **Orquestación (E5)** | Prefect / Airflow / Node-RED / CRON | Schedulado IMAP |

> Toda la arquitectura detallada (diagramas de modelo, specs) va a un **apéndice** — aquí solo el "qué hace", no el "cómo".

---

# 5. Las 5 Estrategias

> **Escala de madurez:** E1 → E5. Cada una con modelo, costo (3 escenarios), tiempos, mantenimiento, equipo (RACI) y workflow.

## Estrategia 1 — "Filtro Determinístico + Solo Identidad" (puerta de entrada)

**Qué hace:** Reesuelve el objetivo sin IA en el grueso. Reglas determinísticas resuelven campaña/tipo/spam/dedupe. El LLM solo extrae campos de identidad, y la confirmación se cruza con la BBDD. Reportes, sin dashboard en vivo.

| Dimensión | Detalle |
|---|---|
| **Modelo** | Determinístico (70%). Extracción: `Qwen2.5:14b` **o** `gpt-5-mini` |
| **Costo ARS/lote** | Cons: 12K · Base: 21K · Opt: 30K (USD 8 · 14 · 20) |
| **Set-up** | 4–6 semanas |
| **Tiempo/lote (23k)** | 1–2 días |
| **Mantenimiento** | Bajo |
| **Equipo** | 2 PT (Data/ML eng + validación operativa) |

**Workflow:** [1]→[2] reglas→[3] LLM extracción→[3b] cruce BBDD→[4] caso + CSV.
**Pros:** costo casi nulo, veloz, menor superficie de datos. **Contras:** no captura intención libre, clasificación rígida, sin feedback en vivo.

## Estrategia 2 — "Triage Completo con LLM + Human-in-the-Loop"

**Qué hace:** LLM clasifica *todo* (tipo, campaña, intención, identidad) con schema estricto + juez. Bajo umbral de confianza → cola de revisión humana. Dashboard del embudo por campaña.

| Dimensión | Detalle |
|---|---|
| **Modelo** | `Qwen2.5:14b` (PII) **o** `gpt-5-mini`/`gemini-3-flash`. Juez local. |
| **Costo ARS/lote** | Cons: 120K · Base: 172K · Opt: 225K (USD 80 · 115 · 150) |
| **Set-up** | 8–10 semanas |
| **Tiempo/lote** | 3–5 días (incluye revisión humana) |
| **Mantenimiento** | Medio |
| **Equipo** | 3 (Data/ML eng + operador revisión + QA golden-set) |

**Workflow:** [1]→[2] LLM→[3] juez+cruce→humano (cola)→[4] caso + respuesta + data.
**Pros:** captura intención libre, alta precisión con juez, feedback real. **Contras:** requiere operador humano, más tókenes, requiere golden set.

## Estrategia 3 — "OCR + Identidad para Adjuntos"

**Qué hace:** Igual que E2 + **procesa adjuntos (factura/empadronamiento) con OCR** y extrae nombre/número del documento. La señal de identidad más fuerte.

| Dimensión | Detalle |
|---|---|
| **Modelo** | `Qwen2.5-VL` self-host **o** vision cloud. Texto limplio con LLM. |
| **Costo ARS/lote** | Cons: 165K · Base: 240K · Opt: 315K (USD 110 · 160 · 210) |
| **Set-up** | 10–12 semanas |
| **Tiempo/lote** | 4–7 días (OCR suma latencia) |
| **Mantenimiento** | Medio-alto (formatos de factura cambian) |
| **Equipo** | 4 (Data/ML eng full + operador + QA documentos) |

**Workflow:** [1] adjuntos→[OCR]→[2] triage→[3] cruce (texto+documento)→[4] caso + data.
**Pros:** máxima evidencia de titularidad, menos falsos positivos. **Contras:** más caro, más mantenimiento, más lento.

## Estrategia 4 — "Clustering Semántico + Enriquecimiento de Campañas"

**Qué hace:** Igual que E2 **+ embeddings** para dedupe semántico y agrupar respuestas equivalentes. Output normalizado en dataset accionable por campaña para Marketing/BI.

| Dimensión | Detalle |
|---|---|
| **Modelo** | LLM triage + `bge-m3`/`nomic-embed` (1.500 dim). |
| **Costo ARS/lote** | Cons: 128K · Base: 183K · Opt: 240K (USD 85 · 122 · 160) |
| **Set-up** | 9–11 semanas |
| **Tiempo/lote** | 3–5 días |
| **Mantenimiento** | Medio (re-ajustar embeddings si cambian campañas) |
| **Equipo** | 3 (Data/ML eng full + BI/Marketing analyst) |

**Workflow:** [1]→[2]→[3]→[embeddings]→[4] caso + **dataset por campaña**→BI.
**Pros:** data única para Marketing, dedupe semántico, normalización BI. **Contras:** complejidad extra, requiere KPIs de Marketing desde el día 1.

## Estrategia 5 — "Orquestación Completa (OCR + Embeddings + CRM + Dashboard)"

**Qué hace:** Todo integrado: ingestión schedulada (IMAP/CRON), OCR, triage LLM, verificación de identidad en tiempo real, apertura/cierre de casos en CRM, respuestas automáticas, **dashboard en vivo por campaña**. Solución "producto".

| Dimensión | Detalle |
|---|---|
| **Modelo** | Qwen2.5-VL **o** gpt-5-mini + gemini-3-flash-vision. Embeddings. Juez. Orquestador. |
| **Costo ARS/lote** | Cons: 270K · Base: 375K · Opt: 480K (USD 180 · 250 · 320) |
| **Set-up** | 14–18 semanas |
| **Tiempo/lote** | 5–8 días (automatizado + colas humanas) |
| **Mantenimiento** | Alto (orquestación + monitoreo + pipelines) |
| **Equipo** | 5–6 (Data/ML eng + DevOps + operador + BI + QA) |

**Workflow:** [CRON]→[1]→[OCR]+[embeddings]→[2]→[3] verificación + CRM→[4] casos/plantillas + data→**dashboard en vivo**.
**Pros:** punta a punta, automatización total, dashboard en vivo, escalable. **Contras:** el más caro y de más mantenimiento; *overkill* si el volumen es estático de 23k.

---

# 6. Análisis Financiero (ROI / Payback / NPV)

## 6.1 Modelo de 3 escenarios por estrategia
> Un solo número = señal de naivez. Siempre 3 escenarios.

| # | Estrategia | Cons ARS | Base ARS | Opt ARS | Set-up | Payback (base) |
|---|---|---|---|---|---|---|
| 1 | Filtro det. + Solo Identidad | 12K | 21K | 30K | 4–6 sem | ~1–3 meses |
| 2 | Triage LLM + Human-in-loop | 120K | 172K | 225K | 8–10 sem | ~4–6 meses |
| 3 | OCR + Identidad | 165K | 240K | 315K | 10–12 sem | ~6–9 meses |
| 4 | Cluster + Campañas | 128K | 183K | 240K | 9–11 sem | ~5–7 meses |
| 5 | Orquestación Completa | 270K | 375K | 480K | 14–18 sem | ~8–12 meses |

> **Valores en ARS por lote (ref. 1 USD ≈ 1.500 ARS).** Equivalente USD: 1 → 8/14/20 · 2 → 80/115/150 · 3 → 110/160/210 · 4 → 85/122/160 · 5 → 180/250/320.

## 6.2 TCO a 3 años (Estrategia 5 full, referencia)
| Categoría de costo | Nota | Rango |
|---|---|---|
| Infraestructura (compute/API) | Cloud o GPU self-host | ARS 7–22 M /año |
| Integración y desarrollo | Pipelines, CRM, QA | ARS 30–60 M |
| Talento y entrenamiento | Equipo + prompt eng | ARS 15–37 M |
| **Gestión del cambio** (el costo oculto) | Capacitación, rediseño proceso, dip productividad | 5–15% extra |

> **Contingencia recomendada: 25%** sobre el total del inventario de costos (la data prep y el cambio de proceso suelen ser 40–60% del costo real y se subestiman).

## 6.3 Umbrales de decisión (lo que exige un CFO)
- **NPV positivo** a tasa de descuento 8–12% en 3 años ✓ (esperado)
- **Payback < 12–18 meses** ✓ (base)
- **ROI positivo en escenario pesimista** → el caso más robusto es el de la Estrategia 1/2

---

# 7. Registro de Riesgos (risk register, no párrafos)

| # | Riesgo | Probl. | Impacto | Mitigación | Responsable |
|---|---|---|---|---|---|
| R1 | Confirmación de identidad errónea (fraude/suplantación) | M | Alto | **Nunca confirmar solo por LLM**; cruzar con fuente de verdad; umbral bajo = humano | Data/ML eng + Operaciones |
| R2 | Incumplimiento Ley 25.326 (PII sale a la nube) | M | Alto | Self-host si PII; si cloud → DPA; minimización y retención | Compliance/CISO |
| R3 | Alucinaciones del LLM en extracción | M | Medio | Juez de validación + schema estricto + golden set | QA |
| R4 | Opt-out / baja de campaña no respetado | L | Alto | Priorizar `[OPTOUT]`, nunca postergar | Operaciones |
| R5 | Formatos de factura cambian (OCR) | M | Medio | Templates/benchmarks de OCR, re-ajuste | QA técnica |
| R6 | Sobre-costo en tókenes | M | Medio | Filtro determinístico primero (70% sin LLM), batching | Data/ML eng |
| R7 | Adopción/dip de productividad | M | Medio | Gestión del cambio, capacitación, quick wins 90 días | Sponsor |
| R8 | Dependencia de un proveedor LLM | M | Medio | Capa de abstracción de modelo, self-host abierto | CTO/DevOps |

---

# 8. Hoja de Ruta (3 horizontes) + Go/No-Go y Gobernanza

## 8.1 Roadmap en 3 horizontes
| Horizonte | Marco | Objetivo | Hito de éxito | Inversión |
|---|---|---|---|---|
| **H1: Quick Wins** | 0–6 meses | Puerta de entrada (Estrategia 1) + golden set + medir tasa real confirmación/rechazo | Primera mejora de KPI medible; piloto validado | **ARS 12–30 M** |
| **H2: Escala** | 6–18 meses | Expandir a E2/E3 (human-in-loop, OCR) + gobernanza/ops | Caso base ROI alcanzado | ARS 30–75 M |
| **H3: Enterprise (destino)** | 18–36 meses | E4/E5 (data campañas + dashboard en vivo + CRM full) — la plataforma que merece la escala de Aysa | Escenario optimista | ARS 67–135 M |

> **Principio:"shrink the ask":** se aprueba **solo H1**. H2/H3 se muestran como contexto estratégico. Si el piloto no supera el go/no-go, se cierra con una pérdida acotada al budget del piloto.

## 8.2 Go / No-Go del piloto (H1)
| Criterio | Threshold |
|---|---|
| Precisión de clasificación (golden set) | ≥90% |
| Precisión de extracción de identidad | ≥95% |
| Tasa de derivación a humano | <30% del volumen útil |
| Payback piloto | <6 meses |
| Risk de identidad (R1) sin mitigación | 0 (bloqueante) |

## 8.3 Gobernanza
| Rol | Responsable |
|---|---|
| **Business Sponsor** (dueño del resultado) | Gerencia de Operaciones/Marketing |
| **Technical Sponsor** | CIO/CTO |
| **Finance co-author** | Finanzas |
| **Compliance owner** (Ley 25.326) | Legal/CISO/DPO |
| **Equipo de entrega** | Según estrategia (RACI) |

## 8.4 Stakeholders — a cada uno lo que le importa
| Segmento | Qué enfatizar |
|---|---|
| **CFO** | Cash flow, payback, ROI, NPV, TCO 3 años, escenarios |
| **CIO/CTO** | Factibilidad, integración con CRM/BBDD, seguridad, escalabilidad |
| **CEO** | Valor de negocio (reducir tiempo, evitar multas, data reglamentaria), ventaja estratégica |
| **Marketing** | Data accionable por campaña: % confirmación, % rechazo, % opt-out, % dudas |

---

# 9. Métricas de Éxito y Kill Criteria

## 9.1 Métricas por fase
| Fase | Leading (operativas) | Lagging (financieras/adopción) |
|---|---|---|
| Piloto (3 meses) | Precisión clasificación ≥90% · extracción ≥95% | % volumen auto-resuelto, tiempo/caso |
| Escala (6 meses) | Tasa de derivación a humano | Ahorro horas, casos/CRM |
| Transformación (12 meses) | Exactitud OCR, uptime pipeline | ROI, data disponible en BI |

## 9.2 Kill criteria (señales de cortar/reestructurar)
| Señal | Amarillo → evaluación | Rojo → cortar |
|---|---|---|
| Time-to-value | Retraso >2 meses | Retraso >6 meses |
| Adopción | >30% bajo lo previsto | >50% bajo lo previsto |
| Costo operativo | >2× el modelo del piloto | >3× |
| Brecha de precisión | >humano puede cerrar | No cierra con revisión |

---

# 10. Dashboard Comparativo

> Abrir **`dashboard-aysa.html`** para el dashboard visual interactivo comparando las 5 estrategias (costo 3 escenarios, set-up, madurez, equipo, riesgo).

---

## Recomendación final
> **Foco enterprise:** Aysa es un cliente grande → la solución de destino es la **Estrategia 5 (plataforma enterprise)** con OCR + embeddings + CRM + dashboard en vivo. Las estrategias 1–4 son escalones, no fines.

1. **Reunión de mañana:** definir **self-host vs cloud** y confirmar **fuente de verdad** de Aysa (BBDD de clientes) — el blocker crítico.
2. **Aprobar H1 (Estrategia 1, puerta de entrada):** 4–6 semanas, ARS 12–30 millones, go/no-go claro. Rápido, barato, valida el proceso y acota el riesgo.
3. **Escalar al enterprise con evidencia:** sumar OCR (E3) + BI (E4) + CRM/dashboard → completar la **Estrategia 5 (plataforma enterprise)**, el destino para un cliente de la escala de Aysa.
4. **Golden set** (~150 emails etiquetados a mano) para medir precisión antes de escalar.

---

## Apéndice (técnico — fuera del cuerpo ejecutivo)
- Diagrama de arquitectura detallada del pipeline
- Specs de modelos y parámetros por estrategia
- Costos unitarios de inferencia por modelo
- Plantillas de los campos JSON de extracción
- Matriz RACI completa por rol/actividad
