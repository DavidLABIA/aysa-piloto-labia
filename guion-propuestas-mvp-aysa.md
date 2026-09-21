# Guión — 4 propuestas MVP · Aysa · labIA

**Clasificación:** Confidencial — **uso interno del equipo labIA · Concentrix**. No se comparte con el cliente.
**Acompaña a:** `propuestas-mvp-aysa.html` (entregable visual) y `propuestas-mvp-aysa.md` (fuente).
**Evidencia de origen:** `research-proyectos-similares-aysa.md` y `arquitectura-labia-aysa.md`.
**Uso:** guion para presentar las 4 propuestas internamente / al Sponsor y para defender cada número ante preguntas. Cada pestaña del HTML tiene su bloque.

> **Reglas de fondo del discurso:** liderar con el **problema / costo de no hacer nada**, nunca con la tecnología · **nunca un solo número**: 3 escenarios (pesimista/base/optimista) · toda cifra **anclada en un baseline medible** · bajar el riesgo del "ask" aprobando **solo un piloto** · conocer al **stakeholder** · **registro de riesgos** con mitigación y responsable · **kill criteria** explícitos.

---

## 0 · Apertura (30 segundos, antes de mostrar las pestañas)

**Qué decir:**
«Tenemos un problema que hoy se paga en horas del área y en riesgo de gestión: los correos de campaña traen datos de contacto inconsistentes contra la fuente corporativa, y nadie puede reconstruir *de dónde salió* cada conclusión. La propuesta aprobada resuelve eso en 4 semanas, local, sin nube. Lo que traemos hoy no es una propuesta nueva: son **4 formas de llegar al mismo examen**, cada una optimizada para una prioridad distinta —seguridad, control fino, auditoría irrefutable o velocidad—. Las 4 comparten el mismo pipeline, las mismas 5 métricas y las mismas reglas intocables. Elegimos una sola.»

**El análisis detrás:**
- El **costo de no hacer nada** está documentado en `estrategias-aysa.md` (sección costo del statu quo). No se reabre acá: si preguntan, se deriva a ese documento.
- El **baseline técnico** que sí tenemos: ~50K emails históricos iniciales, % de utilidad a medir con la muestra real (referencia a calibrar ~70%). **Lo que no está medido se marca como pendiente** — no se inventa.

**Preguntas probables:**
- *«¿Otra vez una propuesta nueva?»* → No: es el mismo plan aprobado con 4 envoltorios de riesgo distintos; el examEN y las métricas no cambian.
- *«¿Por qué no una sola?»* → Porque la elección correcta depende de qué valora el Sponsor (auditoría vs velocidad). Presentar las opciones deja la decisión donde corresponde.

**Bloqueadores:** ninguno para abrir. Depende de la decisión #1 (elegir propuesta) para escribir el workbook.

---

## 1 · Pestaña Comparativa

**Qué decir:**
«Miren la tabla: las cuatro comparten duración base 4 semanas —salvo D, que es 3—, el mismo pipeline de 8 capas y los mismos 10 componentes. Lo único que cambia es **cuánto blindaje o cuánta velocidad compramos**, y a qué costo. Las cinco métricas del gate son idénticas en las cuatro: clasificación ≥ 90%, extracción ≥ 95%, derivación < 30%, cobertura ≥ 95% y evidencia 100% bloqueante. No hay una opción "con el examen fácil".»

**El análisis detrás del dato:**
- Los escenarios 3/4/6 (y 3/4/5 en C, 3/3/6 en D) salen de `plan-4-semanas-aysa.md`: lo que varía con la habilitación no es la calidad, es **cuántas campañas entran en la ventana**.
- Las horas de negocio (40–70 h en A/B; 60–100 h en C; 30–50 h en D) son **estimaciones de etiquetado**, no medidas: se confirman cuando AF define el tamaño del golden set. Baseline pendiente.
- La fila "stakeholder" es intencional: cada propuesta tiene un comprador distinto.

