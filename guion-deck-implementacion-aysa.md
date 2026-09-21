# Guión del plan de trabajo — labIA · Aysa · Despliegue MVP 4 semanas (arquitectura, actividades y roles)

> **Uso interno labIA · ESI/EDI.** No es para el cliente. Este deck es el **plan de trabajo** del equipo: arquitectura detallada de los componentes C1–C10, actividades semana a semana y roles. La decisión de infraestructura ya está tomada con Aysa: **todo corre local, sin nube**. El guión te da, por lámina: (1) objetivo, (2) qué decir (casi literal), (3) el análisis detrás del dato, (4) preguntas posibles con respuestas fundamentadas y (5) decisiones/pendientes abiertos.
>
> **22 láminas · v0.2 · 15 Sep 2026.** Se quitaron del deck las láminas de métricas/go-no-go y de bloqueadores: esto es un plan de trabajo, no una propuesta de venta ni una evaluación. Los criterios de calidad quedan como **criterios de aceptación de semana** (dentro del plan), no como go/no-go al cliente.
>
> **Narrativa de fondo:** cada lámina responde qué construye labIA, en qué orden, quién lo hace (roles) y qué resultado se espera. Las dependencias con el cliente aparecen como **coordinaciones** dentro del plan (muestra, etiquetado, permisos), no como "bloqueadores". Dos ejes transversales: "la herramienta clasifica y extrae · la evidencia la aporta el cruce · la decisión final es del área responsable" y "nadie valida lo que produce".

---

## Reglas de defensa interna (aplican a toda la demo)

1. **Lidera con la condición de entrada, no con tecnología.** El arranque no se da por actividad: se da porque **la muestra y el acceso están** (coordinado antes del día 1). Si preguntan "¿por qué 4 semanas?", la respuesta corta es "porque el reloj corre desde que tenemos la muestra real".
2. **Nunca un solo número:** siempre 3 escenarios (pesimista / base / optimista) con su supuesto — sobre todo en plazo (lámina 3) y huella de cómputo (lámina 13).
3. **Toda cifra ancla en un baseline medible:** ~50K emails históricos, ~70% de utilidad a calibrar con la muestra en S1, huella de cómputo dimensionada sobre el consumo real de la muestra (días 16–20). Lo que no se puede verificar hoy está marcado como **pendiente de medición** en las láminas 12, 13 y 20.
4. **La infraestructura está decidida y no se reabre:** local en la red de Aysa, sin nube, sin DPA. Si alguien sugiere cloud, la respuesta es "definido con Aysa: local; no se vuelve a discutir en este plan".
5. **Roles claros en todo:** cada tarea tiene dueño (ESI o EDI) y cada entrega una validación cruzada (AF/RDB/IT). "Nadie valida lo que produce" es la garantía de honestidad del resultado.
6. **Tené el registro de riesgos a mano (lámina 19):** cada objeción técnica se responde con una fila T1–T9 y su mitigación, no con improvisación.

---

## Lámina 1 · Portada

**Objetivo.** Situar al equipo: qué se despliega (MVP Calidad de Datos de Contacto), la decisión local, la ruta técnica en un vistazo y los roles.

**Qué decir.**
> "Este es el plan de trabajo del MVP de calidad de datos de contacto para Aysa. Despliegue base de 4 semanas, optimista 3, pesimista 6. Todo corre local, dentro de la red de Aysa: lo definimos con el cliente y no hay nube. El pipeline tiene 10 componentes C1–C10 en 8 capas, y el equipo se organiza en dos roles: ESI (integración) y EDI (datos/IA). En este deck no hay narrativa de venta: es qué construimos, en qué orden, quién lo hace y qué resultado queda."

**Análisis detrás del dato.** Los números de portada vienen del plan de trabajo aprobado (`plan-4-semanas-aysa.md`): 4/3/6 semanas (supuestos: EWS directo y golden set al día 1 = optimista; acceso o re-etiquetado demorado = pesimista), 10 componentes C1–C10, 2 roles internos. La decisión "local, sin nube" es un acuerdo con Aysa, no una preferencia: por eso aparece destacada en la portada y en la lámina 13.

**Preguntas posibles.**
- *¿Por qué local y no nube?* Es lo definido con Aysa en la reserva de alcance. Los datos no salen de la red del cliente (Ley 25.326 sin transferencia de PII) y la familia de modelos elegida corre dentro del cómputo local de Aysa.
- *¿Los 3 escenarios son de plazo o de dinero?* Solo de plazo y huella de cómputo; no hay estimación de costos de token (no corresponde presupuestar nube).

**Decisiones / pendientes.** Ninguna en esta lámina.

---

## Lámina 2 · Alcance labIA (qué construimos y sus límites)

**Objetivo.** Fijar el perímetro de responsabilidad del equipo y las reglas IA vs código y local.

**Qué decir.**
> "Construimos el conector de lectura de la casilla con dedupe y staging, el filtro determinístico de ruido, el modelo de clasificación y extracción con schema estricto, el juez, la normalización, el cruce determinístico contra la fuente con evidencia, y los datasets más el tablero y el log de auditoría. No escribimos en las fuentes, no definimos la taxonomía de negocio, no corregimos datos automáticamente, no reemplazamos sistemas y nada decide solo. Todo corre local: los datos nunca salen del entorno del cliente."

