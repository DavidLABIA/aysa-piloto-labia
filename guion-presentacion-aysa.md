# Guión de la presentación — labIA · Concentrix para Aysa · Iniciativa de Calidad de Datos de Contacto

> **Cómo usar:** este guión es tu red de seguridad para la demo y la defensa ante Aysa. Por cada lámina te doy (1) el objetivo de la lámina, (2) qué decir (discurso casi literal), (3) el análisis detrás del dato (origen y cálculo de cada número), (4) posibles preguntas con respuestas fundamentadas, y (5) bloqueadores / decisiones abiertas. Léelo completo antes de presentar; usá la sección de cada lámina durante la defensa.

> **Duración sugerida del demo:** 15–20 minutos para las 17 láminas + 10–15 de preguntas. No detenerte en la lámina de agenda; detenerte donde el público mira.

> **Narrativa:** el camino es **una propuesta principal** — el **MVP (H1) desplegado en 4 semanas** para detectar inconsistencias en los datos de contacto usados en campañas y generar datasets + evidencias para las áreas de negocio — más una **opción de evolución (Enterprise)** con OCR documental y verificación multiprueba, que se muestra como contexto y no se pide aprobar hoy. No se detallan costos de token (aún no hay muestra real para estimarlos) y no se mencionan sistemas de origen por nombre: se habla de la **casilla Exchange on-prem** (red bajo Ley 25.326), la **fuente de datos corporativa** (base de datos relacional) y las **áreas de negocio** (Dirección Comercial, Comunicaciones, Business Intelligence, Calidad de Datos).

> **Novedad respecto a la versión anterior:** el MVDP se **comprime de 8–12 semanas a 4 semanas** (base 4 · optimista 3 · pesimista 6) sin comprimir la validación: con **pre-arranque en paralelo** (muestra y acceso ANTES del día 1), **MVP acotado** (campañas priorizadas en la ventana, golden set completo igual), **paralelización de tracks ESI/EDI** y **contrato de salida con BI firmado en el kickoff**. Alineamos el **baseline de volumen a ~50K emails históricos iniciales** (acumulado de varios años; el flujo recurrente es bajo) — las versiones anteriores citaban ~60K en el plan operativo y ~23K en el business case: la muestra real zanja la discrepancia. El plan semana a semana pasa a láminas de **pre-arranque + semanas 1–2** y **semanas 3–4**. Se mantienen los cambios de fondo: sin sistemas de origen por nombre, sin SAP/SQL Server/Marketing Cloud (el RPA solo se propone como opción posterior de Enterprise), y sin estimaciones de costo/token (se definen tras analizar una muestra representativa de correos).

---

## Reglas generales de defensa (aplican a toda la demo)

**Lidera con el problema, no con la tecnología.**
1. Abre con "datos de contacto que llegan mal y se detectan tarde", no con "usamos un LLM". La tecnología (modelo, schema, pipeline) aparece recién en la lámina de arquitectura.
2. **Nunca des un solo número:** siempre rangos o 3 escenarios (pesimista / base / optimista) con su supuesto. Un número suelto invita a ser impugnado; un rango con su supuesto es defendible.
3. **Toda cifra ancla en un baseline medible:** ~50K emails históricos iniciales (y flujo recurrente bajo), tasa de "no es mi cuenta", horas manuales de revisión actuales. Los tres se calibran con la muestra real en la semana 1. Si preguntan "¿de dónde sale?", la respuesta correcta es el supuesto + cómo lo validamos, no una certeza inventada.
4. **Baja el riesgo del ask:** se pide aprobar solo **H1 (el piloto MVP, desplegado en 4 semanas)**. El peor escenario de Aysa es perder solo el presupuesto del piloto. Ese es el argumento que cierra.
5. **Conocé a tu audiencia:**
   - **CFO** → costo acotado del piloto, valor de evitar el re-procesamiento y reclamos por contacto mal dirigido, plazo de 4 semanas como "primera señal".
   - **CIO / IT** → corre dentro de la VPN, conecta Exchange con mínimo privilegio, no toca los sistemas de origen, y la velocidad se apoya en que IT habilite muestra/acceso ANTES del día 1.
   - **CEO** → datos de contacto confiables = menos fricción con el cliente y menos riesgo reputacional.
   - **Dirección Comercial / Comunicaciones** → datasets por campaña para decidir con evidencia y corregir el proceso de origen.
   - **Compliance / Legal** → Ley 25.326, PII, DPA: el guión del riesgo R2 lo cubre.
6. **Tené el registro de riesgos a mano** (lámina 13): cada objeción de compliance o de negocio se responde con una fila del registro, no con improvisación.

---

## Detalle transversal: el pipeline completo (leé esto antes que las láminas)

Todo lo que se muestra en la demo es una sola tubería (pipeline) de 4 pasos. Si entendés esto, cualquier lámina se defiende sola:

**Paso 0 · Preparación (previo a cualquier arranque)**
- Pedir **muestra real de la casilla** (permisos de solo lectura, vía IT) — en el plan de 4 semanas esto ocurre en el **pre-arranque, ANTES del día 1**.
- **Análisis exploratorio:** volumen por año, campañas identificables, formatos de adjuntos, porcentaje de ruido real.
- **Definir la taxonomía de clasificación con las áreas:** `CONFIRMA · NO_ES_MIA · DUDOSO · OPTOUT · IRRELEVANTE` (qué significa cada una y qué se hace con cada salida).
- **Construir el golden set** (~300 emails etiquetados junto a las áreas). Es el "examen" contra el que se miden las métricas de precisión.

**Paso 1 · Ingesta desde la casilla**
- Conector dentro de la **VPN de Aysa** leyendo la casilla Exchange (EWS/Graph) o importando desde un archivo **PST** como respaldo.
- **Incremental con dedupe** (ID + hash del mensaje) para no reprocesar lo ya visto.
- Volcado a **staging en el repositorio corporativo de datos** (append-only, con fecha de proceso y checksum de integridad).

**Paso 2 · Clasificación y extracción**
- El caso es principalmente **texto**: modelo liviano con **schema estricto** y **prompt por campo** (patrón Instructor/DocInfo) según la estructura de salida definida con las áreas.
- Primero un **filtro determinístico** (reglas de código, sin IA): saca bounces, out-of-office, spam y vacíos sin gastar cómputo del modelo.
- **Juez de validación** (~30% de los casos): un segundo pase verifica que la salida sea coherente; si no concuerda, pasa a revisión humana.

**Paso 3 · Verificación contra la fuente corporativa**
- Cruce **determinístico** (sin LLM) contra la **base de datos relacional corporativa**.
- Lógica de evidencia: `Coincide · No coincide · Requiere revisión` — la herramienta **nunca decide por sí sola**.
- Esto es lo que previene fraude y suplantación: la IA clasifica y extrae; la evidencia la aporta el cruce.

**Paso 4 · Datasets y evidencias**
- Estructura de salida **definida con BI y las áreas** — en el plan de 4 semanas se firma en el **kickoff (día 2)**, no al final.
- **Datasets por campaña** + rastro de evidencia por email para el análisis posterior.

**Decisión de despliegue (lámina 12):**
- **Self-host dentro de la VPN:** modelos ligeros (Qwen2.5-7B/14B). Los datos nunca salen de la red; cumple Ley 25.326 sin transferencia de PII.
- **Cloud con DPA:** gpt-5-mini / gemini-3-flash. Más simple de operar, pero la PII sale de la red bajo contrato (DPA + retención aprobadas).
- Recomendación honesta: **probar ambos en el piloto con la muestra** y decidir con datos, no por preferencia. Las **estimaciones finales de costo se hacen luego del análisis de una muestra representativa** de correos.

---

## Lámina 1 — Portada

**Objetivo de la lámina:** posicionar quién habla, qué se propone y qué se promete, en menos de 60 segundos.

**Qué decir:**
> "Soy [nombre], del labIA de Concentrix. Trabajamos en la iniciativa de Calidad de Datos de Aysa: detectar inconsistencias en los datos de contacto que usan las campañas de comunicación, generar datasets y evidencias para las áreas de negocio, y alimentar la mejora de los procesos de origen. Hoy les traemos el camino concreto para hacerlo: un MVP acotado que dejamos **desplegado en 4 semanas**."

