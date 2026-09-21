# Plan de despliegue en 4 semanas — MVP acotado · Calidad de Datos de Contacto (Aysa · labIA)

> **Qué es este documento:** es el desglose operativo del **despliegue del MVP en 4 semanas** (H1). Detalla, semana por semana —y en los días de cada semana— **qué** se hace, **quién** lo hace, **quién** lo valida, **qué** se entrega y **cómo se sabe** que quedó bien hecho. Se apoya en el `plan-semanas-aysa.md` (8–12 semanas) y lo **comprime sin sacrificar la validación**.
> **Cómo leerlo:** cada semana tiene (1) su objetivo, (2) las tareas desglosadas con día aproximado, (3) entregable principal, y (4) el bloque "qué le demuestra esto a la empresa". Las celdas con 🔒 dependen de un entregable de Aysa. El **pre-arranque (Semana 0)** es la condición de entrada: sin él, no hay 4 semanas.
> **Escenarios de duración:** base = **4 semanas** · optimista = **3** (EWS directo y golden set listo al día 1) · pesimista = **6** (acceso de muestra demorado o golden set que exige re-etiquetado). En los tres casos la **validación es idéntica y plena**: lo que varía es el alcance de campañas procesadas en la ventana del despliegue, nunca la calidad del examen.
> **Reglas transversales:** (1) **nadie valida lo que produce** — quien entrega y quien valida son personas distintas; (2) **nunca se comprime la validación** — se comprime el alcance (MVP acotado) y el calendario (paralelización y pre-arranque).
> **Remplaza el plan de 8–12 semanas como plan de despliegue de H1.** El plan-semanas-aysa.md queda como referencia del plan extendido y del detalle de la opción Enterprise.

---

## 0 · Cómo se llega a 4 semanas sin comprimir la validación

El plan extendido pedía 8–12 semanas. A 4 semanas se llega con **cuatro palancas explícitas**, ninguna de las cuales toca la calidad del examen:

| Palanca | Qué se hace | Qué NO se sacrifica |
|---|---|---|
| **Pre-arranque en paralelo (Semana 0)** | Aysa habilita la muestra real y el acceso de lectura **antes del día 1** (D1), mientras labIA prepara entorno VPN, tablas de staging, planilla del golden set y templates. Se hace en paralelo a la aprobación formal. | La muestra sigue siendo real y representativa (≥ 3 campañas, ruido real). |
| **MVP acotado al despliegue** | El despliegue procesa en la ventana las **campañas priorizadas (2–3)** acordadas en el kickoff; el pipeline ingesta todo lo entrante, pero los datasets por campaña se emiten para las priorizadas. El resto se agrega después del go/no-go con el mismo motor. | El golden set completo (~300 emails, doble etiquetado), el test congelado y las 5 métricas de go/no-go son **integrales**. |
| **Paralelización de tracks** | **ESI** (conector, staging, cruce) y **EDI** (golden set, modelo, juez) avanzan en paralelo desde el día 1. Las sesiones de negocio (taxonomía y etiquetado) se reservan y ejecutan en los días 1–9, no en semanas. | El criterio de qué es cada clase lo sigue definiendo el negocio; nadie se salta el doble etiquetado. |
| **Contrato de salida adelantado** | El formato del dataset con BI se firma en el **kickoff (día 2)** en lugar de la semana 8. | El contrato sigue siendo BI quien lo firma; no lo inventa labIA. |

> **Regla de oro del plazo:** el despliegue de 4 semanas **arranca cuando D1 está disponible**. Si la muestra o el acceso no están al momento del kickoff, el cronograma se mueve entero (escenario pesimista) — no se arranca sobre supuestos y no se comprime la validación para compensar.

---

## 1 · Los roles, sin ambigüedad

### De labIA (construyen el despliegue)

| Rol | Sigla | Quién es | Qué produce (entrega) | Qué NO hace | Dedicación |
|---|---|---|---|---|---|
| **Especialista en Automatización / Integración** | ESI | Ingeniero con experiencia en Exchange (EWS/Graph), ETL y repositorios de datos | El conector de la casilla, el staging, el filtro de ruido, la normalización, el cruce determinístico y las salidas (CSV/API/BI) | No define la taxonomía ni valida resultados de negocio | Completa durante el despliegue |
| **Especialista en Datos e IA** | EDI | Ingeniero de datos + IA con experiencia en extracción estructurada (schema estricto, prompts por campo) | El esquema de clasificación, los prompts del modelo, el juez de validación y el golden set técnico | No decide qué significa cada clase para el negocio | Completa durante el despliegue |

### De Aysa (habilitan y validan)