**Análisis detrás del dato.** El alcance replica el patrón interno de referencia de labIA: "piso en código vs IA". La línea divisoria es exactitud (evidencia reproducible) → código; interpretación (texto de un correo) → IA. La taxonomía de salida es técnica (5 clases); la de negocio la define el cliente.

**Preguntas posibles.**
- *¿Por qué no corregimos datos?* Porque corregir toca la fuente y el área responsable; nuestro entregable es un dataset con evidencia para decidir.
- *¿El "local" genera algún costo de cómputo para Aysa?* Sí, en infraestructura propia; por eso la lámina 13 dimensiona la huella mínima y la coordina con IT.

**Decisiones / pendientes.** Ninguna.

---

## Lámina 3 · Cómo se organiza el trabajo (4 semanas sin comprimir la validación)

**Objetivo.** Defender el plazo del plan: qué palancas se usan y qué NO se comprime.

**Qué decir.**
> "El plazo se gana con 4 palancas: pre-arranque en paralelo (muestra y acceso antes del día 1), MVP acotado a las campañas priorizadas, tracks ESI y EDI en paralelo desde el día 1, y el contrato de salida el día 2. Lo que nunca se comprime es la validación: golden set completo, doble etiquetado y split 70/15/15, test congelado fuera de todo ajuste, los criterios de aceptación de cada semana y la regla 'nadie valida lo que produce'. Escenarios: optimista 3 semanas si EWS directo y golden set listos al día 1; base 4; pesimista 6 si el acceso se demora o el golden set requiere re-etiquetado. Regla de oro: el reloj corre cuando la muestra está; nunca se arranca sobre supuestos."

**Análisis detrás del dato.** Golden = ~300 casos, doble etiquetado por 2 personas del negocio, split 70 train / 15 validation / 15 test. Es la fuente de los criterios de aceptación de S2 (lámina 16). La regla de oro del plazo es el argumento que blinda al plan contra promesas de entrega imposibles.

**Preguntas posibles.**
- *¿Por qué no 2 semanas?* Porque el golden set necesita ~300 casos etiquetados doble (días 3–9), el modelo no se ajusta sin métricas sobre validation y el cruce exige permisos reales (días 7–10). Firmar un plazo menor es vender humo.
- *¿Qué pasa si la muestra no llega al kickoff?* Se replanifica al pesimista y se avisa al sponsor con el caso documentado.

**Decisiones / pendientes.** Coordinación de muestra + acceso antes del día 1 (IT + CMP). Es el gatillo de escenario.

---

## Lámina 4 · Arquitectura de 8 capas

**Objetivo.** Mostrar el pipeline completo, el corte código vs IA y el orden de implementación.

**Qué decir.**
> "Son 8 capas: ingesta, filtro, clasificación + extracción, juez, normalización, cruce determinístico, salidas + tablero y auditoría. De lado IA van la clasificación, la extracción, el segundo pase del juez y las explicaciones. De lado código van la ingesta, el filtro, la normalización, el cruce de identidad, las salidas y la auditoría. El porqué es simple: la evidencia tiene que ser reproducible y auditable, y eso nunca es IA. La herramienta clasifica y extrae, la evidencia la aporta el cruce, la decisión final es del área responsable. Cada correo útil queda con clase, campos extraídos, evidencia del cruce y versión de reglas y prompts."

**Análisis detrás del dato.** Las 8 capas no se construyen de golpe: se validan etapa por etapa contra el golden set; el test congelado (lámina 17) asegura que el resultado de la semana 3 es honesto (primera corrida sobre un set que nadie miró).

**Preguntas posibles.**
- *¿Por qué el cruce de identidad no es IA?* Porque "¿coincide esta cuenta contra la base?" se responde con un JOIN reproducible; el LLM no prueba nada.
- *¿Qué pasa si una capa falla?* Se detecta en su etapa de validación contra el golden set, con reporte de errores documentado; no avanza al siguiente hito.

**Decisiones / pendientes.** El detalle de cada capa está en las láminas 6–9 y en el modelo de datos (lámina 10).

---

## Lámina 5 · Proceso end-to-end (un correo a la vez)

**Objetivo.** Que el equipo se meta en el mismo pipeline como un solo correo, con su rastro completo.

**Qué decir.**
> "Un correo útil: ingresa por el conector dentro de la VPN copiando solo lo nuevo al staging con sello único; el filtro determinístico descarta autorespuestas, devoluciones y spam; la IA clasifica y extrae con formato estricto — si falta un campo, queda marcado; el cruce verifica contra la base relacional dando Coincide, No coincide o Requiere revisión; y se arma el dataset por campaña con el rastro de por qué cada caso quedó donde quedó. Cada correo deja: clase, campos, evidencia de qué fila de la fuente lo sustentó, versión de modelo y prompt, y reviewer si pasó por humano. Piso de control: los casos ambiguos nunca se deciden solos, el JSON mal formado va a revisión, y sin evidencia del cruce el caso no se libera."