**Análisis del dato (detrás de cada número):**
- `~50K Emails históricos · inicial` → volumen acumulado en la casilla al momento de arrancar (varios años de campañas; el flujo recurrente desciende a un ritmo muy bajo). Es una **estimación a calibrar con la muestra**; el diseño no depende del número exacto, pero el plan de cómputo sí. (Antecedentes internos: ~60K en el plan operativo, ~23K en el business case — la muestra real zanja la discrepancia.)
- `Texto` → el contenido principal del caso son correos de campaña: no se necesitan modelos complejos ni OCR en el MVP. Es la razón por la que el piloto es barato y rápido.
- `Evidencia · No decide: sustenta` → el posicionamiento clave: la herramienta **clasifica y extrae**, la evidencia la aporta el **cruce con la fuente corporativa**, y la decisión final es del **área responsable**. Es la respuesta preventiva a compliance.
- `4 sem · MVP · despliegue acotado` → el plazo del H1 (lámina 14). Se campaña con "shrink the ask": es lo único que pedimos aprobar hoy, y con la promesa de una **primera señal en 4 semanas**.

**Preguntas probables:**
- *"¿Ya tenemos algo funcionando?"* → No todavía: lo que traemos es la propuesta para validar con una muestra real y arrancar el despliegue. Es una ventaja: no hay código heredado ni deuda técnica.
- *"¿Cómo piensan desplegar en 4 semanas?"* → Con tres palancas: pre-arranque en paralelo (Aysa habilita muestra y acceso antes del día 1), MVP acotado a campañas priorizadas, y dos tracks de labIA (integración y datos/IA) avanzando en paralelo desde el día 1. Lo que **no** se comprime es la validación: el golden set completo y las 5 métricas son las mismas. Si falta habilita algún insumo, el escenario pesimista es de 6 semanas, con la misma validación.

**Decisiones abiertas:** confirmar volumen real de la casilla y el rango de campañas activas (afecta cómputo y calendario), y el alcance acotado (campañas priorizadas) que aprueba el Sponsor.

---

## Lámina 2 — Agenda

**Objetivo:** marcar el recorrido y fijar expectativa de tiempo. No detenerse.

**Qué decir:**
> "Recorremos 9 puntos: contexto y problema de negocio, objetivo, rol de la solución, arquitectura, la propuesta MVP con su despliegue en 4 semanas, la opción Enterprise, modelos de IA, y por último riesgos, métricas y go/no-go. Cierra la ronda de preguntas. Son 17 láminas en total."

**Análisis:**
- La agenda narra un arco deliberado: **problema → objetivo → rol → arquitectura → solución → confianza (riesgo/métrica) → decisión**. Primero se vende el problema, después la solución, al final el "cómo" y el riesgo.
- Los puntos 07 y 08 juntos son la sección de **confianza**: cómo se mitiga el riesgo y cómo se mide el éxito.

**Procedimiento:** leer los 9 puntos en ~10 segundos, sin detalle. Si el público quiere saltar a un tema, decírselo en qué número está para que lo ubiquen.

---

## Lámina 3 — El problema

**Objetivo:** esta es la lámina más importante. Vende el costo de no hacer nada. Si no se siente el problema acá, el resto no se sostiene.

**Qué decir:**
> "Las campañas se apoyan en múltiples orígenes de datos y en procesos manuales que pueden introducir errores. Hoy esos errores se detectan tarde —cuando el usuario responde 'no es mi cuenta'— y no se sabe en qué paso se generó el dato incorrecto. El costo de no hacer nada no es cero: es re-procesamiento, reclamos de clientes que reciben comunicación de una cuenta que no es suya, y horas de gente revisando a mano."

**Análisis del dato (origen y cálculo):**
- **Múltiples orígenes de datos** → las campañas se alimentan desde distintas fuentes y formatos; la casilla mezcla respuestas de todas. Hoy no hay separación por campaña.
- **Procesos manuales** → carga y validación a mano, sin control de origen: es ahí donde el dato incorrecto entra al circuito.
- `"No es mía"` → la señal observable: el email no corresponde a la cuenta asociada en la campaña. Cada aparición es un **evento medible** (baseline del problema).
- **Origen sin identificar** → el dato incorrecto se conoce tarde y no se sabe dónde se generó: no se puede corregir la causa, solo apagar incendios.
- **Volumen de referencia** → ~50K emails acumulados; si el ruido real es ~70% de utilidad, quedan ~35K generadores de trabajo manual de 4–8 minutos cada uno. Son órdenes de magnitud **a calibrar con la muestra** en la semana 1.

**Análisis del callout "De qué trata esta propuesta":**
- La propuesta **no** promete "decisión automática": promete **detectar inconsistencias** y generar **insumos** para que las áreas responsables corrijan los **procesos de origen**. Esa es la concesión de humildad que desarma la objeción "no nos confiamos a un algoritmo".

**3 escenarios para el costo de no hacer nada (usar solo si preguntan por cuantificación):**
- **Pesimista:** los errores crecen con el volumen de campañas; cada campaña nueva re-propaga los datos mal cargados; el reproceso y los reclamos suben sin freno.
- **Base:** el error se sigue detectando solo por el boca a boca del cliente; el equipo rectifica a mano; la incidencia no baja.
- **Optimista:** el volumen útil real es chico y el error es marginal. Aun así, el piloto relevará los tres escenarios con la muestra y decidiremos con dato.

**Preguntas probables:**
- *"¿Cuánto nos cuesta hoy no hacer nada?"* → No es solo plata: es dato muerto en una casilla que nadie ordena, riesgo de contacto mal dirigido (molestia, reclamos, posible afectación reputacional) y horas de equipo en tareas repetitivas. El costo del piloto es chico y acotado; el costo de no hacer nada es estructural y se acumula con cada campaña.
- *"¿Cómo saben que el problema existe?"* → Porque el propio flujo lo produce: la casilla acumula respuestas de muchas campañas y el dato de contacto se confirma o se corrige a mano. La primera semana del piloto medimos el baseline real (volumen, tasa de 'no es mía', horas manuales).
- *"¿Esto lo hace gente hoy?"* → Sí: es parte del trabajo operativo de la casilla. La propuesta no elimina personas, elimina la tarea repetitiva; la persona pasa a revisar los casos dudosos con más contexto.

**Decisiones abiertas:** baseline de horas manuales y tasa actual de "no es mi cuenta" (que Aysa confirme si quiere el "antes vs después" para el informe); el volumen exacto (~50K) se calibra con la muestra.

---

## Lámina 4 — El objetivo

**Objetivo:** definir qué SÍ logra la solución y para quién, y fijar expectativas realistas.

**Qué decir:**
> "El objetivo es detectar inconsistencias y su origen. Para eso clasificamos cada email —CONFIRMA, NO_ES_MIA, DUDOSO, OPTOUT, IRRELEVANTE—, extraemos los campos clave —email, cuenta o contrato, nombre, dirección, teléfono, documento y tipo, relación con el titular y titular—, cruzamos contra la fuente de datos corporativa y entregamos datasets por campaña con evidencia, para que las áreas decidan."

**Análisis del dato (cada clase y qué se hace):**
- `CONFIRMA` → la persona está de acuerdo / el dato de contacto corresponde → pasa a la lista válida de la campaña.
- `NO_ES_MIA` → el contacto no corresponde a la cuenta → no es un error del cliente, es **información válida para evitar contacto indebido** y para rastrear dónde se generó el dato.
- `DUDOSO` → no se puede determinar sin revisión → **va a humano** (nunca se fuerza a la máquina a decidir).
- `OPTOUT` → pide baja → se registra y se respeta (implica cumplimiento de preferencias).
- `IRRELEVANTE` → ruido o no accionable → se descarta del dataset.
- La taxonomía se define y confirma **con las áreas**; si Aysa tiene clases propias, se ajusta el schema en el kickoff. Nunca la inventa labIA solo.

**Análisis de los destinatarios (áreas de negocio):**
- **Dirección Comercial** → ve qué campañas tienen datos de contacto inconsistentes y dónde.
- **Comunicaciones** → usa los datasets para no mal-comunicar a titulares equivocados.
- **Business Intelligence** → consume datasets limpios y evidencia reproducible.
- **Calidad de Datos** → recibe el insumo para corregir el **proceso de origen** (la causa, no solo el dato puntual).
- Cada área recibe lo que necesita para **decidir y corregir la fuente**, pero la decisión y la corrección quedan en ellas.

**Preguntas probables:**
- *"¿8 campos extraídos de cada mail? ¿Y si falta alguno?"* → El schema es estricto pero tolerante: los campos ausentes se marcan y el caso pasa a `DUDOSO`. Nunca se inventa un valor.
- *"¿Cómo saben que el email es de quién dice ser?"* → Nunca por el LLM: se cruzan los datos extraídos contra la fuente corporativa y, si no pasa el umbral, va a revisión humana. La confirmación es un proceso determinístico, auditado.

