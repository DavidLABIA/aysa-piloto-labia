# Roadmap de actividades por rol y semana — labIA · Aysa (MVP en 4 semanas)

**Clasificación:** uso interno del equipo labIA · Concentrix (ESI + EDI + liderazgo).
**Propósito:** desglose específico de **quiénes hacen qué y cuándo** en el despliegue del MVP. Complementa la arquitectura (`arquitectura-labia-aysa.md`) y el deck (`deck-implementacion-aysa.html`) y traduce la sección 8 de la arquitectura a una matriz **semana × rol** con criterios de aceptación por hito.
**Infraestructura:** decisión cerrada con Aysa — **todo corre local, en la VPN del cliente, sin nube** (modelo `Qwen2.5-7B/14B` self-host). No se reabre.
**Escenarios de duración:** base = 4 semanas · optimista = 3 (EWS directo + golden set listo al día 1) · pesimista = 6 (acceso de muestra demorado o re-etiquetado del golden set). En los tres casos la **validación es idéntica y plena**; jamás se comprime la validación.

---

## 1 · Quién trabaja el roadmap (roles internos y contrapartes)

| Rol | Sigla | Track | Responsabilidad | Qué valida / habilita |
|---|---|---|---|---|
| **Especialista en Automatización / Integración** | ESI | Integración | C1–C5, C7, C8, C9: conector, staging, filtro, normalización, cruce, contrato de salida y despliegue local | Entrega lo suyo; IT/RDB/AF validan |
| **Especialista en Datos e IA** | EDI | Datos / IA | C6, juez, golden set, model routing, calidad y tablero | Entrega lo suyo; AF/RDB validan |
| **Analista funcional (cliente)** | AF | Contraparte negocio | Taxonomía (día 1), contrato de salida, etiquetado doble, cola humana, contraloría de resultados | Valida golden set, umbrales y datasets con ojos de negocio |
| **Responsable de datos / BI (cliente)** | RDB | Contraparte datos | Formato de salida (día 2), lectura de la fuente corporativa, calidad del cruce y del dataset | Valida reglas de cruce, formato y evidencia |
| **IT / Comunicaciones (cliente)** | IT | Habilitación | Muestra + acceso lectura de la casilla, cuenta de mínimo privilegio, cómputo local | Habilita entregables 🔒 |
| **Compliance / Legal (cliente)** | CMP | Habilitación | Tratamiento de PII bajo Ley 25.326, esquema de datos | Aprueba habilitaciones 🔒 |
| **Sponsor (cliente)** | SP | Decisión | Alcance acotado, kickoff, revisión de hitos 10/20/28, firma del cierre | Preside las revisiones de hito |

**Regla transversal:** **nadie valida lo que produce**. ESI/EDI entregan; AF/RDB/IT validan con contraloría. El test congelado queda bajo custodia de labIA y fuera de todo ajuste: la validación final es la **primera corrida honesta**.

---

## 2 · Matriz resumen semana × rol

| Actividad clave | S0 (pre-arranque) | S1 (baseline + ingesta) | S2 (golden set + modelo + juez) | S3 (cruce + examen + datasets v1) | S4 (lote + docs + traspaso) |
|---|---|---|---|---|---|
| **ESI** | Entorno VPN + staging + pedido muestra/acceso a IT | Conector con dedupe + staging + filtro v1 + esqueleto salida | Normalización v1 + confirmar lectura DB corporativa 🔒 | Cruce determinístico + 1er correo E2E | Lote acotado + doc técnica v1.0 |
| **EDI** | Planilla golden set + templates de prompts | Exploratorio "% útil real" + kickoff taxonomía | Split 70/15/15 + test congelado + modelo/juez sobre validation | Examen final sobre test (1ª corrida honesta) + dimensionar cómputo | Tablero + informe cierre 3 escenarios |
| **AF (cliente)** | Valida representatividad de muestra | Taxonomía (día 1) + arranque doble etiquetado | Termina doble etiquetado (~300) + umbrales | Contraloría del test + cola humana | Valida datasets y traspaso |
| **RDB (cliente)** | Aprueba estructura de staging | Contrato de salida BI (día 2) | Solicita lectura DB 🔒 | Valida cruce + datasets v1 | Aprueba docs y calidad final |
| **IT (cliente)** | Muestra + cuenta solo lectura + cómputo | — | Habilita lectura DB 🔒 | Confirma cómputo real | Revisa documentación |
| **CMP / SP** | CMP: aprobación PII · SP: alcance acotado | SP+RDB aprueban esquema | — | CMP aprueba resinencia local | SP: revisión hito 28 y firma del cierre |