**Análisis detrás del dato.** Clases: CONFIRMA · NO_ES_MIA · DUDOSO · OPTOUT · IRRELEVANTE. Campos de contacto: email, cuenta, nombre_apellido, dirección, teléfono, documento_y_tipo, relación_titular, titular. El paso E genera el dataset por campaña que consumen las áreas.

**Preguntas posibles.**
- *¿Y si el email no es útil?* El filtro lo marca ruido y no entra al modelo: no gasta cómputo ni llega al dataset.
- *¿Cuál es el peor caso para un correo?* El DUDOSO sin evidencia: queda en cola humana hasta que una persona distinta decide. Nunca se libera automáticamente.

**Decisiones / pendientes.** Ninguna.

---

## Lámina 6 · Ingesta y filtro (C1–C5 · ESI)

**Objetivo.** Detallar la puerta de entrada: cómo se lee, se deduplica, se guarda y se filtra — todo con la seguridad local.

**Qué decir.**
> "C1 es el conector Exchange: EWS SyncFolderItems con watermark, o Graph API, con cuenta de servicio mínimo privilegio, solo lectura. C2 es el plan B — importe PST — por si IT no habilita la conexión directa; desbloquea el cronograma. C3 es dedupe e incremental: ItemId de Exchange más SHA-256 del mensaje completo, cursor por watermark. C4 es el staging append-only: stg_email y stg_adjunto, nunca se edita ni se borra, cada relectura es fila nueva con checksum. C5 es el filtro determinístico, sin IA: OOO, Delivery Status Notification, spam y vacíos; lo que sale como ruido no gasta cómputo del modelo. Seguridad de la puerta: una única cuenta de servicio de solo lectura, las credenciales las crea IT del cliente y viven en su gestor de secretos; el secreto jamás viaja en código."

**Análisis detrás del dato.** Este bloque es 100% ESI y 100% código: no decide nada, solo trae datos crudos limpios de ruido con trazabilidad total (checksum + workload por relectura). El plan B (C2) es lo que protege el plazo si IT no da conexión directa.

**Preguntas posibles.**
- *¿Qué pasa si el hash cambia para un correo idéntico?* Hash distinto → se marca revisado y queda la relectura trazable; el dedupe por ItemId cubre a Exchange y el hash es la red de seguridad.
- *¿Cada cuánto corre la ingesta?* Cada 10–15 min o diario según volumen, definido en S1 con el dato real.

**Decisiones / pendientes.** Decisión técnica 3 (perfil exacto de solo lectura: AppImpersonation vs Full Access RO vs Graph scoped) en el pre-arranque, a cargo de ESI.

---

## Lámina 7 · Clasificación / extracción + juez (C6 · EDI)

**Objetivo.** Detallar el único componente de IA: cómo se construye, el schema estricto, los modelos locales y el juez.

**Qué decir.**
> "C6 es el componente de IA, a cargo de EDI. Se construye con prompt por campo (patrón Instructor/DocInfo): definición, ejemplos y formato de salida obligatorio. Schema estricto validado por código: si no parsea o no cumple, el caso va a revisión. Campos ausentes → null explícito, nunca se inventa un valor. Modelos locales: Qwen2.5-7B/14B self-host en la VPN del cliente. El juez es el segundo pase sobre la zona gris —un 30% de casos con confianza media, campos incompletos o contradicciones—: verifica coherencia y formato según Aysa; si no confirma, el caso va DUDOSO a cola humana. Cada fila guarda modelo_version y prompt_version."

**Análisis detrás del dato.** El schema de salida es el contrato entre el modelo y el resto del pipeline: clase (5 valores), campaña, contacto (8 campos), confianza y razón. El juez no es divergente del modelo: es el mismo "piso de control" corriendo sobre la zona gris para que nada ambiguo se libere solo.

**Preguntas posibles.**
- *¿Por qué Qwen y no otro modelo?* Porque debe correr local en infraestructura de Aysa; la familia Qwen2.5-7B/14B da buena exactitud en clasificación/extracción dentro del presupuesto de cómputo local. La versión exacta se valida en S1 con la muestra (decisión técnica 1).
- *¿El juez agrega latencia?* Solo sobre ~30% de casos (zona gris); el resto sale directo.

**Decisiones / pendientes.** Decisión técnica 1 (versión de modelo 7B vs 14B) validada con la muestra en S1, a cargo de EDI.

---

## Lámina 8 · Normalización y cruce (C7–C8 · ESI)

**Objetivo.** Detallar dónde se construye la evidencia: normalización de campos y cruce determinístico contra la fuente.

**Qué decir.**
> "C7 normaliza los campos extraídos antes del cruce: trim, mayúsculas, sin tildes, formatos de cuenta y documento. La razón es simple: la cuenta y el documento rara vez vienen iguales en el email que en la base. Reglas versionadas y validadas contra la fuente por RDB en los días 7–10. C8 es el cruce determinístico: stored proc o vista con JOIN contra la base relacional corporativa, sin LLM, reproducible y auditable; nunca escribe ni actualiza la fuente. La lógica de evidencia: cuenta/contrato + titular coinciden → Coincide; no encontrado o contradictorio → No coincide + motivo; match parcial o campos ausentes → Requiere revisión; sin match pero coherente → Requiere revisión, nunca se inventa. Cada estado guarda id_fila_que_valido: qué fila de la fuente sustentó el resultado."