---

## Lámina 5 — Rol de la solución

**Objetivo:** dejar explícito qué hace y qué NO hace la herramienta. Mata la objeción "¿un algoritmo va a decidir por nosotros?".

**Qué decir:**
> "Quiero ser explícito en el rol. La herramienta clasifica correos, extrae información, genera datasets por campaña, aporta evidencias y facilita el análisis posterior. Lo que NO hace: no corrige ni modifica datos automáticamente, no es un sistema que toma decisiones, no confirma titularidad solo por el modelo —el cruce con la fuente corporativa aporta la evidencia— y no reemplaza Exchange ni los procesos actuales. La decisión y la acción correctiva quedan en las áreas responsables."

**Análisis de cada "qué NO hace":**
- **No corrige ni modifica** → desactiva la preocupación de "nos van a tocar el padrón".
- **No es un sistema que decide** → la responsabilidad queda en humanos: es una herramienta de **evidencia**, no de **autoridad**.
- **No confirma solo por el modelo** → el cruce determinístico contra la fuente corporativa es el que aporta la evidencia. Esto previene fraude/suplantación y errores bajo Ley 25.326.
- **No reemplaza Exchange ni los procesos actuales** → reaseguro de "no asusta": se apoya en lo que ya existe.

**Preguntas probables:**
- *"¿Quién valida lo que el sistema devuelve?"* → El analista funcional / referente de negocio define la taxonomía y valida el golden set; el juez y la revisión humana cubren los casos dudosos. Cada resultado tiene dueño de validación.
- *"¿Entonces para qué sirve si no decide nada?"* → Para que la decisión sea mejor y más rápida: ordena la casilla, detecta dónde se origina el error y le da a cada área la evidencia que hoy no tiene.

---

## Lámina 6 — Arquitectura

**Objetivo:** mostrar que hay un flujo claro de 4 pasos, entendible y defendible, y fijar la "regla de oro".

**Qué decir:**
> "La arquitectura es un flujo de 4 pasos. Uno: ingesta desde la casilla —un conector dentro de la VPN lee Exchange por EWS o Graph, o importamos desde un archivo PST, con dedupe e incremental, y staging en el repositorio corporativo de datos. Dos: clasificación y extracción —el caso es texto, usamos un modelo liviano con schema estricto y prompt por campo según la estructura definida con las áreas. Tres: verificación contra la fuente corporativa —cruce determinístico; la evidencia es Coincide, No coincide, o Requiere revisión. Cuatro: datasets y evidencias —la estructura de salida se define con BI y las áreas, dataset por campaña con el rastro de cada email."

**Análisis de cada paso (por qué está diseñado así):**
- **1 · Ingesta** → vive dentro de la VPN (Ley 25.326). La alternativa PST es el respaldo si IT no habilita conexión directa en el plazo del despliegue (riesgo R3).
- **2 · Clasificación** → separa el filtro determinístico (ruido, barato) del modelo (texto fino). `Instructor/DocInfo` = salida validada por schema, no texto libre.
- **3 · Verificación** → un proceso determinístico sin IA: la evidencia es reproducible y auditable. Es el corazón de la regla anti-fraude.
- **4 · Salida** → "contrato de datos" con BI: si el formato se definió en el **kickoff (día 2)** en lugar de al final, el dataset se consume sin retrabajo (riesgo R6). Es uno de los ejes del plazo de 4 semanas.

**Análisis del callout "regla de oro":**
- La herramienta **clasifica y extrae**; la evidencia la aporta el **cruce**; la decisión final es del **área responsable**. Esa división es lo que hace la propuesta defendible ante compliance, ante IT y ante el negocio a la vez.

**Preguntas probables:**
- *"¿Por qué cruzar contra la base y no confiar en el modelo?"* → Porque la confirmación de titularidad bajo Ley 25.326 no puede depender de una probabilidad: el cruce determinístico da una evidencia reproducible que audita quién, cuándo y contra qué fila se validó.
- *"¿Y si Exchange pasa a Microsoft 365?"* → El mismo patrón funciona con Graph API. El diseño es agnóstico del canal de conexión.

**Decisiones abiertas:** confirmar los campos de la fuente corporativa disponibles para el cruce y las tablas/permisos de lectura.

---

## Lámina 7 — Propuesta MVP · Despliegue en 4 semanas

**Objetivo:** vender que con poco se resuelve el problema hoy — y rápido. Es EL pedido de la reunión.

**Qué decir:**
> "El MVP detecta inconsistencias ya: clasificación y extracción de texto de la casilla, cruce con la fuente corporativa y generación de datasets más evidencias por campaña. Lo dejamos desplegado en **4 semanas** —base de 4, pesimista de 6 y optimista de 3 con EWS y muestra listos al día 1— con un alcance acotado: en la ventana procesamos las campañas priorizadas que acuerden con el Sponsor, y el resto se agrega después del go/no-go con el mismo motor. El camino tiene 5 bloques: pre-arranque en paralelo (Aysa habilita muestra y acceso antes del día 1), baseline e ingesta, golden set + modelo + juez, cruce + examen final + datasets v1, y lote acotado + informe + traspaso. La validación no se comprime: el golden set completo y las 5 métricas son las mismas."

**Análisis del dato (cada card del bloque derecho):**
- **Duración 4 semanas** → el detalle semana a semana con tareas y responsables va en las láminas 8–9. En la lámina 7 solo se expone el mensaje de "corto, acotado y medible" y los escenarios (base 4 · pesimista 6 · optimista 3). El optimista depende de que EWS y la muestra estén listos al día 1.
- **Contenido: Texto** → sin OCR de adjuntos. Esto es lo que hace el MVP barato y rápido. Los adjuntos quedan para la **opción Enterprise** (lámina 10): OCR documental, evaluación con datos reales.
- **Modelo: Liviano** → corre self-host (VPN) o cloud con DPA. No requiere infra pesada.
- **Decisiones: Áreas** → la herramienta sustenta; el área decide. Coherente con la lámina 5.

**Análisis de los 5 bloques (cómo leerlos):**
- El bloque **0 (pre-arranque)** es la condición de entrada: muestra y acceso antes del día 1. El **1–2** son el baseline y el corazón de IA. El **3** es la evidencia y el examen final. El **4** es la entrega y el gate. Ese orden es el del plan semana a semana (láminas 8–9).

**Preguntas probables:**
- *"¿Por qué tan rápido y tan acotado?"* → Para validar la clasificación real contra la casilla con mínimo riesgo y dar la primera señal en 4 semanas. Si no funciona, la pérdida es pequeña y acotada al piloto. Si funciona, el mismo motor se reutiliza para la opción Enterprise y para más casillas.
- *"¿Y si no llegan a los 4 semanas?"* → El escenario pesimista es de 6 semanas y está contemplado: lo que se mueve es la fecha de despliegue, nunca la calidad del examen. La regla es "nunca se comprime la validación".
- *"¿Procesan adjuntos (facturas, comprobantes)?"* → No en el MVP: el caso actual es texto de campañas. La capacidad documental (OCR) está en la opción Enterprise (lámina 10), y se evalúa con datos, no por ahora.

**Decisión abierta:** ¿aprueban H1 (MVP de 4 semanas)? Es EL ask de la reunión.

---

## Lámina 8 — Plan de despliegue · Pre-arranque y semanas 1–2

**Objetivo:** mostrar que el arranque tiene pasos claros, medibles y con responsables — y que el plazo se gana con habilitaciones tempranas, no con recortes. Transmite "esto se puede validar", no "vamos a ver".

**Qué decir:**
> "El plan arranca antes del día 1. Pre-arranque, en paralelo: Aysa habilita la muestra real y el acceso de lectura —esa es la condición de entrada— mientras labIA prepara el entorno en la VPN, el staging y la planilla del golden set. Semana 1: kickoff con la taxonomía aprobada por las áreas, el contrato de salida firmado con BI, el exploratorio que mide el volumen real —alrededor de 50 mil emails iniciales— y el porcentaje de correos útiles, y el conector leyendo la casilla con dedupe y staging; arrancan las primeras etiquetas del golden set. Semana 2: cerramos el golden set completo, con doble etiquetado y el test congelado bajo llave; armamos los prompts por campo, corremos el primer modelo, implementamos el juez y ajustamos umbrales; y adelantamos la normalización más el acceso de lectura a la base corporativa, para que la evidencia esté lista antes del examen final. En cada semana alguien entrega y alguien valida, siempre personas distintas."