**Preguntas probables:**
- *«¿Cuál es más barata?»* → A/B comparten costo; C sube por horas de etiquetado (costo de Aysa, no de labIA); D baja por reuso pero sube el riesgo de acceso.
- *«¿La más rápida es la peor?»* → No es peor examen, es **menos cobertura** (2 campañas, set ~250). La calidad se mantiene; cambia el tamaño de la señal.

**Bloqueadores:** D2 (disponibilidad de 2 personas del negocio en los primeros 9 días) crece o baja según la opción.

---

## 2 · Pestaña Arquitectura

**Qué decir:**
«Esto es el sustrato común, y es importante que lo vean porque **no es una caja negra**. La tubería tiene 8 capas: ingesta desde Exchange en solo lectura, un filtro determinístico sin IA que saca ruido, la clasificación y extracción con un modelo local bajo schema estricto, un juez de segundo pase sobre la zona gris, normalización, el cruce **determinístico** contra la base corporativa —esto nunca lo hace la IA—, las salidas y el tablero, y un log de auditoría inmutable. La regla es simple: **la IA interpreta, el código confirma.** Todo corre en una VM Linux dentro de la VPN, con Qwen2.5 servido por vLLM u Ollama, PostgreSQL, y los secretos en el gestor de TI del cliente.»

**El análisis detrás del dato (herramienta por componente):**
- **C1 Ingesta:** EWS vía `exchangelib`/`ews-javascript-api`, o Graph API si M365; cuenta de servicio solo lectura. Plan B: export PST.
- **C3 Dedupe:** `ItemId` + `SHA-256` — reproducibilidad y trazabilidad de la relectura.
- **C6 IA:** Qwen2.5-7B/14B self-host; salida JSON forzada con Pydantic + Instructor. JSON inválido → revisión; nunca se persiste mal formado.
- **C8 Cruce:** SQL determinístico, registra `id_fila_que_valido` (la fila de la fuente que sustenta el estado).
- **Log:** cadena de hash SHA-256 encadenada (`hash_actual = SHA256(hash_previo + payload)`).
- **Huella:** 3 escenarios de cómputo (2 vCPU/8 GB; 4 vCPU/16 GB; 8–16 vCPU/32 GB). Son **referencia de despliegues on-prem previos de labIA** calibrada con la muestra real en días 16–20. **No se promete huella sin dato.**

**Preguntas probables:**
- *«¿Por qué no usar un modelo más potente?»* → Costo y residencia: el modelo vive en la VPN; Qwen2.5-7B/14B es el punto de equilibrio calidad/cómputo; en B evaluamos Qwen3 8B sobre validation.
- *«¿El log de auditoría lo puede editar alguien?»* → La cadena de hash hace detectable cualquier edición: si se toca una fila, todos los hashes posteriores no cierran.
- *«¿La IA decide la evidencia?»* → Nunca. El cruce es SQL puro. La IA solo clasifica y estructura texto.

**Bloqueadores:** D3 (permisos de lectura de la fuente corporativa, días 7–10); confirmación de cómputo con IT (días 16–20).

---

## 3 · Pestaña A — Base endurecido

**Qué decir:**
«Es la propuesta que ya está aprobada, sin sorpresas: mismo plazo, mismo alcance, mismas métricas. Solo le agregamos las protecciones de bajo costo que la industria comprobó: que una falla de la IA **nunca pierda un correo** (va a revisión con motivo), un **log a prueba de manipulación**, control de costo por corrida, y resistencia a instrucciones maliciosas dentro del correo. Elegí esta si tu prioridad es que nada se mueva de lo pactado.»

**El análisis detrás del dato (qué agrega sobre el plan base):**
- M4 safe-default · M5 límite diario + costo · M6 anti prompt-injection · M8 cap de tokens · M1-lite manifest con hash · M3-lite acuerdo por clase · M7 log encadenado.
- Son **funciones determinísticas, no IA**: se implementan en S2 sin tocar la validación.
- Las 5 métricas del gate **no cambian**: 90 / 95 / <30 / 95 / 100%.

**Preguntas probables:**
- *«¿Por qué agregar mejoras ahora?»* → Son aditivas y reversibles; eliminan objeciones de auditoría antes de que aparezcan. Si se prefiere el plan literal, se sacan sin impacto.
- *«¿Cuánto más trabajo?»* → Una tarde de ESI/EDI en S2; no toca el test ni las métricas.