**Análisis detrás del dato.** El cruce es la columna vertebral de la exactitud: es lo que hace que "¿cómo saben que es ese titular?" tenga respuesta con fila exacta. Depende de los permisos de lectura coordinados con IT (días 7–10); si se demoran, el cruce se valida con datos de prueba y la evidencia final se revalida en S3 como desvío documentado.

**Preguntas posibles.**
- *¿Por qué la normalización no es IA?* Porque son reglas versionadas; si fuera IA no sería reproducible ante auditoría.
- *¿Qué pasa si una cuenta normalizada no matchea?* Va a Requiere revisión para el área responsable; nunca se fuerza un match.

**Decisiones / pendientes.** Decisión técnica 2 (campos de la fuente disponibles para el cruce) coordinada con RDB/IT (días 7–10), a cargo de ESI.

---

## Lámina 9 · Salidas, tablero y auditoría (C9–C10 · ESI/EDI)

**Objetivo.** Detallar lo consumible: el contrato de salida, el tablero y el cierre del circuito con auditoría.

**Qué decir.**
> "C9 es el contrato de salida: esqueleto CSV/vista BI implementado desde la semana 1, formato firmado con BI el día 2 —columnas, granularidad, periodicidad y publicación—. Es un adelanto que elimina retrabajo en caliente. C10 es el tablero de métricas: leading por fase (precisión de clasificación/extracción, % de derivación, tiempo por caso) y lagging (inconsistencias por origen, datasets entregados, horas de revisión liberadas). El cierre del circuito es la auditoría: seg_decision con email_id, estado, motivo, id_fila_que_valido, reviewer y reviewed_at; seg_campana como dataset por campaña; log append-only e inmutable donde cada cierre humano deja nombre y timestamp, y cada fila conserva versión de modelo y prompt. Exportable para auditoría externa."

**Análisis detrás del dato.** El contrato firmado el día 2 es lo que garantiza que los datasets salgan en el formato que las áreas consumen; el id_fila_que_valido es lo que hace auditable la evidencia. La salida de la ventana es un lote acotado de las campañas priorizadas — restricción de ventana, no de capacidad: el resto del histórico se procesa post-cierre con el mismo motor.

**Preguntas posibles.**
- *¿Y si BI cambia el formato?* El contrato del día 2 lo fija; cualquier cambio post-firma se registra como cambio de contrato y se versiona.
- *¿El dataset es exportable?* Sí, y el log de auditoría también: exportable para auditoría externa.

**Decisiones / pendientes.** Decisión técnica 4 (rutas de salida y periodicidad) cerrada en el contrato del día 2, a cargo de ESI.

---

## Lámina 10 · Modelo de datos (staging y segmentos)

**Objetivo.** Mostrar dónde vive cada dato y las reglas de integridad.

**Qué decir.**
> "Cuatro bloques: ingesta append-only (stg_email y stg_adjunto), extracción con versión de modelo y prompt por fila (stg_extraccion), evidencia y decisión (seg_decision con id_fila_que_valido, y seg_campana como dataset por campaña con el formato del contrato BI), y las reglas de datos. Ninguna fila se edita ni se borra: cada relectura es una fila nueva con checksum. JSON inválido → rechazo → revisión. Campos ausentes → null explícito. Dedupe a nivel fila con hash + ItemId para reproceso idempotente. Y evidencia 100%: sin id_fila_que_valido el caso no se libera."

**Análisis detrás del dato.** El modelo sale del documento de arquitectura (`arquitectura-labia-aysa.md`). `id_fila_que_valido` apunta a la fila de la fuente corporativa que sustentó el resultado: es lo que hace auditable "¿cómo saben que es ese titular?". El formato de seg_campana lo fija el contrato BI (lámina 9).

**Preguntas posibles.**
- *¿Por qué append-only y no update?* Trazabilidad: si se re-lee un correo, queda la historia completa. No hay forma de que un reproceso borre evidencia.
- *¿Qué pasa con los adjuntos?* Se persisten en stg_adjunto con nombre, formato, tamaño y path; hoy no se extrae contenido de adjuntos (fuera de alcance del MVP).

**Decisiones / pendientes.** Formato de seg_campana definido por el contrato BI (día 2).

---

## Lámina 11 · IA vs código ("piso")

**Objetivo.** Que quede sin ambigüedad qué se delega a IA y qué se queda en reglas.

**Qué decir.**
> "Se delega a IA lo interpretativo: clasificar cada correo útil en una de 5 clases con campaña tentativa, extraer los 8 campos de contacto, el segundo pase del juez sobre la zona gris y la explicación de cada clasificación. Se conserva en código lo de exactitud y auditoría: lectura de Exchange con usuario de solo lectura, filtro de ruido determinístico, dedupe y hash, normalización, cruce contra la fuente y log inmutable con firma humana. La regla es 'el LLM sugiere, la regla confirma'."

**Análisis detrás del dato.** El reparto replica el patrón interno de labIA (piso en código vs IA). Justificación técnica: interpretar texto es tarea estadística ideal para IA; confirmar contra la base es exactitud + registro.