**Análisis del dato (cada semana y por qué importa):**
- **Pre-arranque · Semana 0** → es la palanca central del plazo: muestra y acceso ANTES del día 1 (D1). Si D1 no está al momento del kickoff, el cronograma se mueve entero (pesimista); no se arranca sobre supuestos.
- **S1 · Baseline e ingesta** → mide el % útil real y firma el contrato de salida con BI en el kickoff (el adelanto del riesgo R6). El conector ya lee la casilla real sin tocar nada.
- **S2 · Golden set, modelo y juez** → el negocio define qué significa cada clase: el "examen" es de Aysa, con split 70/15/15 y test congelado. El juez es el segundo control de los casos grises y aquí se mide contra las metas (90 / 95 / <30). El acceso a la base corporativa se adelanta de la semana 7 a la 2 — la velocidad se compra con habilitaciones, no con calidad.
- Contrato de salida → clausura el formato antes del primer dataset: elimina el retrabajo en caliente.

**Preguntas probables:**
- *"¿Y si la muestra no está lista en el pre-arranque?"* → El despliegue se replanifica al escenario pesimista: no arrancamos sobre supuestos. Es el kill criterion de acceso de la lámina 15.
- *"¿Quién valida que el golden set esté bien hecho?"* → Doble etiquetado por parte del negocio (dos personas etiquetan por separado) + medición del acuerdo entre etiquetadores (≥ 0.8) + resolución de discrepancias con un tercero.
- *"¿Cómo alcanza el tiempo para el golden set completo en 9 días?"* → Porque las sesiones de etiquetado se reservan y ejecutan en el pre-arranque/kickoff (días 3–9) con dos personas del negocio en paralelo, mientras los tracks de integración avanzan por su lado. No se recorta: se agenda y se paraleliza.

**Decisiones abiertas:** fecha de disponibilidad de muestra/acceso (D1) y confirmación de las personas del negocio para el etiquetado (días 3–9).

---

## Lámina 9 — Plan de despliegue · Semanas 3–4

**Objetivo:** cerrar el plan con la parte que genera la evidencia, el examen final y la entrega desplegada.

**Qué decir:**
> "En las semanas 3 y 4 se produce la evidencia y la entrega. Semana 3: hacemos el cruce determinístico —Coincide, No coincide o Requiere revisión— contra la base corporativa, mostramos un correo real resuelto de punta a punta, corremos el examen final sobre el set de test que quedó congelado en la semana 2, revisamos la cola humana y decidimos self-host o cloud con el cómputo real; y ya publicamos los primeros datasets por campaña. Semana 4: procesamos el lote acotado de las campañas priorizadas con el pipeline final, generamos los datasets con evidencia, documentamos todo, armamos el tablero, cerramos la validación contra las 5 metas y preparamos el informe de go/no-go con 3 escenarios. El cierre es show & tell, traspaso al área de datos y firma. Escenarios: base 4 semanas; optimista 3 si EWS y la muestra están listos al día 1; pesimista 6 si el acceso se demora o el golden set exige re-etiquetado. Los desvíos se absorben en el escenario pesimista; nunca se comprime la validación."

**Análisis del dato (cada semana y por qué importa):**
- **S3 · Cruce, examen final y datasets v1** → la confianza no depende de la IA: la evidencia la da un cruce determinístico contra los datos de Aysa, reproducible y auditable. El examen final mide contra el set congelado en la semana 2 (nadie lo miró). Acá también se decide self-host vs cloud con el cómputo real de la muestra.
- **S4 · Datasets, informe y traspaso** → datasets + evidencias + documentación versionada + tablero, procesando el lote acotado (campañas priorizadas). El informe siempre trae 3 escenarios (pesimista / base / optimista) anclados en el baseline medido; el gate lo preside el Sponsor.
- **El compromiso de la fecha** → H1 desplegado a fin de la semana 4 con la operación traspasada; el resto del histórico se emite post-go/no-go con el mismo motor (el alcance acotado es una restricción de ventana, no de capacidad).

**Preguntas probables:**
- *"¿Qué pasa si en el examen final no se llega a la meta?"* → Se reporta el gap con plan de cierre. Si no se cierra ni con revisión, se activa el kill criterion de precisión de la lámina 15.
- *"¿Por qué 6 en el pesimista y no 4?"* → Porque el plan contempla el imprevisto dentro del rango 3–6: comprometer la fecha sin sorpresas exige nunca comprimir la validación.
- *"¿Los datasets de todas las campañas se entregan el día 28?"* → En la ventana, no: se entregan los de las **campañas priorizadas** del alcance acotado. El resto se agrega después del go/no-go con el mismo motor y costo marginal bajo.

**Decisiones abiertas:** resultado del cruce sobre datos reales (depende de D3, adelantado a los días 7–10) y decisión self-host vs cloud (días 16–20).

---

## Lámina 10 — La opción Enterprise

**Objetivo:** mostrar la evolución sin pedirla. Enterprise se presenta como **opción**, no como parte del ask de hoy, y esta vez explica mejor **qué problema resuelve** (los casos con adjuntos que el texto no alcanza) y agrega el **RPA como opción posterior**.

**Qué decir:**
> "Enterprise es la misma base del MVP, ampliada, y resuelve lo que el texto solo no alcanza: los adjuntos y comprobantes. Con OCR, el documento pasa a ser la segunda señal de titularidad, y con verificación multiprueba —email más documento más fuente corporativa— bajamos la cantidad de casos que quedan 'requieren revisión'. En el plano operativo, Enterprise deja la evidencia integrada al día a día: dashboard en vivo y cola de revisión para las áreas. Alcance: de 12 a 16 semanas después del MVP, con más mantenimiento porque los formatos de los comprobantes cambian. Adicionalmente proponemos, como etapa posterior y opcional, el RPA: automatizar el último tramo —detectada la inconsistencia, generar la solicitud de corrección o actualizar la fuente de origen en los sistemas que Aysa ya opera— pero solo si el cliente ya tiene RPA; no es parte del MVP ni del pedido de hoy. Lo importante: Enterprise reutiliza la arquitectura de 4 pasos del MVP —el MVP de 4 semanas es el primer escalón real— y tiene su propio go/no-go. Nada de Enterprise bloquea H1."

**Análisis de cada card:**
- **Qué resuelve** → OCR de adjuntos y comprobantes (segunda señal de titularidad), verificación multiprueba (menos casos "requieren revisión") y cobertura de los correos con adjunto que el MVP deja señalados. Es la evolución sobre el motor del MVP.
- **Qué implica** → 12–16 semanas después del MVP; mantenimiento mayor (los formatos de comprobantes cambian y exigen re-ajustar el OCR); costos a estimar con muestra real (sin estimaciones a priori); entrega integrada con dashboard en vivo y cola de revisión.
- **RPA opcional (posterior)** → automatiza el **último tramo**: con la inconsistencia ya detectada y evidenciada, generar la corrección o actualizar la fuente de origen en los sistemas que Aysa ya opera. Se propone **solo condicionado a que el cliente ya tenga RPA**, con su propia evaluación y go/no-go. Es una etapa anterior en la gestión del riesgo, no una promesa.
- **Relación con el MVP** → comparte la arquitectura; el MVP es el escalón que lo valida; go/no-go propio.

**Análisis del callout:**
- "Hoy solo se aprueba H1; Enterprise y el RPA se evalúan con su propio go/no-go." Es la píldora de **shrink the ask**: se muestra la visión, se pide el mínimo.

**Preguntas probables:**
- *"¿Por qué no ir directo a Enterprise?"* → Porque Enterprise sin validar la clasificación en la casilla real es invertir mucho en algo que todavía no sabemos que funciona. El MVP de 4 semanas es el termómetro que justifica la plataforma.
- *"¿Y el OCR para facturas y comprobantes?"* → Está en Enterprise, la opción de evolución. No se liga al caso actual para no vender humo: cuando exista un caso real, se dimensiona con datos.
- *"¿El RPA lo hacen ustedes?"* → No es parte del MVP ni del ask. Solo lo proponemos como etapa posterior (en Enterprise) y condicionado a que Aysa ya tenga RPA en operación: ahí la automatización del último tramo tiene sentido y se evalúa con su propio go/no-go.

**Decisión abierta:** no se pide aprobar Enterprise hoy; solo H1.

---

## Lámina 11 — Perfiles

**Objetivo:** mostrar que el equipo es chico, especializado y con responsabilidades explícitas.