**Bloqueadores / decisiones abiertas:** D1–D4 del plan · ¿se incorporan M1-lite/M3-lite sí o no?

---

## 4 · Pestaña B — Evidencia compuesta

**Qué decir:**
«El cambio más importante que proponemos: hoy la decisión de mandar un correo a revisión humana depende de la confianza cruda del modelo. Nosotros proponemos decidirla con un **score de evidencia compuesto**: 40% campos completos, 40% formato coherente, 20% señal del modelo. Es el patrón de los sistemas maduros: **la máquina no se 'habla' para pasar el gate, la aprobación la decide código**. No cambia el plazo ni el examen —baja la tasa de derivación y hace cada decisión explicable: *'este correo fue a revisión porque completó 40% de los campos y no matchó formato'*.»

**El análisis detrás del dato:**
- Fórmula: `score_evidencia = 0.40 × completitud_campos + 0.40 × coherencia_formato + 0.20 × señal_modelo`.
- Tres vías: ≥ umbral_alto → dataset; entre umbrales → `DUDOSO` (cola humana); < umbral_bajo → revisión manual.
- **Fuente:** afras23 (peso 40/40/20, 3 vías) + SYJ (gate en código).
- Pesos y umbrales los **aprueba AF** con criterio de negocio y se **versionan** por corrida. El cálculo vive en `scoring.py`, fuera del LLM.
- Métrica leading nueva: distribución de vías por corrida.

**Preguntas probables:**
- *«¿Complejidad en 4 semanas?»* → Función determinística dentro del juez que ya existe; el test congelado y las 5 métricas no cambian.
- *«¿Quién decide los pesos?»* → AF los aprueba (qué campos importan), EDI implementa; versionados y auditables.
- *«¿Y si empeora la derivación?»* → Se calibra en validation con plan de cierre; nunca se toca el test.

**Bloqueadores / decisiones abiertas:** D1–D4 + definir pesos y umbrales iniciales (EDI propone en kickoff, AF aprueba).

---

## 5 · Pestaña C — Examen irrompible

**Qué decir:**
«Esta opción sube el estándar del examen: **400 a 500 etiquetas** en vez de 300, congelamiento a prueba de manipulación con hash por registro, adjudicación explícita de cada disputa y acuerdo medido **por clase**, no solo global. El techo del acuerdo se mide y se ataca la causa —la definición— antes de correr el modelo. Si alguien tiene que creerle al número sin poder auditarlo, esta es la propuesta. El costo es más horas del negocio en los primeros 9 días y un pesimista de 5 semanas.»

**El análisis detrás del dato:**
- Golden set 400–500 (mín. 50 por clase/campaña), solapamiento medible 15–20% en vez de doble-etiquetado total.
- Freeze: `manifest.json` con SHA-256 por registro + digest + seed; copia sellada a Compliance/IT; el pipeline **solo acepta el test si `verify` da OK**.
- Acuerdo por clase: si `alpha_clase < 0.8` → reescritura de definición y re-etiquetado de la franja.
- **Fuentes:** Robylon (300–600; etiquetar el resultado, no la redacción) · 94spec (agreement antes de la métrica; adjudicación que no adivina; manifest con hash) · Encord/Koji (alpha y acuerdo por etiqueta).
- Horas de negocio: 60–100 h en ~9 días (estimación a confirmar con AF).

**Preguntas probables:**
- *«¿No alcanza con 300?»* → El rango de referencia es 300–600; 300 es el piso y funciona si una campaña domina. Con 2–3 campañas diferenciadas, 400–500 da celdas confiables.
- *«¿Quién paga las horas?»* → El negocio (costo real de Aysa), como ya pide el plan; acá son más, pero con solapamiento medible y dejan la base de operación (honeypots).
- *«¿Retrasa la entrega?»* → Base sigue 4; el pesimista pasa de 6 a 5 porque el solapamiento medible deroga el doble-etiquetado total.