**Hitos de revisión internos labIA:** día 10 · día 20 · día 28 (registro de riesgos vivo en cada hito, responsable: liderazgo labIA).

---

## 3 · Semana por semana, actividades por rol

### Semana 0 — Pre-arranque en paralelo (condición de entrada)

> Ocurre en paralelo a la aprobación formal. Es la condición de entrada del cronograma: **si la muestra o el acceso no están al día 1, se mueve el plan entero (escenario pesimista); no se arranca sobre supuestos.**

| Rol | Actividad | Días | Entregable | Dependencia / coordinación |
|---|---|---|---|---|
| **ESI** | Preparar entorno dentro de la VPN: carpeta de trabajo, tablas `stg_email`/`stg_adjunto`, acceso al repositorio corporativo | S0 | Entorno listo | RDB aprueba estructura de staging · IT confirma VPN |
| **ESI** | Enviar a IT el pedido formal de **muestra (~300–600 correos: años, campañas y ruido distintos)** + especificación del perfil de solo lectura (EWS ApplicationImpersonation vs Full Access read-only vs Graph scoped) | S0 | Pedido + spec de acceso | **IT entregue muestra + cuenta antes del día 1 🔒** |
| **ESI** | Preparar el importador PST como plan B si IT no habilita conexión directa (nunca se borra/modifica la casilla) | S0 | Importador batch (respaldo) | IT define EWS vs PST |
| **EDI** | Armar planilla del golden set con validaciones (lista de clases, `email_id` única, campos obligatorios) y templates de prompts por campo v0 | S0 | Planilla + templates v0 | AF confirma campos de negocio |
| **ESI + EDI** | Reservar con IT y las áreas las sesiones del kickoff (día 1), contrato de salida (día 2) y etiquetado doble (días 3–9) | S0 | Calendario de sesiones | AF/RDB/IT confirman disponibilidad |
| **AF + SP** | Definir el **alcance acotado**: 2–3 campañas priorizadas a las que se emiten datasets en la ventana | S0 | Alcance firmado por SP | SP decide |
| **CMP** | Aprobar el esquema de datos y el tratamiento de PII (los datos no salen de la red) | S0 | Habilitación CMP 🔒 | — |

**Criterio de aceptación de S0:** al día 1 se puede leer la muestra, cargar la planilla del golden set y sentarse con las áreas **sin permisos pendientes**.

---

### Semana 1 — Baseline e ingesta (días 1–5)

> Se confirma el problema con datos reales, se aprueba el "examen" y se instala el primer tramo del pipeline leyendo la casilla real.