| Rol | Sigla | Quién es | Qué aporta (valida / habilita) | Qué esperamos de ellos | Dedicación |
|---|---|---|---|---|---|
| **Analista funcional · Referente de negocio** | AF | La persona del negocio que conoce las campañas y cómo se usa hoy la casilla | Define la taxonomía, valida el golden set y aprueba resultados con ojos de negocio | Sesiones la **semana del kickoff**: taxonomía (día 1) y etiquetado doble (días 3–9) | Sesiones pautadas (no full-time) |
| **Responsable de datos / BI** | RDB | La persona que conoce la base de datos relacional corporativa y los reportes | Aprueba el formato de salida (día 2), habilita lectura de la fuente (día 8–10 🔒) y controla la calidad del cruce y los datasets | Acceso de lectura a la fuente corporativa + firma del contrato de salida en el kickoff | Sesiones pautadas (no full-time) |
| **IT / Comunicaciones corporativas** | IT | Equipo que administra Exchange y la red bajo Ley 25.326 | Habilita la muestra y el acceso de lectura de la casilla (o export PST) con mínimo privilegio **antes del día 1** 🔒 | Entregar la muestra y las credenciales en la **Semana 0** | Hitos puntuales 🔒 |
| **Compliance / Legal** | CMP | Responsable de la Ley 25.326 y la política de retención | Aprueba el manejo de datos personales y, si se elige cloud, el DPA | Validar el esquema de datos en el kickoff y el DPA si aplica (días 1–12) 🔒 | Hitos puntuales 🔒 |
| **Sponsor** | SP | La autoridad que decide el go/no-go | Aprueba H1 y preside el gate final con las métricas | Okey del alcance acotado + decisión de go/no-go con números (día 22–28) | Inicio y gate final |

**Regla de oro en la práctica:** el ESI/EDI **entregan**, el AF/RDB/IT **validan**. Por ejemplo, el EDI mide la precisión del modelo; el AF confirma contra el golden set que esa medición es correcta. Nadie es juez de su propio trabajo.

---

## 2 · El proceso de punta a punta (en criollo)

Para que no quede ninguna duda de qué se despliega, así fluye un solo correo a través del piloto:

**Paso A · Ingresa el correo.** Un conector dentro de la VPN lee la casilla (o importa un archivo PST si IT lo prefiere). No borra ni modifica nada: solo copia los correos nuevos a un área de trabajo (staging) con fecha y un sello único.

**Paso B · Se separa el ruido del contenido útil.** Un filtro automático (sin IA) descarta respuestas automáticas, devoluciones de mail y spam. Lo que queda es el contenido real de campaña.

**Paso C · La IA clasifica y extrae.** Un modelo liviano lee cada correo útil y responde con un formato estricto: cuál es la clase (CONFIRMA / NO_ES_MIA / DUDOSO / OPTOUT / IRRELEVANTE) y los campos de contacto (email, cuenta, nombre, dirección, teléfono, documento, relación con el titular, titular). El modelo **no inventa**: si un campo falta, queda marcado como ausente y el caso puede ir a revisión.

**Paso D · Se verifica contra la fuente corporativa.** Un cruce determinístico (reglas de código, sin IA) compara los datos extraídos contra la base de datos relacional corporativa. El resultado es una **evidencia**: `Coincide · No coincide · Requiere revisión`.

**Paso E · Se arma el dataset por campaña.** Con la evidencia de cada correo se genera el dataset que reciben las áreas, con el rastro de por qué cada caso quedó donde quedó.

**Resultado:** la herramienta **no decide** nada por sí sola: clasifica, extrae, cruza y evidencia. La decisión final siempre es del área responsable.

---

## 3 · Cronograma de alto nivel (base 4 semanas · optimista 3 · pesimista 6)

| Fase | Semana | Entregable principal | Validación |
|---|---|---|---|
| **Pre-arranque (Semana 0) 🔒** | −1 a 0 | Muestra real + acceso a la casilla listos (D1) + entorno de labIA preparado | IT + CMP + ESI |
| Baseline e ingesta | 1 | Esquema aprobado + primer lote real leído + % útil medido | AF + Sponsor |
| Golden set, modelo y juez | 2 | Golden set completo (test congelado) + métricas sobre validación (90/95/<30) | AF + EDI |
| Cruce, examen final y datasets v1 | 3 | Métricas finales de go/no-go + un correo real de punta a punta | RDB + AF + Sponsor |
| Datasets, informe y traspaso | 4 | H1 desplegado + informe go/no-go + show & tell y firma | Sponsor (gate) |

---

## 4 · Semana por semana, paso a paso

---