**Bloqueadores / decisiones abiertas:** D1–D4 (D2 con más horas) + tamaño exacto por campaña (AF+EDI en S0/S1) + confirmar disponibilidad de las 2 personas días 1–9 (SP).

---

## 6 · Pestaña D — Fast-track 3 semanas

**Qué decir:**
«Si IT y Compliance confirman hoy mismo la muestra y el acceso directo, podemos cerrar el examen en **3 semanas** —no recortando validación, sino arrancando con todo listo y reutilizando los componentes que ya tenemos. Golden set de 250, dos campañas priorizadas, conector pre-armado. Si algo no llega a tiempo, **volvemos a la propuesta A sin perder nada**. Es la apuesta por la señal más rápida, y es un condicional con reversa automática, no un compromiso ciego.»

**El análisis detrás del dato:**
- Condición dura: EWS directo + muestra **antes del día 1**; si no, kill criterion de acceso días 1–3 → reversa a A.
- Reuso: conector EWS/Graph parametrizado (config + validación, no desarrollo), prompts v0 precargados, planilla golden set pre-validada.
- Golden set ~250 (piso del rango aceptable; piso absoluto ~200) con 1 campaña dominante.
- **Fuentes:** GIGAGPU (plantillas), SYJ (readiness checks), BootLabs (integrar con lo existente → caja pre-armada), 94spec (250 con celdas gruesas).
- Horas de negocio: 30–50 h (estimación a confirmar).

**Preguntas probables:**
- *«¿3 semanas alcanzan para el golden set?»* → 250 etiquetas con sesiones reservadas días 1–9 y doble etiqueta en el solapamiento medible; el test se congela día 8–9 y el examen corre en la semana 3.
- *«¿Y si IT no llega?»* → Kill criterion explícito: no arrancamos sobre supuestos; pasamos a A.
- *«¿Qué se pierde contra A?»* → Cobertura (2 campañas vs 2–3) y un test más chico. Se gana: señal una semana antes.

**Bloqueadores / decisiones abiertas:** D1 antes del día 1 (IT+Compliance en S0) · disponibilidad 2 personas días 1–9 · D3 adelantado. Decisión del Sponsor: «señal en 3 semanas» vs «cobertura y holgura».

---

## 7 · Pestaña Recomendación

**Qué decir:**
«Nuestra recomendación es **B+C**: el score compuesto de B como palanca de ruteo —que mejora el caso de negocio bajando la derivación— y el blindaje del examen de C —freeze con hash, adjudicación explícita, acuerdo por clase— que elimina la única objeción que puede tumbar la demo: *"¿y tu número de dónde sale?"*. Todo sobre la ventana base de 4 semanas. **D queda como anexo condicional**: si el Sponsor quiere señal en 3 semanas y IT confirma, se ejecuta D, pero con el score y el freeze ya incluidos, no los abandonamos por acelerar.»

**El análisis detrás del dato:**
- De A: 4 semanas, 5 métricas, rol idéntico, cero nube, pipeline de 8 capas.
- De B: score 40/40/20 en `scoring.py` versionado. Mayor impacto, menor costo, decisión explicable.
- De C: freeze hash-manifest + adjudicación + acuerdo por clase. Cuesta más horas de etiquetado, compra auditoría irrefutable.
- No cambia: roles, bloques semana a semana, contrato de salida, S0, operación, kill criteria, gate del día 28.

**Preguntas probables:**
- *«¿No es mucha complejidad para 4 semanas?»* → Son 2 adiciones aisladas (score + freeze), ambas determinísticas y reversibles. El examen no cambia.
- *«¿Por qué no ir directo a D?»* → Porque D depende de habilitaciones que hoy no están confirmadas. B+C no depende de un supuesto.
- *«¿Y si el Sponsor prioriza velocidad?»* → Se ejecuta D con B+C embebidos; la reversa a A es automática si el acceso no llega.

**Bloqueadores / decisiones abiertas:** decisión #1 (elegir propuesta) · pesos/umbrales si B · freeze si C · confirmación IT si D.

---

## 8 · Pestaña Decisiones (cierre)