**Preguntas posibles.**
- *¿Por qué la normalización no es IA?* Porque son reglas versionadas reproducibles ante auditoría.
- *¿Y la explicación/razón?* Es la única salida de IA que no decide nada: solo documenta el porqué.

**Decisiones / pendientes.** Ninguna.

---

## Lámina 12 · Model routing local (usar modelos con cabeza)

**Objetivo.** Controlar el costo de cómputo local desde el diseño: qué modelo toca cada tarea y con qué frecuencia.

**Qué decir.**
> "El filtro de ruido no es IA. La clasificación y extracción, alta frecuencia —uno por email útil—, usa el modelo liviano local: Qwen2.5-7B/14B self-host, con prompt por campo. El juez usa la misma familia sobre el 30% de casos. La explicación también liviano. Solo lo de baja y muy baja frecuencia —agrupación de revisiones y materiales del informe— usa la familia local potente. Regla de consumo: el LLM no procesa lo que el filtro y el código ya decidieron. El baseline para dimensionar son ~50K emails históricos con ~70% de utilidad a calibrar en S1 (≈35K útiles). Sin muestra real no se dimensiona cómputo."

**Análisis detrás del dato.** Como no hay nube ni DPA, el "costo" se expresa en huella de cómputo local, no en tokens: qué modelo corre y cuántas veces por volumen. El paso de "utilidad ~70%" es un supuesto a calibrar en S1. La decisión 1 (versión de modelo) y la decisión 5 (cómputo/almacenamiento a reservar con IT) dependen de esta medición.

**Preguntas posibles.**
- *¿Por qué no una familia grande para todo?* Porque clasificación/extracción es tarea repetitiva y estructurada; la familia grande no gana precisión ahí y multiplica la huella local.
- *¿Cómo se controla el costo real?* Con la decisión 5: cómputo y almacenamiento medidos sobre la muestra y reservados con IT, no estimados a ciegas.

**Decisiones / pendientes.** Decisión técnica 1 (versión de modelo — EDI, validar en S1) y decisión técnica 5 (cómputo/almacenamiento local — ESI+EDI+IT, tras S1).

---

## Lámina 13 · Infraestructura local (decisión acordada con Aysa)

**Objetivo.** Fijar que corre local, con qué huella mínima y cuándo se confirma el tamaño exacto con datos.

**Qué decir.**
> "Todo corre local, dentro de la VPN de Aysa — es lo definido con el cliente. Modelos Qwen 7B/14B self-host, más la familia potente para resúmenes. Los datos nunca salen de la red: cumplimiento Ley 25.326 sin transferencia de PII. Requisito: cómputo provisto por IT del cliente en su infraestructura. Huella en 3 escenarios: pesimista 2vCPU/8GB con 100 GB y respaldo semanal; base 4vCPU/16GB con 300 GB y respaldo diario; optimista 8–16vCPU/32GB con 1 TB. El dimensionamiento final (días 16–20) se confirma con IT con el cómputo real medido sobre la muestra; la familia de modelos definida corre dentro del presupuesto local de Aysa."

**Análisis detrás del dato.** La decisión local elimina todo el capítulo nube/DPA: no hay que preguntar "self-host o cloud", está resuelto (lo marca la etiqueta "Decisión acordada con Aysa"). Los 3 escenarios de huella se calibran contra el consumo real de la muestra en S1 y se confirman con IT en los días 16–20.

**Preguntas posibles.**
- *¿Y si el cómputo local no alcanza?* Riesgo T7: se dimensiona sobre la muestra (días 16–20) y se reserva con IT antes de procesar el lote final. No se abre la puerta a nube.
- *¿Por qué 3 huellas?* Porque el volumen real se mide en S1; las 3 cubren desde el caso mínimo al holgado sin reestimar a ciegas.
- *¿El almacenamiento local es suficiente para 50K correos y adjuntos?* Con adjuntos, la base de 300 GB da margen; se confirma el tamaño con la muestra.

**Decisiones / pendientes.** Decisión técnica 5 (volumen real de cómputo y almacenamiento a reservar con IT — tras S1, ante, ESI+EDI).

---

## Lámina 14 · Roles y responsabilidades (qué hace cada uno)

**Objetivo.** Dejar explícito el reparto de trabajo y la validación cruzada.

**Qué decir.**
> "Dos roles internos. ESI es integración: conector C1–C4, importe PST, staging, dedupe, filtro C5, normalización C7, cruce C8 contra la fuente, contrato de salida C9 y despliegue local con los modelos self-host y los secretos que da IT. EDI es datos/IA: clasificación y extracción C6, prompts por campo y schema estricto, el juez con zona gris y umbrales, la administración del golden set con split y test congelado, y el model routing con el dimensionamiento sobre la muestra. Del lado del cliente: AF define taxonomía, etiqueta doble y valida calidad; RDB habilita la consulta de cruce y valida la evidencia; IT crea la cuenta de servicio, otorga permisos y provee el cómputo. Regla transversal: nadie valida lo que produce. ESI entrega y RDB/IT valida; EDI entrega y AF/cliente valida. Sin validación cruzada el componente no se declara 'done'."