**Qué decir:**
> "El equipo del MVP tiene 4 perfiles. Un especialista en automatización e integración: conexión a la casilla, staging y salidas. Un especialista en datos e IA: schema de salida, prompts por campo, modelo, juez y golden set. Un analista funcional / referente de negocio: taxonomía, etiquetado de muestra y validación de resultados. Y el responsable de datos / BI: formato de salida, consumo en BI y control de calidad de los datasets. La regla de operación: cada tarea tiene un dueño de entrega y un dueño de validación."

**Análisis de los perfiles:**
- **Automatización / Integración** → construye el tramo técnico (conector, staging, salidas). Entrega.
- **Datos e IA** → construye el corazón (schema, prompts, modelo, juez, golden set). Entrega.
- **Analista funcional / negocio** → define la taxonomía, etiqueta la muestra y valida resultados con ojos de negocio. Valida.
- **Responsable de datos / BI** → define el formato de salida, valida el consumo en BI y controla la calidad del dataset. Valida.
- Dos perfiles de labIA entregan y dos perfiles de Aysa validan: el equipo mixto en el que nadie es juez de su propio trabajo.

**Análisis del callout:**
- "Cada tarea tiene un dueño de entrega y un dueño de validación" = separación de responsabilidades: el desarrollador no aprueba sus propios resultados. Es el argumento anti-riesgo frente a "¿y si se aprueban sus propios resultados?".

**Preguntas probables:**
- *"¿Quién de Aysa participa y cuánto tiempo?"* → El referente de negocio (analista funcional) para la taxonomía y el golden set (sesiones en el kickoff y los días 3–9), y el responsable de datos/BI para el contrato de salida (día 2) y la validación del cruce. Ambos con sesiones puntuales definidas en el kickoff. No es gente dedicada full-time.
- *"¿Se necesita contratar a alguien?"* → No: el equipo es el que presentamos. Lo que sí se necesitan son horas puntuales de dos áreas de Aysa, concentradas en las primeras 2 semanas (que es lo que permite el plazo de 4 semanas).

---

## Lámina 12 — Modelos de IA

**Objetivo:** responder "¿con qué corre la IA?" y "¿cuánto cuesta?" de forma honesta: sin números inventados.

**Qué decir:**
> "El caso es texto, así que usamos modelos livianos. Opción A: self-host dentro de la VPN, modelos de la familia Qwen (2.5 de 7B o 14B): cómputo local, los datos nunca salen de la red y se cumple la Ley 25.326 sin transferir información personal. Opción B: cloud con DPA, modelos como gpt-5-mini o gemini-3-flash, con extracción por prompt por campo — pero requiere DPA y política de retención aprobadas. Un punto importante sobre costos: no presentamos estimaciones de token en esta instancia porque aún no tenemos datos reales de la casilla. Las estimaciones finales se hacen luego del análisis de una muestra representativa de correos, que en este despliegue ocurre en la semana 1."

**Análisis del dato (por qué no hay costos en la lámina):**
- La versión anterior del deck mostraba estimaciones de token (USD) basadas en supuestos de tokens por email. **Se retiraron a propósito**: no hay muestra real de la casilla aún, y cualquier número sería impugnable.
- La frase del callout es deliberada y honesta: "estimación final después de la muestra". Si preguntan por costo, esa es la respuesta + el orden de magnitud cualitativo (modelo liviano = cómputo chico).
- **Opción A (self-host)** → cumple 25.326 sin trámite de transferencia; pide cómputo local (infra/virtual). Es la recomendación base por privacidad.
- **Opción B (cloud DPA)** → más simple de operar e iterar rápido con el proveedor; condicionada a DPA + retención aprobadas por compliance.

**Preguntas probables:**
- *"¿Por qué no nos dan los costos ahora?"* → Porque una estimación sin datos reales sería adivinar, y no queremos venderles un número que no vamos a poder defender. Recién con una muestra representativa de correos dimensionamos volumen real, ruido y cómputo, y ahí sí damos rangos. En el despliegue, probamos ambas opciones en esa misma muestra (días 16–20).
- *"¿Self-host o cloud, cuál recomiendan?"* → Recomendación base: self-host, porque la PII no sale de la red (Ley 25.326). Pero la decisión se toma con dato: probamos ambas con la muestra y medimos precisión y esfuerzo operativo.
- *"¿Necesitan un modelo gigante?"* → No: el caso es texto de campañas, estructura conocida. Modelos livianos con schema estricto alcanzan; para OCR documental (capacidad reutilizable futura) ya se evaluará otro modelo cuando haga falta.

**Decisiones abiertas:** ¿self-host o cloud? Decisión post-muestra (días 16–20), con compliance participando. Y si IT tiene cómputo disponible para self-host.

---

## Lámina 13 — Registro de riesgos

**Objetivo:** demostrar que ya pensamos en lo que puede salir mal y cómo se mitiga, con responsable.

**Qué decir:**
> "No es un párrafo vago: es un registro con probabilidad, impacto y mitigación para cada riesgo, y cada uno tiene responsable. R1, identificación incorrecta del titular —probabilidad media, impacto alto— se mitiga con el cruce contra la fuente corporativa, la evidencia y la revisión en las áreas. R2, datos personales bajo Ley 25.326: self-host dentro de la VPN, o cloud solo con DPA y retención aprobada. R3, acceso a la casilla: acuerdo con IT, con el importe PST como respaldo. R4, datos de origen incompletos o erróneos: es justamente el objetivo — detectarlos con evidencia para corregir el origen. R5, alucinación del modelo: schema estricto, prompt por campo, juez y golden set. R6, formato de salida no aprovechable por BI: contrato de salida firmado con el área de datos en el kickoff. Y R7, el riesgo propio del plazo de 4 semanas: dependencias de acceso y de etiquetado; se mitiga con el pre-arranque en paralelo, el MVP acotado y el escenario pesimista de 6 semanas."

**Análisis de cada fila (quién responde):**
- **R1 · Identificación incorrecta (Med/Alto)** → cruce determinístico + evidencia + revisión humana en las áreas. Responsable: pipeline (automático) + review humano si ambigüedad. Es el riesgo de mayor impacto reputacional → va primero.
- **R2 · Ley 25.326 / PII (Med/Alto)** → self-host si hay PII; DPA y retención si cloud. Responsable: compliance/Aysa decide la vía; labIA la implementa.
- **R3 · Acceso a la casilla (Med/Med)** → acuerdo con IT de credenciales de mínimo privilegio + PST como respaldo; en el plan de 4 semanas, D1 se pide en el **pre-arranque, antes del día 1**. Responsable: IT de Aysa.
- **R4 · Datos de origen incompletos (Med/Med)** → no es un fallo de la herramienta: es el objetivo de detección. Se informa con evidencia. Responsable: áreas (corrección del origen).
- **R5 · Alucinación (Med/Med)** → schema estricto + prompt por campo + juez + golden set. Responsable: labIA (ingeniería de prompts y validación).
- **R6 · Formato de salida (Baj/Med)** → contrato de salida con BI firmado en el kickoff (día 2). Responsable: labIA + responsable de datos/BI.
- **R7 · Plazo de 4 semanas (Med/Med)** → pre-arranque en paralelo + alcance acotado + escenario pesimista de 6 semanas; si D1 no llega, se replanifica sin comprimir la validación. Responsable: Sponsor (prioriza la habilitación de las áreas) + IT.

**Procedimiento de gestión durante el despliegue:**
- Registro vivo: se revisa en cada gate de control (días 10, 20 y gate final).
- Un **owner por fila** del lado Aysa (IT/compliance/áreas) + uno en labIA.
- Disparadores de escalada definidos por riesgo (tasa de derivación, precisión del golden set, demoras de acceso).

**Preguntas probables:**
- *"¿Y si el modelo se equivoca y confirma a alguien que no es?"* → Es el riesgo R1 y está atacado por diseño: la IA no decide identidad; el cruce contra la fuente corporativa sí, y si no hay match pasa a revisión humana. La evidencia de cada resultado queda guardada y auditable.
- *"¿Qué pasa si compliance no aprueba cloud?"* → Nada: nos quedamos con self-host (R2 mitigado), que es la opción recomendada de todos modos.
- *"¿Y quién responde por cada riesgo en Aysa?"* → Cada fila tiene un dueño. En el kickoff se asigna el nombre de cada lado; es un entregable del día 1. El R7 lo responde el Sponsor en la práctica: es él quien destraba las habilitaciones y las sesiones de negocio.

---

## Lámina 14 — Roadmap (go/no-go)

**Objetivo:** mostrar el camino completo y pedir el mínimo posible (H1), con reglas de salida claras.