| Rol | Actividad | Días | Entregable | Quién valida |
|---|---|---|---|---|
| **EDI + AF + SP** | Kickoff (½ jornada): plan, roles, regla "nadie valida lo que produce". Workshop de taxonomía: por cada clase, definición operativa + 3–5 ejemplos reales + quién revisa. Regla de control: 8/10 coincidencia entre 2 personas del negocio, si no, se reescribe ahí mismo | Día 1 | **Esquema de clasificación (5 clases) y extracción (8 campos) firmados** | SP + RDB |
| **ESI + RDB** | Contrato de salida con BI: columnas, granularidad, periodicidad, publicación. Se firma el borrador configurable solo ante hallazgos de la muestra | Día 2 | **Contrato de salida firmado por BI** | RDB (formato) + AF (contenido) |
| **EDI** | Exploratorio "lectura de la casilla": correos por año/mes (valida ~50K), campañas, % ruido real, adjuntos, remitentes, incompletos | Días 1–3 | Tablas de frecuencias + **% útil real** | AF confirma con ojos de negocio |
| **ESI** | Conector EWS/Graph con **incremental + dedupe** (ItemId + SHA-256) y staging **append-only** en el repositorio corporativo; prueba con la muestra | Días 2–5 | Conector leyendo lote real sin duplicados | IT (accesos) + RDB (estructura) |
| **ESI** | Filtro determinístico de ruido SIN IA: OOO, bounces, spam, vacíos | Días 2–5 | Filtro v1 + bitácora | AF revisa detección sobre la muestra |
| **ESI** | Estructura esqueleto de la salida del dataset (CSV/vista BI) según el contrato del día 2 | Días 2–5 | Esqueleto de salida | RDB |
| **AF ×2 + EDI** | Arranque del **doble etiquetado** del golden set (~300 correos: clase + campos + confianza). EDI mide acuerdo entre etiquetadores (objetivo ≥ 0.8) | Días 3–5 | Primeras etiquetas con acuerdo medido | EDI (estadística) + AF (discrepancias) |

**Criterio de aceptación de S1:** lote real leído **sin duplicados y sin tocar la casilla**; **≥90% del ruido conocido de la muestra descartado**; documento de lectura con % útil real aprobado por el negocio.

---

### Semana 2 — Golden set completo, primer modelo y juez (días 6–12)

> Se completa el "examen" con el negocio, se logra la primera clasificación/extracción automática y se habilita la evidencia (normalización + lectura de la fuente corporativa).

| Rol | Actividad | Días | Entregable | Quién valida |
|---|---|---|---|---|
| **AF ×2 + EDI** | Completar el doble etiquetado (~300), resolver discrepancias con un tercero, medir acuerdo final | Días 6–9 | Golden set versionado | EDI (kappa ≥ 0.8) |
| **EDI** | División **70/15/15**; el **test queda congelado** bajo custodia de labIA, fuera de todo ajuste | Días 8–9 | **Test congelado** | EDI custodia · AF como contraloría |
| **EDI** | Redactar **prompt por campo** con formato JSON obligatorio (schema estricto); ejecutar clasificación/extracción sobre **train**; revisar casos mal clasificados con AF | Días 6–11 | Modelo v1 (Qwen2.5-7B/14B local) + prompts | AF (descripción de campos) + EDI (errores) |
| **EDI + AF** | Definir casos de zona gris e implementar el **juez de coherencia** (2º pase ~30%: formato, coherencia lógica). Si no confirma → `DUDOSO` → cola humana. Ajustar y **versionar umbrales** | Días 9–12 | Juez + umbrales versionados | AF (reglas y umbrales) |
| **EDI** | Correr pipeline sobre **validation** y reportar contra metas: **clasificación ≥ 90% · extracción ≥ 95% · derivación < 30%** (o gap documentado con plan de cierre) | Días 11–12 | Métricas sobre validation | AF contra el golden set |
| **ESI** | Reglas de **normalización** v1: trim, mayúsculas, sin tildes, formatos de cuenta/documento (ceros, guiones, espacios), versionadas | Días 7–10 | Reglas de normalización v1 | RDB contra la fuente |
| **ESI + RDB + IT** | **Adelantar el permiso de lectura de la fuente corporativa** (mínimo privilegio): RDB lo solicita el día 7, IT lo habilita, ESI confirma consulta real sin escritura | Días 7–10 | Consulta de lectura real funcionando al día 10 🔒 | IT + CMP + RDB |

**Criterio de aceptación de S2:** kappa ≥ 0.8; test congelado **fuera del alcance de todo ajuste**; 90/95/<30 sobre validation **o gap documentado con plan de cierre**; consulta de lectura real funcionando al día 10.

---

### Semana 3 — Cruce, examen final y datasets v1 (días 12–21)