**Análisis detrás del dato.** El corte ESI/EDI replica el patrón de trabajo interno de labIA. La validación cruzada es lo que hace honesto el resultado: separa producción de auditoría. AF, RDB e IT son contrapartes del cliente acotadas a sus responsabilidades específicas, no "bloqueadores".

**Preguntas posibles.**
- *¿Quién decide los umbrales del juez?* EDI los propone; AF los valida (es control cruzado, no imposición).
- *¿Y si no hay nadie para validar una entrega?* El componente no se declara done; se escala en el hito de revisión interno. No existe "done pendiente de validación".

**Decisiones / pendientes.** Es el mapa de dueños del plan; se ratifica en el kickoff interno (lámina 22).

---

## Lámina 15 · Plan S0 + S1 (pre-arranque y baseline)

**Objetivo.** Mostrar la condición de entrada al plan: qué hace el equipo y qué se coordina con el cliente.

**Qué decir.**
> "S0 es el pre-arranque: entorno VPN, tablas staging, planilla golden set, templates de prompts y reserva de sesiones. Para que el día 1 esté listo, se coordina con el cliente la muestra real y el acceso de lectura antes del día 1. S1 es baseline e ingesta: exploratorio con metadatos que valida el volumen ~50K, campañas por asunto/remitente, % de ruido real, adjuntos, remitentes e incompletos, produciendo el documento 'lectura de la casilla'; conector leyendo con dedupe y staging; filtro determinístico v1; esqueleto de salida; y primeras etiquetas dobles del golden set. Criterios de aceptación: se lee la muestra sin permisos pendientes, el lote se lee sin duplicados sin tocar la casilla, ≥90% del ruido conocido descartado y el doc de lectura aprobado."

**Análisis detrás del dato.** El exploratorio de S1 es donde se calibran los supuestos del plan: ~50K históricos, % útil (~70% referencia), % ruido, formatos de adjuntos e incompletos. S1 produce el primer número medido del baseline sobre el que se escriben los 3 escenarios del informe de cierre.

**Preguntas posibles.**
- *¿Qué pasa si el volumen real no es ~50K?* Ese es el trabajo de S1: el baseline se recalibra con el dato real y los escenarios se recalculan. No hay estimación cerrada antes de la muestra.
- *¿Qué pasa si la muestra no llega?* No hay S1: se replanifica al pesimista (regla de oro de la lámina 3).

**Decisiones / pendientes.** Coordinación de muestra + acceso (IT + CMP) antes del día 1; contrato BI el día 2.

---

## Lámina 16 · Plan S2 (golden set completo, modelo, juez)

**Objetivo.** Mostrar el corazón de la validación: el golden set y la primera medición honesta.

**Qué decir.**
> "S2 tiene cuatro bloques. Golden set: split 70/15/15 con test congelado bajo custodia de labIA y objetivo de acuerdo entre etiquetadores kappa ≥ 0.8. Modelo: prompts por campo con schema estricto y primera corrida sobre train con el modelo local elegido, con errores documentados. Juez y umbrales: zona gris, segundo pase de coherencia y ajuste de umbrales por AF, corrido sobre validation contra los criterios de calidad del proyecto. Normalización y cruce: reglas C7 v1 y la consulta de lectura contra la base corporativa funcionando, coordinada con los permisos de lectura de los días 7–10. Criterios de aceptación: kappa ≥ 0.8, test congelado fuera de todo ajuste, calidad sobre validation dentro de criterio o gap con plan de cierre para S3."

**Análisis detrás del dato.** El kappa ≥ 0.8 mide el acuerdo inter-etiquetador que protege la calidad del oro. El test congelado (15% final, custodia labIA) es el instrumento que asegura que el resultado de la lámina 17 es de primera corrida honesta.

**Preguntas posibles.**
- *¿Y si el kappa no llega a 0.8?* Se reescriben definiciones y se re-etiqueta la franja en disputa (riesgo T5); es el gatillo del escenario pesimista.
- *¿Por qué el modelo no toca el test?* Porque el test es el examen; si el modelo lo ve, deja de medir nada.

**Decisiones / pendientes.** Permisos de lectura DB corporativa (días 7–10); si se demoran, cruce con datos de prueba y desvío documentado.

---

## Lámina 17 · Plan S3 (cruce, evaluación final, datasets v1)

**Objetivo.** Mostrar dónde se cierra la implementación del pipeline y se publican los primeros datasets.

**Qué decir.**
> "S3 tiene cinco bloques. Cruce contra la fuente con stored proc/vista y normalización aplicada, dejando cada correo con evidencia y motivo. El día 15 un primer correo recorre el pipeline de punta a punta y queda registrado como hito. La evaluación final: pipeline completo sobre el test congelado que nadie miró; reporte de resultados, ajustes finos propuestos y registrada la diferencia entre la primera corrida y la versión final — el resultado reportado es el de la primera corrida. Cola humana y cómputo: tiempo por caso dudoso documentado y cómputo real consumido en la muestra, que confirma la huella local con IT (días 16–20). Y datasets v1 por campaña publicados entre los días 18–21 con rastro de evidencia. Si no se llega al criterio de calidad → gap con plan de cierre documentado."

**Análisis detrás del dato.** El primer correo E2E (día 15) es el hito que habilita la evaluación final. La integridad de la evaluación está en línea con la regla transversal: la primera corrida honesta sobre un test que nadie miró es el resultado contra los criterios de aceptación de S2.