### Semana 0 — Pre-arranque en paralelo 🔒 (condición de entrada)

**Objetivo del bloque:** dejar todo listo **antes del día 1** para que el cronograma de 4 semanas arranque sin fricción. Esta semana ocurre en paralelo a la aprobación formal de H1.

**Entregable principal:** D1 disponible (muestra real + acceso de lectura) + entorno técnico de labIA preparado.

#### Tarea 0.1 — Pedir y recibir la muestra real de la casilla 🔒 (IT + CMP)

**Qué se hace, paso a paso:**
1. labIA envía a IT el pedido formal el día 0: una muestra de ~300 a 600 correos que mezcle **años distintos, campañas distintas y ruido real** (autorespuestas, devoluciones, spam).
2. IT exporta en dos piezas, con **solo lectura**: (a) un CSV con metadatos (fecha, remitente, asunto, si trae adjunto) y (b) los correos `.eml/.msg` en una carpeta compartida **dentro de la VPN**.
3. CMP formaliza el acuerdo de confidencialidad y el tratamiento de datos bajo Ley 25.326 (los datos no salen de la red).
4. IT entrega también la **cuenta de servicio EWS/Graph de mínimo privilegio** (o confirma el plan B de importe PST).

**¿Quién entrega?** IT (export + cuenta) y CMP (habilitación). **¿Quién valida?** AF (representatividad) + ESI (acceso funcional).
**Criterio de aceptación:** la muestra incluye ≥ 3 campañas distintas y ruido real; los datos quedaron dentro de la VPN; el acceso EWS/PST probado por ESI.

#### Tarea 0.2 — Entorno y herramientas de labIA listos (ESI + EDI)

**Qué se hace, paso a paso:**
1. ESI prepara el entorno dentro de la VPN: carpeta de trabajo, tablas de staging (`stg_email`, `stg_adjunto`) y acceso al repositorio corporativo de datos.
2. EDI prepara la **planilla del golden set** con validaciones (lista de clases, email_id única, campos obligatorios) y los templates de prompts por campo.
3. Ambos reservan con IT y las áreas las sesiones del kickoff y del etiquetado (días 1–9).

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** RDB (estructura de staging acorde a estándares) + IT (entorno dentro de la VPN).
**Criterio de aceptación:** al día 1 se puede leer la muestra, cargar la planilla y sentarse con las áreas sin esperar permisos.

#### Tarea 0.3 — Definir el alcance acotado con el Sponsor (AF + SP)

**Qué se hace, paso a paso:**
1. Reunión corta: el Sponsor aprueba el **alcance acotado del despliegue** (las 2–3 campañas priorizadas a las que se emitirán datasets en la ventana).
2. Se registran por escrito los límites: todo lo entrante se ingesta, los datasets se emiten para las campañas elegidas, el resto se agrega post-go/no-go.

**¿Quién entrega?** AF (propuesta de campañas). **¿Quién valida?** SP (aprueba el alcance).
**Criterio de aceptación:** alcance acotado firmado y proyectos de campaña conocidos al inicio del kickoff.

**> Qué le demuestra esto a la empresa:** que el plazo de 4 semanas no es magia: se compra con **preparación en paralelo** y con un **alcance explícito y acotado**. El día 1 del cronograma ya está todo habilitado por Aysa y todo montado por labIA.

---

### Semana 1 — Baseline e ingesta

**Objetivo de la semana:** confirmar el problema con **datos reales**, aprobar el esquema ("examen") e instalar el primer tramo del pipeline leyendo la casilla real.

**Entregable principal:** esquema de clasificación aprobado + documento "lectura de la casilla" con % útil real + conector leyendo con dedupe y staging.

#### Tarea 1.1 — Kickoff y taxonomía con el negocio (AF + SP + EDI, día 1)

**Qué se hace, paso a paso:**
1. Kickoff de ½ jornada: recorrido del plan de 4 semanas, roles, regla "nadie valida lo que produce" y calendario de sesiones.
2. Workshop de taxonomía (misma jornada): por cada clase se completa una fila con **definición operativa** (cuándo un correo ES esa clase), **3–5 ejemplos reales** de la muestra, **qué se hace con esa salida** y **quién revisa** los casos.
3. Regla de control: si dos personas del negocio no coinciden en 8 de 10 ejemplos, la definición no está clara → se reescribe en la misma sesión hasta que coincidan.
4. Se aprueba el **esquema de clasificación** (las 5 clases) y el **esquema de extracción** (los 8 campos de contacto).

**¿Quién entrega?** AF (definición de negocio). **¿Quién valida?** SP + RDB (aprueban el esquema).
**Criterio de aceptación:** esquema firmado con ejemplos reales por clase y dueño de revisión por clase.