> Se conecta la evidencia contra la fuente corporativa, se mide el piloto contra el **set que nadie miró** y se publican los primeros datasets.

| Rol | Actividad | Días | Entregable | Quién valida |
|---|---|---|---|---|
| **ESI** | **Cruce determinístico** contra la fuente corporativa (JOIN + normalización, sin IA): cada correo queda con evidencia `Coincide / No coincide / Requiere revisión` + motivo + `id_fila_que_valido` | Días 12–15 | Evidencia por correo | RDB (reglas) + AF (criterio de negocio) |
| **ESI + EDI + AF** | **Primer correo real de punta a punta**: conector → filtro → clasificación → extracción → normalización → cruce → dataset. AF confirma sentido de negocio | Día 15 | Caso real E2E validado | AF + RDB |
| **EDI** | **Examen final sobre el test congelado** (nadie lo miró). Reportar métricas finales (clasificación, extracción, derivación, cobertura). **El resultado reportado es el de la primera corrida honesta** | Días 16–18 | Métricas finales con versión | AF (contraloría cruzada) |
| **EDI + AF** | Revisión de la **cola humana**: ¿los casos dudosos son razonables? Tiempo por caso | Días 16–20 | Tiempo/caso documentado | AF |
| **EDI + IT** | Medir **cómputo real** de la muestra y dimensionar el despliegue local con IT (decision final de huella con dato real, no por preferencia). CMP confirma residencia local | Días 16–20 | Huella local confirmada (2/4/8–16 vCPU) | IT + CMP |
| **ESI + RDB** | Publicar **datasets v1 por campaña priorizada** en el formato firmado con evidencia por fila; ajustar desvíos del contrato | Días 18–21 | Datasets v1 firmados | RDB (formato) + AF (contenido) |

**Criterio de aceptación de S3:** un correo real recorrió todo el pipeline validado por el negocio; métricas finales sobre test reportadas contra un set congelado; datasets v1 en el formato firmado con evidencia por fila.

---

### Semana 4 — Lote, documentación, tablero y traspaso (días 22–28)

> Se consolida el despliegue: lote acotado procesado, documentación v1.0, tablero publicado y operación traspasada al negocio.

| Rol | Actividad | Días | Entregable | Quién valida |
|---|---|---|---|---|
| **ESI + EDI** | Procesar el **lote acotado** (correos útiles de las campañas priorizadas) con el pipeline final; datasets por campaña con evidencia por fila | Días 22–25 | Datasets por campaña de la ventana | RDB (contenido) + AF (negocio) |
| **ESI** | Documentación técnica v1.0: conector, staging, filtro, normalización y cruce, con versiones y checksums | Días 23–26 | Docs v1.0 en el repo de Aysa | IT + RDB |
| **EDI** | Documentación v1.0: esquema, prompts, juez y umbrales | Días 23–26 | Docs v1.0 | AF (criterios) |
| **EDI** | **Tablero de actividades/métricas**: leading (precisión, % derivación, tiempo/caso) + lagging (inconsistencias por origen, datasets entregados, horas liberadas) | Días 23–26 | Tablero publicado | RDB (calidad) + AF (contenido) |
| **EDI** | Informe de cierre con **3 escenarios** (pesimista/base/optimista) anclados en el baseline medido + registro de riesgos actualizado al resultado real | Días 26–28 | Informe de cierre | AF + RDB |
| **ESI + EDI + AF + SP** | **Show & tell** (datasets, tablero, evidencia, correo en vivo) · **traspaso de la operación** al área de datos/BI · firma del cierre · se listan desvíos si los hubo | Día 28 | Cierre firmado / operación traspasada | SP (firma) |

**Criterio de aceptación de S4:** lote procesado dentro de la ventana; documentación v1.0 aprobada y publicada; tablero publicado; traspaso documentado y firma del cierre.

---

## 4 · Vista por rol (qué le toca a cada uno en el mes)