**Preguntas posibles.**
- *¿Por qué reportar la primera corrida y no la ajustada?* Porque la primera corrida sobre un set que el modelo no vio es la única medición no contaminada; los ajustes posteriores se reportan como diferencia, no como resultado.
- *¿Qué habilita la decisión de huella?* El cómputo y costos reales medidos sobre la muestra, no una preferencia.

**Decisiones / pendientes.** Decisión técnica 5 (cómputo/almacenamiento final — ESI+EDI, días 16–20) y decisión técnica 2 (campos de la fuente, según permisos).

---

## Lámina 18 · Plan S4 (lote final, documentación, traspaso)

**Objetivo.** Mostrar cómo se cierra el despliegue y qué queda en manos del cliente.

**Qué decir.**
> "S4 cierra con cinco bloques. Lote acotado final: procesar los correos útiles de las campañas priorizadas con el pipeline final (días 22–25), no solo la muestra. Documentación técnica v1.0 publicada en el repositorio del cliente: conector, staging, filtro, normalización y cruce del lado ESI; esquema, prompts, juez y umbrales del lado EDI. Tablero de métricas publicado con leading y lagging. Revisión final: revisión conjunta de calidad contra el test e informe de cierre con 3 escenarios anclados en el baseline medido, con el registro de riesgos actualizado al resultado real (días 26–28). Traspaso: show & tell (dataset, tablero, evidencia, correo en vivo), traspaso de la operación al área de datos/BI y firma del cierre el día 28. Lo que queda: datasets por campaña, evidencia por fila, documentación v1.0 y tablero, con la operación en manos del cliente y acompañamiento acotado de labIA."

**Análisis detrás del dato.** El lote acotado es restricción de ventana, no de capacidad: el resto del histórico se procesa post-cierre con el mismo motor. El informe final actualiza los 3 escenarios (de previsión a resultado) anclándolos en el baseline medido en S1.

**Preguntas posibles.**
- *¿Por qué no procesar todo el histórico en la ventana?* Porque la ventana valida el motor con el golden set y los hitos de revisión; el volumen completo sale con el mismo motor después del cierre.
- *¿Cuándo se firma el cierre?* Día 28, después de mostrar dataset, tablero, evidencia y el correo en vivo.

**Decisiones / pendientes.** Depende de las coordinaciones de la lámina 15 (muestra, contrato) y de las decisiones técnicas 1–5.

---

## Lámina 19 · Riesgos técnicos (registro interno labIA)

**Objetivo.** Tener en la mano la matriz de riesgos técnicos con mitigación y probabilidad/impacto.

**Qué decir.**
> "Nueve riesgos técnicos. T1, el LLM alucina campos de contacto, impacto alto: schema estricto, prompt por campo, juez, golden set, null explícito y JSON inválido a revisión. T2, migración Exchange a M365: diseño agnóstico, mismo patrón con Graph API. T3, dedupe insuficiente: ItemId + hash con relectura trazable. T4, normalización que no calza con la fuente: reglas versionadas y validación con RDB; lo que no calza va a revisión. T5, acuerdo de etiquetado bajo 0.8: reescribir definiciones y re-etiquetar la franja — escenario pesimista. T6, test congelado contaminado, impacto alto: custodia por labIA y resultado = primera corrida. T7, cómputo local insuficiente: dimensionar sobre la muestra (días 16–20) y reservar con IT. T8, costo recurrente fuera de rango: model routing e IA solo sobre útiles más zona gris. T9, permisos del entorno mal configurados, impacto alto: solo lectura, cuenta mínimo privilegio, secretos en el gestor del cliente y revisión en los hitos 10/20."

**Análisis detrás del dato.** Prob/impacto asignados en el documento de arquitectura (T1–T9). Los de impacto alto (T1, T6, T9) marcan los límites de diseño más estrictos: schema, custodia y seguridad local. Como la decisión es local, no hay riesgo de transferencia de PII a nube (se eliminó del registro).

**Preguntas posibles.**
- *¿Qué riesgo es el más probable de dispararse?* T5 (acuerdo de etiquetado <0.8) o T4 (normalización contra la fuente), ambos medidos temprano: kappa en S2 y validación de reglas con RDB en los días 7–10.
- *¿Qué pasa si el cómputo local no alcanza (T7)?* Se dimensiona sobre la muestra antes del lote final; no se abre la opción nube.

**Decisiones / pendientes.** T5 gatilla el escenario pesimista; T7 se resuelve con la decisión técnica 5.

---

## Lámina 20 · Decisiones técnicas de ejecución (con responsable y fecha)

**Objetivo.** Que ningún pendiente quede sin dueño ni fecha.