#### Tarea 1.2 — Contrato de salida con BI, firmado en el kickoff (RDB + ESI, día 2)

**Qué se hace, paso a paso:**
1. Reunión de 1–2 horas con RDB: cerrar **columnas, granularidad, periodicidad y dónde se publica** el dataset por campaña.
2. Se firma el **borrador de contrato** (configurable solo ante hallazgos de la muestra madre).
3. ESI implementa el esqueleto de la salida (CSV/vista BI) desde el día 2.

**¿Quién entrega?** ESI (implementación). **¿Quién valida?** RDB (formato) + AF (contenido de negocio).
**Criterio de aceptación:** contrato firmado y estructura de salida esqueleto lista. Este adelanto elimina el retrabajo del riesgo R6.

#### Tarea 1.3 — Exploratorio: "lectura de la casilla" y % útil real (EDI + AF, días 1–3)

**Qué se hace, paso a paso:**
1. EDI carga el CSV de metadatos y responde 6 preguntas con tablas de frecuencias:
   - ¿Cuántos correos hay por año/mes? (valida el **~50K inicial** y el flujo recurrente bajo)
   - ¿Qué campañas se identifican? (por asunto/remitente)
   - ¿Qué % es ruido real? (autorespuestas, devoluciones, spam, vacíos)
   - ¿Cuántos traen adjuntos y de qué formato?
   - ¿Cuántas cuentas remitentes distintas hay?
   - ¿Cuántos correos vienen incompletos (sin cuerpo o sin datos de cuenta)?
2. EDI aplica la primera versión del filtro de ruido y reporta el **% real de correos útiles** (el que dimensiona el trabajo manual: ~70% → ~35K útiles como referencia a calibrar).
3. AF interpreta con ojos de negocio y confirma/ajusta los supuestos. EDI redacta el documento de 1 página "lectura de la casilla".

**¿Quién entrega?** EDI. **¿Quién valida?** AF (que las conclusiones reflejen el negocio y calcen con su intuición).
**Criterio de aceptación:** documento con números reales de la muestra y % útil aprobado por el negocio antes de seguir.

#### Tarea 1.4 — Conector y staging leyendo correos reales (ESI, días 2–5)

**Qué se hace, paso a paso:**
1. ESI implementa el conector EWS/Graph (o el importe PST si IT eligió el plan B desde la Semana 0).
2. Configura **incremental con dedupe** (ItemId de Exchange + hash SHA-256 del mensaje) y el staging **append-only** en el repositorio corporativo.
3. Corre una prueba con la muestra de la Semana 0; cada fila guarda fecha de proceso y sello de integridad.
4. Implementa el **filtro determinístico de ruido** (sin IA): out-of-office, bounces, spam, vacíos. AF revisa en la muestra cuántos casos detectó.

**¿Quién entrega?** ESI. **¿Quién valida?** IT (accesos correctos y mínimos) + RDB (estructura) + AF (filtro de ruido).
**Criterio de aceptación:** un lote de correos reales leído, sin duplicados, sin tocar la casilla, y ≥90% del ruido conocido de la muestra descartado correctamente.

#### Tarea 1.5 — Golden set: primeras etiquetas (AF ×2 + EDI, días 3–5)

**Qué se hace, paso a paso:**
1. AF y un segundo etiquetador del negocio arrancan el **doble etiquetado** de ~300 correos (clase + campos de contacto + confianza).
2. EDI administra la planilla con validaciones y va midiendo el **acuerdo entre etiquetadores** (objetivo ≥ 0.8).
3. Cuando hay acuerdo en una tanda, se discuten las discrepancias con un tercero (AF + Sponsor).

**¿Quién entrega?** AF (etiquetas). **¿Quién valida?** EDI (consistencia estadística) + AF (resolución de discrepancias).
**Criterio de aceptación de la semana:** el etiquetado avanza sin frenar el resto de los tracks (el objetivo es completarlo el día 9).

**> Qué le demuestra esto a la empresa:** que arrancamos midiendo, no adivinando: la muestra real, la taxonomía firmada y el contrato de salida cerrado en el kickoff garantizan que todo lo que sigue se construye sobre el negocio de Aysa. Y que **BI define el formato antes del primer dataset** — el adelanto que permite el ritmo de 4 semanas.

---

### Semana 2 — Golden set completo, primer modelo y juez

**Objetivo de la semana:** completar el "examen" con el negocio, lograr la primera clasificación/extracción automática y habilitar la evidencia: normalización + acceso de lectura a la fuente corporativa.