**Qué decir:**
> "Tres horizontes. H1 es el piloto MVP en despliegue, de 0 a 2 meses —4 semanas de construcción más la ventana de medición— y es lo único que pedimos aprobar ahora: datasets más evidencias por campaña para las áreas, con golden set de validación. H2 es la opción Enterprise, de 3 a 6 meses: OCR documental, verificación multiprueba y dashboard con cola de revisión, todo sobre la misma base del MVP. Y H3 es la escala de casillas, según demanda: aplicar el mismo patrón a otras casillas y áreas. Enterprise y la escala tienen su propio go/no-go. Si H1 no supera los criterios, se cierra con pérdida acotada — el riesgo queda limitado desde el día uno."

**Análisis de cada horizonte (por qué está diseñado así):**
- **H1 · Piloto MVP · despliegue (0–2 meses, "Aprueba ahora")** → es la única inversión pedida. 4 semanas de construcción (base 4 · optimista 3 · pesimista 6) + ventana de medición. Su métrica de éxito está en la lámina 15.
- **H2 · Opción Enterprise (3–6 meses, "Contexto")** → la evolución con OCR y multiprueba, sobre el motor del MVP. Se muestra como opción (lámina 10), no como parte del ask de hoy.
- **H3 · Escala de casillas (según demanda, "Contexto")** → reutiliza el motor: aplicar el patrón a otras casillas y áreas. Es el contrafáctico contra "de qué sirve un MVP": el MVP es la base de la escala.

**Análisis del callout "shrink the ask":**
- Se aprueba solo H1. Si no supera las métricas, se cierra con **pérdida acotada al piloto** y sin tocar sistemas. Es el mecanismo que baja el riesgo percibido del sponsor/CFO al mínimo.

**Preguntas probables:**
- *"¿Qué pasa si el piloto falla?"* → Kill criteria claros y una pérdida acotada al piloto: no hay exposición de sistemas ni de datos. El riesgo total queda limitado desde el día uno.
- *"¿Por qué no prometer la plataforma completa ya?"* → Por honestidad comercial: no sabemos la tasa real de inconsistencia ni la precisión real hasta ver la casilla real. El piloto existe para saber eso antes de escalar.
- *"¿Y el OCR documental para facturas y comprobantes?"* → Está en H2, la opción Enterprise (lámina 10). No se liga al caso actual para no vender humo: cuando lo justifique un caso real, se dimensiona con datos y se aprueba con su propio go/no-go.

---

## Lámina 15 — Métricas de éxito y kill criteria

**Objetivo:** darle al piloto una definición de éxito objetiva y cuándo cortar sin vergüenza.

**Qué decir:**
> "El piloto se aprueba o se corta con criterios objetivos. Para el go: precisión de clasificación de al menos 90% sobre el golden set, precisión de extracción de campos clave de al menos 95%, tasa de derivación a revisión menor a 30%, cobertura de al menos 95% de los emails útiles por campaña, y un bloqueante: que el 100% de los resultados tenga evidencia del cruce. Y tenemos kill criteria: si el despliegue se desvía más de 6 semanas, si la adopción queda 50% por debajo de lo previsto, si la precisión no se cierra ni con revisión, si compliance o IT no habilitan la muestra en los primeros 10 días, o si el costo operativo queda fuera de rango frente a la muestra real — cortamos y documentamos el aprendizaje."

**Análisis del dato (cómo se mide cada una):**
- **Precisión de clasificación ≥ 90% (golden set)** → % de emails donde la clase predicha coincide con la etiqueta del golden set (~300 emails etiquetados por las áreas, completado el día 9).
- **Precisión de extracción ≥ 95%** → % de campos clave extraídos correctamente vs el golden set.
- **Tasa de derivación a revisión < 30%** → % de casos que van a humano. Arriba del 30% el ahorro manual no se nota; abajo, el piloto demuestra valor.
- **Cobertura por campaña ≥ 95%** → % de emails útiles asignados correctamente a campaña y dataset.
- **Evidencia por email = 100% (bloqueante)** → ningún resultado se entrega sin el rastro del cruce contra la fuente corporativa. Si un caso se libera sin evidencia → bloqueante.

**Análisis de los kill criteria (cuándo cortar):**
- **Desvío de despliegue** → retraso > 6 semanas en H1 → se corta (el valor tiene fecha; superado el rango 3–6, la promesa de "primera señal" pierde sentido).
- **Adopción** → > 50% bajo lo previsto → nadie lo usa, para qué seguir.
- **Precisión** → no se cierra ni con revisión de las áreas → la interfaz máquina-humano no funcionó.
- **Acceso a la casilla** → compliance/IT no habilita la muestra en los primeros 10 días del pre-arranque/kickoff → no hay forma legal de arrancar (mejor saberlo antes).
- **Costo operativo** → fuera de rango frente a la muestra real → economía rota (más relevante si se elige cloud).

**Análisis leading vs lagging:**
- **Leading (de proceso, en cada fase):** precisión de clasificación/extracción, tiempo por caso, % de derivación. Se miden durante el despliegue, no al final.
- **Lagging (de negocio, en gates):** inconsistencias detectadas por origen, datasets entregados en tiempo, horas de revisión liberadas.
- El tablero del piloto (BI o planilla) muestra ambas; los gates de control son en los días 10 y 20 y el gate final del día 28.

**Preguntas probables:**
- *"¿90% alcanza?"* → Es el piso de go; el resto lo cubre la revisión humana (derivación < 30%). El objetivo de negocio no es el perfeccionismo del modelo, es que la carga manual baje y el dato llegue a tiempo con evidencia.
- *"¿Quién controla las métricas?"* → labIA mide contra el golden set y Aysa tiene acceso al tablero; en el gate el sponsor decide con los números, no con la palabra de nadie.

---

## Lámina 16 — La operación en marcha: qué queda automatizado

**Objetivo:** contestar la pregunta que nadie formula pero todos se hacen: "después de desplegar, ¿qué queda corriendo, quién lo opera y cómo funciona el día 1 de producción?". Es la lámina que convierte el proyecto en **servicio continuo**.

**Qué decir:**
> "Después del despliegue, la solución deja de ser un proyecto y pasa a ser un servicio continuo: cada correo nuevo se procesa solo y las áreas reciben datos actualizados sin intervención manual. Hay cuatro piezas. Automático, en cada corrida: el conector levanta solo los correos nuevos, filtra el ruido, clasifica y extrae con el modelo, cruza contra la fuente corporativa y publica los datasets por campaña y el dashboard actualizados. Humano, solo en lo dudoso: el juez deriva a revisión lo que no supera los umbrales, una persona del área resuelve el caso y esa decisión queda registrada y auditable; los umbrales y las reglas se ajustan con gobernanza y versionado. Quién opera en Aysa: el área de datos y BI ejecuta y monitorea las corridas, y el referente funcional revisa los criterios de negocio y la cola de revisión; la documentación técnica queda versionada en el repositorio de Aysa. Y cómo se escala: las campañas restantes del histórico se agregan con el mismo motor, el patrón aplica a otras casillas y áreas, y la opción Enterprise agrega OCR y multiprueba sobre el mismo motor — cada paso nuevo conserva su go/no-go."

**Análisis de cada card:**
- **Automático · cada corrida** → el pipeline corre de forma incremental y programada dentro de la VPN: ingesta → filtro → modelo → cruce → publicación. Sin operación manual: es la "automatización que queda" después de desplegar.
- **Humano · solo lo dudoso** → la cola de revisión concentra lo que el modelo no resuelve con confianza; cada decisión humana queda registrada y auditable. El modelo no decide: la regla de la lámina 5 se mantiene en producción.
- **Quién opera en Aysa** → la operación del día a día queda del lado de Aysa (BI/datos + referente funcional), con la documentación y el versionado entregados al cierre. labIA queda como soporte de la etapa de estabilización, delimitado en el acuerdo.
- **Cómo se escala** → las campañas restantes (~50K inicial) se emiten post-go/no-go con el mismo motor y costo marginal bajo; el mismo motor sirve para nuevas casillas/áreas. Enterprise agrega capacidad documental sin cambiar la arquitectura.

**Preguntas probables:**
- *"¿Quién se queda operando esto?"* → El área de datos / BI de Aysa, con la documentación versionada y un período de acompañamiento acotado de labIA. La operación no depende de nosotros después de la estabilización.
- *"¿Y si cambia el volumen o los formatos?"* → Las corridas son incrementales y los umbrales/reglas se ajustan con gobernanza y versionado; cualquier cambio relevante se mide antes con el mismo patrón del despliegue.
- *"¿Esto reemplaza personas?"* → No: reemplaza el proceso manual de revisión correo por correo. Lo dudoso lo sigue resolviendo una persona y la decisión final sigue siendo del área. Las horas liberadas se reportan como métrica de negocio.
- *"¿Esto arranca al final del despliegue o hay que esperar a Enterprise?"* → Con H1 ya queda operando para las campañas priorizadas. Enterprise y el RPA opcional suman capacidad documental y automatización del último tramo más adelante, cada uno con su go/no-go.