**Qué decir.**
> "Cinco decisiones técnicas de ejecución. 1: versión de modelo local para clasificación/extracción —Qwen 7B vs 14B— y familia potente para resúmenes, validada con la muestra en S1, a cargo de EDI. 2: campos de la fuente corporativa disponibles para el cruce, en los días 7–10 con los permisos de lectura, ESI con RDB. 3: perfil exacto de solo lectura de Exchange —AppImpersonation vs Full Access RO vs Graph scoped— en el pre-arranque, ESI. 4: rutas de salida y periodicidad, cerrada en el contrato del día 2, ESI. 5: volumen real de cómputo y almacenamiento local a reservar con IT, tras la muestra en S1, ESI+EDI con IT. Las dos que más mueven el plan: la 1, porque define el costo recurrente y la huella; y la 2, porque define si el cruce valida con datos reales o de prueba. No dejarlas pendiente eterno."

**Análisis detrás del dato.** Cada decisión tiene cuándo (momento del plan) y responsable (ESI/EDI). Las decisiones 1 y 5 ya aparecen como críticas en las láminas 12 y 13; la 2 en las láminas 8 y 16. La decisión 4 se cierra con el contrato BI del día 2.

**Preguntas posibles.**
- *¿Qué pasa si no se cierra la decisión 5 a tiempo?* La huella local queda sin confirmar y el lote final de S4 se atrasa; por eso tiene hitos en S1 y confirmación en los días 16–20.
- *¿Por qué no hay decisión "self-host vs cloud"?* Porque está decidido con Aysa: local. Esa decisión no se relega a la tabla.

**Decisiones / pendientes.** Las 5 de la tabla con responsable y fecha. La decisión 2 depende de los permisos de lectura (días 7–10).

---

## Lámina 21 · Definición de "done" técnica (kickoff interno)

**Objetivo.** Fijar, antes de arrancar, cuándo un componente se considera entregado.

**Qué decir.**
> "Un componente está 'done' cuando cumple estas seis cosas: corre dentro de la red local del cliente con solo lectura donde corresponde; tiene tests sobre data real o sintética marcada —filtro ≥90% de ruido detectado, cruce contra casos conocidos—; deja rastro con versión de modelo, prompt, reglas y checksums; su salida alimenta el siguiente paso sin reprocesamiento manual; fue validado por una persona distinta de quien lo desarrolló; y no escribe ni modifica nada fuera de su área. El hito de entrada: el componente se entrega solo cuando una persona distinta validó su salida. ESI entrega → RDB/IT valida; EDI entrega → AF/cliente valida. Nadie juzga su propio trabajo."

**Análisis detrás del dato.** Esta definición operativiza la regla transversal "nadie valida lo que produce" y la aplicación del test congelado. Es el criterio de aceptación de cada entregable del plan S0–S4 (láminas 15–18).

**Preguntas posibles.**
- *¿Qué pasa si una pieza no tiene quién la valide a tiempo?* No se declara done; se registra como pendiente interno y escala en el hito de revisión correspondiente. No existe "done pendiente de validación".

**Decisiones / pendientes.** Es el criterio; sin validación cruzada no hay done.

---

## Lámina 22 · Cierre (próximos pasos del equipo labIA)

**Objetivo.** Convertir el deck en acción inmediata con 3 tareas concretas.

**Qué decir.**
> "Tres próximos pasos. Uno: kickoff interno de ejecución — asignar ESI/EDI a los componentes C1–C10, nombrar dueños de update del seguimiento y fijar los hitos de revisión internos de días 10/20/28. Dos: preparación del pre-arranque S0 — entorno VPN, tablas staging, planilla golden set y templates de prompts, y enviar a IT el pedido formal de muestra con la especificación del perfil de solo lectura. Tres: reservas con el cliente — kickoff el día 1, contrato de salida BI el día 2, sesiones de etiquetado días 3–9 y pedido de permisos DB el día 7."

**Análisis detrás del dato.** Estos tres pasos desbloquean: la gobernanza interna (hitos de revisión), la condición de entrada (muestra) y las coordinaciones con el cliente (contrato BI, etiquetado, permisos). Son las únicas actividades que no dependen de la muestra, por eso corren hoy mismo.

**Preguntas posibles.**
- *¿Qué pasa primero?* Los tres en paralelo desde hoy: el kickoff interno no espera al cliente, el pedido de muestra sale hoy a IT y las reservas se piden hoy porque los días 3–9 de sesiones dependen de la agenda del negocio.

**Decisiones / pendientes.** El pedido formal de muestra a IT (especificación del perfil de solo lectura — decisión técnica 3) y la agenda de etiquetado con el cliente.

---

## Nota de trazabilidad interna

- **Consistencia:** este guión sigue a `deck-implementacion-aysa.html` (22 láminas). Detalle y fuentes: `arquitectura-labia-aysa.md` (modelo de datos, componentes, riesgos T1–T9, decisiones) y `plan-4-semanas-aysa.md` (plan S0–S4, escenarios).
- **Cambios de la v0.2:** se eliminaron láminas de métricas/go-no-go y bloqueadores; la infra es local (decisión con Aysa); el detalle de componentes C1–C10 se mantiene (láminas 6–9) y se agrega la lámina 14 de roles.
- **Números:** 4/3/6 semanas, ~50K históricos, ~70% útil a calibrar, kappa ≥0.8, ≥90% ruido descartado, huella 2/4/8–16 vCPU — todos con su supuesto y su momento de medición documentado.
- **Escenarios:** pesimista/base/optimista en plazo (láminas 1, 3), en huella (lámina 13) y como resultado real en el informe de cierre (lámina 18).