**Entregable principal:** golden set versionado con **test congelado** + métricas sobre el set de validación (90 / 95 / <30) + reglas de normalización aprobadas.

#### Tarea 2.1 — Completar y cerrar el golden set (AF ×2 + EDI, días 6–9)

**Qué se hace, paso a paso:**
1. Se termina el doble etiquetado de las ~300 etiquetas; las discrepancias pendientes se resuelven con un tercero.
2. EDI mide el acuerdo final (objetivo ≥ 0.8). Si está por debajo: se vuelve a la tarea 1.1 para reescribir definiciones y se re-etiqueta esa franja (escenario pesimista).
3. EDI divide en **70% train / 15% validation / 15% test**; el **test queda congelado** — nadie lo mira ni lo ajusta hasta el examen final (semana 3).

**¿Quién entrega?** AF (etiquetas de oro) + EDI (división y custodia). **¿Quién valida?** EDI (acuerdo ≥0.8) + AF (resolución de discrepancias).
**Criterio de aceptación:** acuerdo ≥ 0.8, discrepancias resueltas y test congelado fuera del alcance de todo ajuste.

#### Tarea 2.2 — Prompts por campo y primer modelo (EDI, días 6–11)

**Qué se hace, paso a paso:**
1. Para cada campo del esquema, EDI redacta la definición con ejemplos y el **formato de salida obligatorio** (JSON): si el modelo no responde con ese formato, el resultado no se acepta y el caso pasa a revisión.
2. Se arma el patrón **prompt por campo** (Instructor/DocInfo) y se ejecuta la clasificación/extracción sobre el **train** con el modelo elegido (self-host dentro de la VPN o cloud con DPA aprobado).
3. Reporta las **primeras métricas** sobre train (todavía no sobre el test) y EDI + AF revisan los casos mal clasificados para entender el porqué.

**¿Quién entrega?** EDI. **¿Quién valida?** AF (que la descripción de cada campo refleje el negocio) + EDI + AF (revisión conjunta de errores).
**Criterio de aceptación:** primeras métricas de clasificación y extracción sobre train, con errores revisados y documentados.

#### Tarea 2.3 — Juez y umbrales (EDI + AF, días 9–12)

**Qué se hace, paso a paso:**
1. EDI define los casos de "zona gris" (confianza media, campos incompletos, datos contradictorios) e implementa el **segundo pase** de coherencia sobre esos casos (~30% de los correos): formato de cuenta, dígitos del documento, coherencia lógica (CONFIRMA sin contacto → incongruente).
2. Si el juez no confirma → la clase pasa a `DUDOSO` y a la cola humana.
3. Se ajustan los **umbrales de confianza** con AF (criterio: "se equivoque poco y lo dudoso lo resuelva una persona") y se versionan.
4. EDI corre el pipeline sobre el **validation** y reporta contra las metas: **clasificación ≥ 90% · extracción ≥ 95% · derivación < 30%**. Si hay gap, se documenta con plan de cierre para la semana 3.

**¿Quién entrega?** EDI. **¿Quién valida?** AF (reglas del juez y umbrales con ojos de negocio; métricas contra el golden set, no contra la palabra de labIA).
**Criterio de aceptación:** cuadro de métricas sobre validation alineado a las metas, o gap documentado con plan de cierre.

#### Tarea 2.4 — Normalización y acceso de lectura a la fuente corporativa 🔒 (ESI + RDB + IT, días 7–10)

**Qué se hace, paso a paso:**
1. ESI implementa las **reglas de normalización**: mayúsculas, sin tildes, formatos de cuenta y documento (ceros, guiones, espacios). RDB valida contra la fuente corporativa; se versionan.
2. Se adelanta el **permiso de lectura (mínimo privilegio)** de la base de datos relacional corporativa 🔒 (era el bloqueador D3 de la semana 7): RDB lo solicita en el día 7, IT lo habilita, ESI confirma que puede consultar datos reales (sin escribir).

**¿Quién entrega?** ESI (reglas) + RDB/IT (habilitación). **¿Quién valida?** RDB (reglas) + CMP (Ley 25.326) + ESI (consulta funcionando).
**Criterio de aceptación:** consulta de lectura real funcionando al día 10 — es el insumo del cruce del día 12.

**> Qué le demuestra esto a la empresa:** que el "examen" lo define el negocio (el golden set es de Aysa, con doble etiquetado y un test bajo llave) y que la evidencia se habilita **antes** del examen final: a la semana 3 no se espera ningún permiso. La velocidad se compra con adelanto de habilitaciones, no con recortar calidad.

---

### Semana 3 — Cruce, examen final y datasets v1