**Qué decir:**
«Antes de escribir el workbook necesitamos seis definiciones. La primera es la más importante: **qué propuesta elegimos**. Si no hay señal contraria, nuestro default es escribir el workbook sobre **B+C con D como anexo condicional**. Las otras cinco son detalles de implementación con responsable asignado. Los kill criteria están vigentes en cualquier opción: desvío mayor a 6 semanas, adopción muy por debajo, precisión que no cierra ni con revisión, acceso nunca habilitado o costo fuera de rango —se corta con pérdida acotada al piloto y la decisión final la toma el Sponsor.»

**El análisis detrás del dato:**
- **6 decisiones abiertas** (#1 elegir propuesta; #2 tamaño golden set; #3 pesos/umbrales si B; #4 freeze si C; #5 confirmación EWS si D; #6 honeypots/re-muestreo post-gate).
- **Kill criteria** alineados con `estrategias-aysa.md` (señales de cortar/reestructurar).
- **Registro de riesgos de la decisión:** 5 riesgos con probabilidad/impacto, mitigación y responsable (complejidad percibida, horas de etiquetado, score mal calibrado, D que no arranca, re-etiquetado).

**Preguntas probables:**
- *«¿Qué pasa si elegimos y nos equivocamos?»* → Todas las propuestas revierten a A; la decisión es reversible y el downside está acotado al piloto.
- *«¿Quién decide?»* → El Sponsor de Aysa con el comité, sobre los números del informe. labIA recomienda, el cliente decide.

**Bloqueadores / decisiones abiertas:** las 6 de la tabla. Sin la #1 no se escribe el workbook.

---

## 9 · Registro de riesgos de la presentación (para el que presenta)

| # | Riesgo | Prob/Imp | Mitigación | Responsable |
|---|---|---|---|---|
| P1 | Que la audiencia lea "4 propuestas" como indecisión | Med/Med | Abrir con "son 4 caminos al mismo examen; recomendamos B+C" | liderazgo labIA |
| P2 | Que pidan números de costo en vivo | Med/Med | Derivar a `estrategias-aysa.md`; no prometer huella sin cómputo real de la muestra | EDI + ESI |
| P3 | Que confundan score compuesto con "más IA" | Med/Baj | Aclarar que es determinístico y fuera del LLM | EDI |
| P4 | Que el Sponsor elija D sin confirmar IT | Med/Alto | Mostrar kill criterion días 1–3 y reversa a A | Sponsor + IT |
| P5 | Que se objete el tamaño del golden set | Med/Med | Anclar en el rango 300–600 con fuente (Robylon) | AF + EDI |

## 10 · Kill criteria (vigentes en cualquier propuesta)
- Desvío > 6 semanas (o > 5 en C).
- Adopción > 50% bajo lo previsto.
- Precisión que no cierra ni con revisión.
- Muestra/acceso nunca habilitados.
- Costo operativo fuera de rango.

Cierre con **pérdida acotada al piloto** y documentación del aprendizaje.

---

## 11 · Bloqueadores / decisiones abiertas del entregable

1. **Elegir propuesta** (A / B / C / B+C / D) — labIA + Sponsor. **Bloquea el workbook.**
2. Tamaño del golden set (~300 vs 400–500) — AF + EDI.
3. Si B: pesos y umbrales del score — EDI propone, AF aprueba.
4. Si C: freeze-hash sobre el test — EDI.
5. Si D: confirmación de EWS + muestra con IT antes del día 1 — IT + CMP + Sponsor.
6. Post-gate: honeypots + re-muestreo trimestral — AF + EDI + RDB.

**Próximo paso propuesto:** con la decisión #1, escribir `workbook-despliegue-4-semanas-aysa.md` sobre B+C (D como anexo condicional).

---

**Referencias:** `propuestas-mvp-aysa.html` · `propuestas-mvp-aysa.md` · `research-proyectos-similares-aysa.md` · `arquitectura-labia-aysa.md` · `plan-4-semanas-aysa.md` · `estrategias-aysa.md`. labIA · Concentrix — uso interno, no compartir con el cliente.