**Decisiones abiertas:** quién asume la operación en Aysa (BI/datos), y el período y el alcance del acompañamiento de labIA durante la estabilización.

---

## Lámina 17 — Cierre · Ronda de preguntas

**Objetivo:** cerrar con un pedido concreto, mínimo y accionable, y abrir la conversación.

**Qué decir:**
> "El camino es claro: H1, el MVP ahora, desplegado en 4 semanas con alcance acotado para validar la detección de inconsistencias con la casilla real, con go/no-go al mes 1, y desde ahí la opción Enterprise —OCR, multiprueba y RPA opcional— y la escala de casillas, cada una con su propio go/no-go. La decisión de modelo la probamos con la muestra antes de decidir. Lo que necesitamos para arrancar es modesto y tiene fecha: una muestra real de correos y el acceso a la casilla o el importe PST **antes del día 1** (es el pre-arranque), un golden set de unos 300 emails validado con las áreas en los primeros 9 días, y el formato de salida BI firma en el kickoff. ¿Qué pregunta les queda?"

**Análisis de los 3 cards de cierre:**
- **1 · El camino propuesto** → H1/MVP ahora, desplegado en 4 semanas con alcance acotado, go/no-go al mes 1, luego Enterprise (OCR + multiprueba + RPA opcional) y escala de casillas, cada una con su propio go/no-go. Es el mapa mental para que el sponsor explique "qué aprobé".
- **2 · Decisión de modelo** → self-host (recomendado, cumple 25.326 sin salida de PII) o cloud con DPA. Ambos se prueban con la muestra (días 16–20) antes de decidir.
- **3 · Lo que necesitamos para arrancar** → tres entregables con fecha: muestra real + acceso (o importe PST) ANTES del día 1, golden set ~300 emails con sesiones de las áreas en los días 3–9, formato de salida BI firmado en el kickoff. No es dinero: es tiempo puntual de IT y de dos áreas.

**Procedimiento de cierre:**
- Cerrar el "ask" en una frase y callar (no llenar el silencio).
- Anotar en vivo las decisiones abiertas (ver abajo) y quién las va a destrabar (responsable + fecha).
- Pasar a la ronda: "¿qué pregunta les queda?".
- Agradecer y entregar los materiales: PDF de la presentación, HTML compartible, guión y el **plan de 4 semanas** (`plan-4-semanas-aysa.md`).

**Preguntas probables de cierre:**
- *"¿Cuánto tarda en arrancar?"* → Con muestra y acceso entregados en el pre-arranque, el kickoff es en la primera semana después de la aprobación y el despliegue se cierra a las 4 semanas (base).
- *"¿Qué pasa si en el relevamiento el problema es chico?"* → Perfecto: lo relevamos con la muestra, te lo mostramos con los 3 escenarios y decidimos. Si el problema es menor al esperado, el piloto se cierra antes y el costo fue mínimo. No nos conviene venderles algo que no hace falta.
- *"¿Pueden comenzar mientras se aprueba?"* → Sí, y es justamente el diseño: el **pre-arranque** (pedido de muestra a IT, entorno de labIA y agenda del golden set) ocurre en paralelo a la aprobación formal, para que los 4 semanas corran desde la firma.

---

## Bloqueadores / decisiones abiertas para cerrar en la reunión (checklist)

1. **Muestra real + acceso de lectura de la casilla (EWS/Graph con mínimo privilegio) o importe PST** — entregado **ANTES del día 1** (pre-arranque). → IT. Es la condición de entrada del plazo de 4 semanas.
2. **Aprobación de H1 (MVP de 4 semanas)** y presupuesto del piloto. → Sponsor / CFO.
3. **Alcance acotado:** campañas priorizadas para la ventana de despliegue. → Sponsor + AF.
4. **Sesiones de negocio:** taxonomía (día 1) y etiquetado doble del golden set (días 3–9). → Áreas de negocio (2 personas).
5. **Formato de salida BI** y dataset por campaña: contrato firmado en el kickoff (día 2). → Business Intelligence.
6. **Permisos de lectura de la fuente corporativa** (días 7–10). → RDB / IT.
7. **Compliance/Legal:** validación del manejo de PII en el kickoff y requisito de DPA si se elige cloud (días 1–16). → Legal.
8. **Self-host vs cloud:** se decide tras probar ambos con la muestra en los días 16–20 (recomendación: self-host por 25.326). → Compliance + IT + labIA.

---

## Checklist previo a la demo (día de la presentación)

- [ ] Pantalla y proyector probados; la presentación abre bien (HTML y PDF).
- [ ] Navegación recordada: **← →** o espacios para avanzar · **F** para fullscreen.
- [ ] Guión impreso o en pantalla secundaria.
- [ ] Narrativa coherente: el pedido es el MVP/H1 **desplegado en 4 semanas** (se aprueba solo eso); el plazo se gana con pre-arranque + MVP acotado + paralelización, **nunca comprimiendo la validación**. Enterprise aparece como opción de evolución, sin costos de token ni nombres de sistemas de origen.
- [ ] Cifras consistentes: **~50K emails históricos iniciales** (no 60K ni 23K); la muestra real calibra el baseline.
- [ ] Nombre del sponsor y de los asistentes (para saludar con nombre).
- [ ] Checklist de bloqueadores en mano para anotar responsables y fechas (muestra antes del día 1, sesiones del golden set, contrato BI).
- [ ] URL del HTML compartible a mano por si piden el material al instante.

---

## Anexo A — Procedimiento de kickoff y pre-arranque (Paso 0) en detalle

El Paso 0 es todo lo que se hace antes de escribir una sola línea de pipeline. En el plan de 4 semanas es la **Semana 0 (pre-arranque)** y la Semana 1, y es el 80% del éxito del despliegue.

**1 · Pedir la muestra real de la casilla (quién: IT / admin de Exchange) — pre-arranque 🔒**
- No pedir toda la casilla: pedir una **muestra representativa** de ~300–600 emails que mezcle años, campañas distintas y ruido real (out-of-office, bounces, spam).
- Pedir a IT un **export de solo lectura** en dos piezas: (a) un CSV con metadatos (fecha, remitente, asunto, si trae adjunto) y (b) los `.eml/.msg` + adjuntos en una carpeta compartida dentro de la VPN.
- En paralelo, pedir la **cuenta de servicio EWS/Graph de mínimo privilegio** (o confirmar el plan B de importe PST). Sin esto al día 1, el cronograma se mueve entero (pesimista).
- Formalizar siempre: acuerdo de confidencialidad + acceso solo lectura + manejo de los datos dentro de la VPN. Los datos no salen de la red.

**2 · Análisis exploratorio (labIA, 2–3 días, semana 1)**
- Cargar el CSV en Python/pandas, SQL o Power Query de Excel, y responder 6 preguntas con tablas y frecuencias:
  - **Volumen por año/mes** → valida el ~50K histórico inicial, el flujo recurrente bajo y zanja la discrepancia con las cifras previas (~60K operativo / ~23K business case).
  - **Campañas identificables** → por asunto/remitente (regex de patrones de campaña); selecciona las priorizadas del alcance acotado.
  - **% de ruido real** (out-of-office, bounce, spam, vacíos) → ajusta el supuesto de emails útiles (~70% de referencia).
  - **% con adjuntos y su formato** (pdf/jpg/xls) → dimensiona la futura capacidad documental (OCR).
  - **Distribución por remitente** → cuántas cuentas fuente hay.
  - **Emails estructuralmente incompletos** (sin cuerpo o sin datos de cuenta) → alimenta la clase `DUDOSO`.
- Salida: un documento de una página "lectura de la casilla". Es el input para dimensionar cómputo, estimaciones de costo (si aplica) y el calendario.

**3 · Definir la taxonomía de clasificación (workshop con las áreas, media jornada, día 1)**
- Por cada clase llenar una fila de un cuadro: **definición operativa** (cuándo un email ES esa clase) · **3–5 ejemplos reales** de la muestra · **qué se hace con esa salida** (a qué dataset va) · **dueño de la revisión**.
- Regla práctica: si dos personas del negocio no coinciden en 8 de 10 ejemplos, la definición no está clara → reescribir en la misma sesión.
- Resultado aprobado: el **schema de clasificación** (las 5 clases) y el **schema de extracción** (email · cuenta/contrato · nombre y apellido · dirección · teléfono · documento y tipo · relación con el titular · titular).