**Objetivo de la semana:** conectar la evidencia contra la fuente corporativa, medir el piloto contra el **set que nadie miró** y publicar los primeros datasets por campaña.

**Entregable principal:** un correo real resuelto **de punta a punta** + métricas finales de go/no-go con números cerrados.

#### Tarea 3.1 — Cruce determinístico contra la fuente corporativa (ESI + RDB, días 12–15)

**Qué se hace, paso a paso:**
1. ESI implementa el cruce con **reglas de código** (sin IA): comparar cuenta/contrato + titular contra la base corporativa, con normalización aplicada.
2. Cada correo queda con una de tres evidencias: `Coincide · No coincide · Requiere revisión`, con el motivo.
3. RDB valida que las reglas reflejan cómo se identifica una cuenta en Aysa; AF valida el criterio de negocio.

**¿Quién entrega?** ESI. **¿Quién valida?** RDB (reglas) + AF (criterio de negocio).
**Criterio de aceptación:** cada correo tiene evidencia con motivo; los casos ambiguos van a revisión (nunca se deciden solos).

#### Tarea 3.2 — Primer caso real de punta a punta (ESI + EDI + AF, día 15)

**Qué se hace, paso a paso:**
1. Se toma un correo real y recorre todo el pipeline: conector → filtro → clasificación → extracción → normalización → cruce → dataset.
2. AF revisa cada punto del recorrido y confirma que el resultado tiene sentido de negocio.
3. Queda registrado el primer caso "resuelto" como hito demostrable.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** AF + RDB.
**Criterio de aceptación:** un correo real recorrió todo el pipeline con evidencia y fue validado por el negocio.

#### Tarea 3.3 — Examen final sobre el test congelado (EDI + AF, días 16–18)

**Qué se hace, paso a paso:**
1. EDI ejecuta el pipeline completo sobre el set de **test** (congelado en la semana 2, nunca usado para ajustar).
2. Reporta las **métricas finales**: clasificación, extracción, derivación y cobertura.
3. AF confirma contra las etiquetas de oro (contraloría cruzada).
4. Con los errores del test, EDI propone ajustes finos (prompts, umbrales); AF decide si cambian criterio de negocio o solo técnico; se registra la diferencia entre la primera corrida y la versión final. **El resultado reportado es el de la primera corrida honesta** — no hay forma de "cocinar" el número.

**¿Quién entrega?** EDI. **¿Quién valida?** AF + EDI.
**Criterio de aceptación:** métricas finales reportadas con su versión, contra un set que nadie miró.

#### Tarea 3.4 — Revisión de la cola humana y decisión de modelo con dato (EDI + AF + CMP + IT, días 16–20)

**Qué se hace, paso a paso:**
1. AF revisa los casos derivados a la cola humana: ¿son razonables? ¿una persona los resuelve rápido? Se documenta el tiempo por caso dudoso.
2. EDI reporta el cómputo real consumido en la muestra y las **estimaciones finales** de costo para el histórico y el recurrente.
3. IT confirma la disponibilidad de cómputo para self-host; CMP aprueba (o no) el DPA para cloud.
4. Se toma la decisión **self-host vs cloud** con el dato real, no por preferencia.

**¿Quién entrega?** EDI (números) + AF (cola). **¿Quién valida?** IT + CMP (decisión) + AF (negocio).
**Criterio de aceptación:** decisión de despliegue registrada con el cómputo real como evidencia.

#### Tarea 3.5 — Datasets v1 por campaña priorizada (ESI + RDB, días 18–21)

**Qué se hace, paso a paso:**
1. Con el contrato firmado en el día 2, ESI publica los **primeros datasets por campaña** (campañas priorizadas del alcance acotado) con el rastro de evidencia por fila.
2. RDB valida el contenido y el formato; AF valida el contenido de negocio.
3. Se ajusta cualquier desvío del contrato antes de la semana 4.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** RDB (formato/calidad) + AF (contenido).
**Criterio de aceptación:** datasets v1 servidos en el formato firmado, con evidencia por fila.

**> Qué le demuestra esto a la empresa:** que la confianza no depende de la IA: la evidencia la da un cruce determinístico contra los datos de Aysa, reproducible y auditable; y que ya hay **datasets v1 circulando** antes de la semana 4, en el formato que definió BI. Las métricas finales salen de un examen congelado: no hay forma de arreglarlas.

---

### Semana 4 — Datasets finales, informe y traspaso

**Objetivo de la semana:** consolidar todo en entregables, cerrar los números del gate y dejar H1 **desplegado** y traspasado al negocio.

**Entregable principal:** H1 desplegado (datasets por campaña + evidencias + documentación + tablero) + informe de go/no-go con 3 escenarios + firma.