### ESI — Integración y despliegue (C1–C5, C7, C8, C9)
1. **S0:** entorno VPN + staging + pedido de muestra/acceso a IT + plan B PST.
2. **S1:** conector con dedupe e incremental + filtro de ruido v1 + esqueleto de salida.
3. **S2:** normalización v1 + confirmar lectura de la fuente corporativa (días 7–10 🔒).
4. **S3:** cruce determinístico + primer correo E2E + datasets v1.
5. **S4:** lote acotado + documentación técnica v1.0 + soporte al show & tell.

### EDI — Datos e IA (C6, juez, golden set, routing, calidad)
1. **S0:** planilla golden set + templates de prompts v0.
2. **S1:** exploratorio "% útil real" + kickoff de taxonomía (day 1).
3. **S2:** split 70/15/15 + test congelado + modelo/juez sobre validation (90/95/<30).
4. **S3:** examen final sobre test (1ª corrida honesta) + cómputo real con IT + datasets v1 (vía cruce de datos).
5. **S4:** tablero + informe de cierre con 3 escenarios + registro de riesgos.

### AF (cliente) — contraparte de negocio
- **S0:** valida representatividad de la muestra; aporta alcance de campañas.
- **S1:** taxonomía (día 1) + arranque del doble etiquetado (días 3–5).
- **S2:** completa el doble etiquetado (días 6–9) + umbrales del juez.
- **S3:** contraloría del examen final + revisión de la cola humana.
- **S4:** valida datasets, contenidos y traspaso.

### RDB / IT / CMP / SP (cliente) — habilitan y validan
- **RDB:** estructura de staging (S0) · contrato de salida BI día 2 (S1) · solicita lectura DB día 7 (S2) · valida cruce y datasets v1 (S3) · aprueba docs y calidad (S4).
- **IT:** muestra + cuenta de solo lectura (S0, antes del día 1 🔒) · lectura DB (S2 🔒) · cómputo local real (S3) · revisión de documentación (S4).
- **CMP:** aprobación PII (S0) · residencia local confirmada (S3).
- **SP:** alcance acotado (S0) · aprueba esquema (S1) · hitos 10/20/28 · firma del cierre (S4).

---

## 5 · Coordinaciones con el cliente (dependencias de habilitación, no bloqueadores)

| Coordinación | Rol responsable | Para qué | Fecha límite | Si se demora |
|---|---|---|---|---|
| Muestra representativa + acceso de lectura (o export PST) | IT + CMP | S0 → S1 | **Antes del día 1** | Se corre el cronograma (escenario pesimista); no se arranca sobre supuestos |
| Sesiones de negocio: taxonomía (day 1) y etiquetado doble (días 3–9) | AF ×2 | S1 → S2 | Días 1–9 | El golden set se atrasa y el test congelado se mueve |
| Permiso de lectura de la fuente corporativa | RDB + IT | S2 (cruce día 12) | **Días 7–10** | El cruce se valida con datos de prueba, no reales |
| Aprobación CMP de residencia local / tratamiento PII | CMP | S0 y S3 | S0 · días 16–20 | No se cierra el dimensionamiento final |

---

## 6 · Decisiones abiertas internas con responsable (para arrancar el día 1)

| # | Decisión | Responsable | Se resuelve |
|---|---|---|---|
| 1 | Versión del modelo local para clasificación/extracción (`Qwen2.5-7B` vs `14B`) + familia potente para informes | EDI | Con la muestra real (S1) |
| 2 | Campos de la fuente corporativa disponibles para el cruce (tablas/permisos de lectura) | ESI + RDB | Días 7–10 (S2) |
| 3 | Perfil exacto de solo lectura de Exchange (EWS impersonation vs Full Access read-only vs Graph scoped) | ESI | S0 con IT |
| 4 | Rutas de salida (CSV/vista BI) y periodicidad | ESI + RDB | Contrato de salida, día 2 |
| 5 | Volumen real de cómputo y almacenamiento local | ESI + EDI + IT | Días 16–20 (S3), con el cómputo real de la muestra |