**4 · Construir el golden set (~300 emails, días 3–9)**
- **Selección balanceada:** mínimo 30–50 emails por clase frecuente (`CONFIRMA` / `NO_ES_MIA`) y 20–30 de las raras (`OPTOUT` / `DUDOSO`), más un grupo de ruido para probar el filtro determinístico.
- **Doble etiquetado:** 2 personas de las áreas etiquetan por separado la misma muestra (clase + campos de identidad + confianza del etiquetador). Las discrepancias se discuten y se resuelven con un tercero → etiqueta de oro.
- **Herramienta:** Excel/Google Sheets con validaciones (lista desplegable por clase, email_id única, campos obligatorios) alcanza. Si se quiere control fino → Label Studio o Prodigy. El archivo lo prepara labIA en el pre-arranque.
- **Consistencia (rigor):** medir el acuerdo entre etiquetadores (cohen kappa, objetivo ≥ 0.8) antes de dar el set por bueno.
- **Guardado versionado:** el set se separa en train/validation/test (70/15/15); el test solo se mira al final, para las métricas de go/no-go de la semana 3.

**Esfuerzo estimado:** muestra + exploratorio ≈ 2–3 días · workshop ≈ ½ día (día 1) · etiquetado ≈ 2–3 días con dos etiquetadores en paralelo (días 3–9).

---

## Anexo B — Detalle técnico de implementación (Pasos 1–4)

### Paso 1 · Ingesta desde la casilla

**Conexión a la casilla (2 caminos):**
- **EWS (Exchange on-prem clásico):** API SOAP nativa. Librerías disponibles: `exchangelib` (Python), `ews-javascript-api` (.NET/Node), `pyews`. Autenticación por cuenta de servicio con Basic Auth sobre TLS 1.2 (o OAuth si hay AD enrollado).
- **Graph API (si Aysa tiene Microsoft 365 o híbrido):** app registration con permisos *scoped* a esa casilla (permisos de app, no de usuario); se lee con `users/{casilla}/messages` + paginación.
- Para on-prem, el estándar es **EWS con ApplicationImpersonation o Full Access de solo lectura** sobre la casilla.
- **Importe PST (respaldo):** si IT no habilita conexión directa en el pre-arranque, se procesa el histórico desde un archivo PST exportado con `New-MailboxExportRequest`. Más lento, pero desbloquea el despliegue (mitiga R3).

**Cuenta de servicio mínimo privilegio:**
- Cuenta sin login interactivo; **solo lectura** de la casilla, nunca Send/Delete/Write.
- El secreto se guarda en el gestor de secretos de IT; jamás en el código.
- Es el blocker #1 del checklist: sin esta cuenta (o el PST) antes del día 1, el despliegue se mueve al escenario pesimista.

**Proceso incremental con dedupe:**
- Job cada 10–15 min (o diario según volumen) que usa **SyncFolderItems** de EWS (watermark) o `LastModifiedTime` como cursor → trae solo lo nuevo/modificado.
- Dedupe por **ItemId de Exchange** (única por email) + **SHA-256 del mensaje completo**: lo ya visto no se reprocesa; si el hash cambia, se marca como revisado.

**Staging en el repositorio corporativo de datos (append-only):**
- Tabla `stg_email`: `email_id PK, item_id, hash, remitente, asunto, fecha_recibido, tamaño, tiene_adjuntos, raw_path, created_at, processed_at`.
- Tabla `stg_adjunto`: `email_id FK, nombre_archivo, formato, tamaño, path`.
- Nunca se borra ni se edita: cada relectura de un email es una fila nueva con su checksum/hash → trazabilidad total y dedupe a nivel fila.

### Paso 2 · Clasificación y extracción

**Filtro determinístico primero (sin IA):**
- Un paso de código (Python/C#/stored proc) que decide "ruido sí/no" con reglas:
  - Asunto contiene "Fuera de la oficina / Out of office / marcador automático" → out-of-office.
  - Headers de entrega fallida / "Delivery Status Notification" → bounce.
  - Heurística de spam o emails vacíos → descarte.
- Si `ruido=True` → se descarta del proceso del modelo (no gasta cómputo).

**Modelo con schema estricto (patrón Instructor/DocInfo):**
- **Prompt por campo** (no libre): por cada campo del schema, una definición y ejemplos. Rol → definición de las clases con ejemplos → schema JSON esperado → el email (asunto+cuerpo+metadatos).
- Schema de salida (validado por código): `{"clase": ..., "campana": ...|null, "contacto": {email, cuenta, nombre_apellido, direccion, telefono, documento_y_tipo, relacion_titular, titular}, "confianza": 0.0-1.0, "razon": "..."}`.
- **Validación de JSON:** si no parsea o no cumple el schema → directo a revisión humana. Nunca se guarda JSON mal formado.

**Juez de validación (~30% de los casos):**
- Es un **segundo pase** sobre los casos de zona gris (confianza media, campos incompletos, datos contradictorios internamente).
- Verifica coherencia y formato: cuenta/contrato con el formato esperado, teléfono y documento con la cantidad de dígitos de Aysa, ausencia de contradicciones (CONFIRMA sin contacto → incongruente).
- Si el juez no confirma → `DUDOSO` → cola de revisión humana.
- Cada fila guarda `modelo_version` y `prompt_version` para auditar con qué versión se clasificó cada email.

**Tabla de extracción:**
- `stg_extraccion`: `email_id FK, clase_pred, campana_pred, email, cuenta, nombre_apellido, direccion, telefono, documento_y_tipo, relacion_titular, titular, score, modelo_version, prompt_version, resultado_juez, created_at`.

### Paso 3 · Verificación contra la fuente corporativa

**Cruce determinístico (sin LLM):**
- Un stored proc / vista que hace JOIN de `stg_extraccion` contra las tablas de verdad (clientes/cuentas/campañas) de la **base de datos relacional corporativa**.
- **Normalización previa:** trim, mayúsculas, sin tildes, formatos de números/ceros (la cuenta y el documento rara vez vienen igual en el email que en la base). Se adelanta en el plan a los días 7–10 🔒 (permiso de lectura).

**Lógica de evidencia (reglas versionadas, aprobadas con las áreas):**
- Cuenta/contrato + titular coinciden → `Coincide`.
- Cuenta/contacto no encontrados o contradictorios → `No coincide` + motivo.
- Match parcial o campos ausentes → `Requiere revisión` (con banderas de por qué).
- Sin match pero datos coherentes → normalmente `Requiere revisión` (no se inventa).

**Salida de decisión:**
- Tabla `seg_decision`: `email_id, estado, motivo, id_fila_que_valido (evidencia), reviewer, reviewed_at`.
- Cada estado tiene su evidencia (qué fila de la fuente de verdad lo sustentó) → auditable ante compliance y ante la pregunta "¿cómo saben que es ese titular?".

### Paso 4 · Datasets y evidencias

**Estructura de salida (contrato de datos con BI/áreas):**
- Tabla/vista `seg_campana`: `campaña, estado, cuenta_id, email_id, fecha, evidencia` → el "dataset por campaña" que consumen las áreas.
- Formato y frecuencias definidos con **Business Intelligence** en el kickoff (día 2, riesgo R6): qué columnas, qué granularidad, qué periodicidad, dónde se publica. Es el adelanto que habilita el ritmo de 4 semanas.

**Datasets por campaña:**
- Confirmados, no-es-mía, opt-out, duplicados y dudosos por campaña, cada fila con su **rastro de evidencia** (qué cruce lo sustentó). En la ventana del despliegue se emiten los de las **campañas priorizadas** (alcance acotado); el resto se agrega post-go/no-go con el mismo motor.

**Capacidades futuras (roadmap, no se implementan en el MVP):**
- **OCR documental (capacidad reutilizable):** modelos con visión leen facturas/comprobantes cuando exista un caso de negocio que lo justifique (no ligado a la casilla actual).
- **Escala a otras casillas:** el mismo motor se configura para otras casillas y áreas (H2).

**Orden lógico de implementación en el despliegue:**
- Primero el pre-arranque/kickoff (Anexo A) → después el cruce de umbrales y el golden set → cuando la clasificación da ≥90% (semana 2), se sabe exactamente qué escalar. El pipeline de los 4 pasos nunca se implementa "de golpe": se valida etapa por etapa contra el golden set, y el **test congelado** garantiza que las métricas finales de la semana 3 son honestas.