#### Tarea 4.1 — Procesar el lote acotado con el pipeline final (ESI + EDI, días 22–25)

**Qué se hace, paso a paso:**
1. Se procesa el **lote acotado de los correos útiles de las campañas priorizadas** con el pipeline final (no solo la muestra).
2. Se generan los **datasets por campaña** en el formato firmado con el rastro de evidencia por correo.
3. RDB valida el contenido final; AF valida los criterios de negocio.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** RDB + AF.
**Criterio de aceptación:** dataset por campaña con evidencia por fila, en el formato firmado, dentro de la ventana.

#### Tarea 4.2 — Documentación técnica y tablero de métricas (ESI + EDI + RDB, días 23–26)

**Qué se hace, paso a paso:**
1. ESI documenta el conector, el staging, el filtro, la normalización y el cruce; EDI documenta el esquema, los prompts, el juez y los umbrales (con versiones).
2. IT y RDB revisan y aprueban la documentación; se publica versionada (v1.0) en el repositorio de Aysa.
3. Se arma el **tablero de métricas** con las leading (precisión, % derivación, tiempo por caso) y lagging (inconsistencias por origen, datasets entregados, horas liberadas). RDB valida calidad; AF valida contenido.

**¿Quién entrega?** ESI + EDI. **¿Quién valida?** IT + RDB + AF.
**Criterio de aceptación:** documentación aprobada y tablero publicado.

#### Tarea 4.3 — Validación final e informe de go/no-go (EDI + AF + RDB + SP, días 26–28)

**Qué se hace, paso a paso:**
1. Revisión conjunta de las 5 métricas contra el resultado real del test; AF confirma con ojos de negocio; RDB confirma calidad del dataset y evidencia 100%.
2. EDI arma el informe con **3 escenarios**: pesimista (si se mantienen los umbrales actuales), base (recomendado) y optimista (si el tuneo fino rinde más), todos anclados en el baseline medido.
3. El registro de riesgos se actualiza con el resultado real y la decisión de despliegue.
4. AF presenta el informe al Sponsor; el gate decide el go o el no-go con los números.

**¿Quién entrega?** EDI (métricas + informe). **¿Quién valida?** AF + RDB + SP (gate).
**Criterio de aceptación:** informe cerrado con 3 escenarios y registro de riesgos actualizado.

#### Tarea 4.4 — Traspaso, show & tell y firma (SP + AF + RDB, día 28)

**Qué se hace, paso a paso:**
1. Sesión de **show & tell** con las áreas: datasets, tablero, evidencias y el recorrido de un correo en vivo.
2. Traspaso de la operación al área de datos / BI (con la documentación versionada y el período de acompañamiento acotado de labIA definido en el acuerdo).
3. Firma del cierre del despliegue; se listan los desvíos del escenario pesimista, si los hubo, y se documentan.

**¿Quién entrega?** ESI + EDI (materiales) + AF (conducción). **¿Quién valida?** SP (firma).
**Criterio de aceptación:** despliegue firmado y operación en manos de Aysa al cierre del día 28.

**> Qué le demuestra esto a la empresa:** que reciben algo consumible y auditable — dataset + evidencia + documentación + tablero — **desplegado en 4 semanas**, con la operación transferida y el gate decidido con números, no con la palabra de nadie.

---

## 5 · Lo que Aysa debe entregar para que nada se trabe (bloqueadores 🔒)

| # | Entregable de Aysa | Quién | Para qué tarea | Fecha límite | Si se demora |
|---|---|---|---|---|---|
| D1 | Muestra representativa + acceso de lectura (o export PST) | IT + CMP | Pre-arranque 0.1 · 1.4 | **Semana 0 (antes del día 1)** | Se corre todo el cronograma (escenario pesimista): no se arranca sobre supuestos |
| D2 | Sesiones de negocio: taxonomía (día 1) y etiquetado doble del golden set (días 3–9) | AF ×2 / negocio | 1.1 · 1.5 · 2.1 | Días 1–9 | El golden set se atrasa y el test congelado se mueve (pesimista) |
| D3 | Permisos de lectura de la fuente corporativa | RDB / IT | Tarea 2.4 (cruce día 12) | **Días 7–10** | El cruce se valida con datos de prueba, no reales |
| D4 | Aprobación CMP del manejo de PII (self-host o DPA si cloud) | CMP | 0.1 · 3.4 | Días 1–16 | Se elige self-host (recomendado de todos modos); si no hay decisión, no se cierra el costo |

---

## 6 · Métricas objetivo del go/no-go (definidas de antemano, lámina 15)

| Métrica | Meta | Cómo se mide | Quién mide / quién valida |
|---|---|---|---|
| Precisión de clasificación | ≥ 90% | Golden set de test (etiqueta predicha vs oro) | EDI mide / AF valida |
| Precisión de extracción de campos clave | ≥ 95% | Campos correctos vs golden set | EDI mide / AF valida |
| Tasa de derivación a revisión | < 30% | % de casos que van a cola humana | EDI mide / AF valida |
| Cobertura por campaña | ≥ 95% de emails útiles | Asignación correcta a campaña/dataset | EDI mide / RDB valida |
| Evidencia por email | 100% · bloqueante | Rastro de cruce en cada fila del dataset | RDB valida / bloqueante |

---

## 7 · Regla de go/no-go (resumen para el gate)

**GO** → se cumplen las 5 métricas de la tabla anterior (la evidencia 100% es bloqueante: sin ella no hay go, pase lo que pase con el resto) y la operación quedó traspasada al área de datos.

**NO-GO** → se activa cualquier kill criterion (ver lámina 15):
- Desvío del despliegue > 6 semanas (fecha de H1 con valor).
- Adopción > 50% bajo lo previsto.
- Precisión que no cierra ni con revisión de las áreas.
- Muestra/acceso nunca habilitados (D1 sin entregar en el pre-arranque).
- Costo operativo fuera de rango frente a la muestra real.
Se cierra con **pérdida acotada al piloto**, se documenta el aprendizaje y no se toca ningún sistema.

La decisión final la toma el **Sponsor de Aysa** con el comité (IT + Compliance + áreas), sobre los números del informe, no sobre la palabra de labIA.

---

## 8 · La operación en marcha (lo que queda automatizado después de desplegar)

**Para qué sirve esta sección:** las semanas 0–4 construyen y despliegan H1; acá se explica qué queda **corriendo en producción** cuando se cierra. Es la respuesta a "¿y después de desplegar, qué?".

### Qué queda automatizado

| Tramo | Cómo funciona en producción | Intervención manual |
|---|---|---|
| **Ingesta incremental** | El conector (dentro de la VPN) levanta solo los correos nuevos de la casilla en cada corrida programada; dedupe + sello de integridad; staging append-only en el repositorio corporativo | Ninguna |
| **Filtro y clasificación + extracción** | Reglas determinísticas de ruido + modelo liviano con schema estricto sobre cada correo útil | Ninguna (las respuestas fuera de formato van a revisión, nunca se guardan) |
| **Juez y derivación** | Segundo pase sobre los casos grises; si no se confirma, el caso va a la cola de revisión humana | La persona del área resuelve solo lo dudoso |
| **Cruce contra la fuente corporativa** | Reglas de código (sin IA) contra la base relacional; evidencia `Coincide · No coincide · Requiere revisión` en cada corrida | Ninguna |
| **Salidas y dashboard** | Datasets por campaña en el formato BI firmado + tablero de métricas, actualizados en cada corrida | Ninguna |

### Quién opera el día a día en Aysa

- **Área de datos / BI** → ejecuta y monitorea las corridas, revisa alertas y valida la calidad de los datasets. Es el dueño operativo.
- **Referente funcional (negocio)** → revisa la cola de revisión, aprueba criterios de clasificación y valida los resultados con ojos de negocio.
- **labIA** → período de acompañamiento acotado durante la estabilización (definido en el acuerdo), con cambios de umbrales/reglas bajo gobernanza y versionado.
- **Compliance** → revisión periódica del tratamiento de datos (Ley 25.326): retención, acceso y DPA si se eligió cloud.

### Reglas que se mantienen en producción

- **La herramienta sustenta, el área decide**: lo dudoso lo resuelve una persona y su decisión queda registrada.
- **Trazabilidad completa**: cada fila de dataset conserva su rastro de evidencia y su versión de reglas/umbrales.
- **Cambios con gobernanza**: cualquier ajuste de umbrales, prompts o normalización se versiona y se mide antes, con el mismo patrón del despliegue.

### Escalado (lo que habilita)

- Las **campañas restantes** del histórico (~50K inicial) se emiten post-go/no-go con el mismo motor y costo marginal bajo: el alcance acotado del despliegue es una restricción de ventana, no de capacidad.
- El **mismo motor** se aplica a otras casillas y áreas (Dirección Comercial, Comunicaciones).
- **Enterprise** agrega OCR documental y verificación multiprueba sobre la misma arquitectura.
- **RPA opcional (posterior)**: automatizar el último tramo —detectada la inconsistencia, generar la corrección o actualizar la fuente de origen— solo si Aysa ya opera RPA y con su propio go/no-go.