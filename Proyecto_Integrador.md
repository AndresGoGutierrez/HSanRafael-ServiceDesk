# Proyecto Integrador

**Version del documento:** 1.0.0

**Asignaturas:** JavaScript/TypeScript

**Tema Integrador:** Desarrollo mesa de servicios adaptada a la necesidad de cada área del hospital que la requiera.

**Integrantes:** 1 - 5 personas

## Contexto y propósito

Diseñar e implementar una mesa de servicios personalizada que atienda los requerimientos específicos de cada área del hospital que lo solicite (Urgencias, UCI, Radiología, TI, etc.), con SLA y workflows configurables, garantizando la eficiencia en la gestión de solicitudes, trazabilidad de incidentes y mejorar en los tiempos de respuesta.

El sistema será una **API Restful** en **TypeScript + Express**, siguiendo **Clean Architecture**, principios **SOLID** y **Clean Code**, con **DTOs + class-validator**, conexión a **DB relacional** y **eventos/integraciones** via `fetch` (ejemplo, notificaciones, GLPI).

## Objetivos de la actividad

- Diseñar dominio con entidades, VO y workflows por área.
- Implementar API REST con Clean Architecture (domain, application, infrastructure, interfaces).
- Usar DTOs + class-validator, Repository Pattern, EventBus y fetch para integraciones.
- Diseñar un modelo de datos relacional (PostgreSQL + Prisma) con índices y FK.
- Crear casos de uso clave (crear ticket, asignar, transicionar, comentar, adjuntar, métricas SLA).
- Incluir pruebas unitarias/e2e, logs y seguridad básica (JWT + RBAC).
- (Opcional) Integrar con GLPI como sistema externo de helpdesk.

## Entregables

1. Modelo de dominio y diseño de software
   - Diagramas de clases, casos de uso, secuencia y arquitectura.
   - Mapa de estructuras de datos elegidas y complejidad.
   - Catálogo de patrones (mín. 2): Repository, Strategy, Observer, Adapter, etc.
2. Modelo de base de datos
   - Scripts SQL (DDL/DML) o esquema Prisma.
   - Diccionario de datos e índices.
3. Implementación parcial en código
   - Entidades del dominio y VO.
   - Repositorios (Repository Pattern) y casos de uso.
   - Endpoints Express con DTOs + class-validator.
   - Pruebas unitarias/e2e (Jest + Supertest).
   - (Opcional) Workers/Jobs de SLA.
   - (Opcional) Integración GLPI vía fetch.
4. Informe académico (APA)
   - Problema y estado del arte.
   - Justificación de estructuras/algoritmos/patrones.
   - Evidencia de pruebas.
   - Reflexión sobre aplicabilidad en hospitales.

## Metodología sugerida

- **Semana 1-2:** Requerimiento inspirados en el formato IEEE 830 (RF/RNF, actores), casos de uso y alcance por área.
- **Semana 3-4:** Dominio, diagramas (clases/arquitectura/secuencia), patrones.
- **Semana 5-6:** Modelo relacional (Prisma/Postgres), migraciones e índices.
- **Semana 7-8:** Casos de uso + API Express (DTOs, auth, repos); pruebas unitarias.
- **Semana 9:** Métricas SLA, eventos, integraciones (emails/webhooks/GLPI).
- **Semana 10:** Endurecimiento (logs, seguridad, e2e) y sustentación.

## Rúbrica de calificación

|Criterio|Peso|Indicadores|
|--|--|--|
|Diseño de dominio y algoritmos|35%|Correcta aplicación de estructuras de datos; uso justificado de algoritmos; integración con patrones de diseño, workflows|
|Implementación en Código|35%|SOLID, Clean Code, DTOs/Validators, pruebas unitarias, y e2e|
|Modelo de base de datos|15%|Normalización adecuada; uso de claves foráneas e índices; consultas eficientes.|
|GUI/Integración externa (opcional)|10%|(Frontend o GLPI) integración funcional con la API.|
|Poster de investigación|5%|Claridad visual y conceptual; coherencia en la narrativa; correcta presentación de KPIs y resultados.|

## Alcance y actores

- **Alcance funcional (macro):**
  - Tickets por área con SLA y workflow específicos.
  - Comentarios (públicos/internos) y adjuntos como evidencia.
  - Asignación y escalamiento según políticas del área.
  - Métricas SLA: MTTA, MTTR, % cumplimiento, backlog, tiempos de respuesta.
  - Auditoría completa de acciones (AuditTrail).
  - (Opcional) Integración con GLPI (creación/actualización de tickets).
- **Actores/Roles:**
  - Requester (solicitante)
  - Agent (mesa de ayuda)
  - Tech (técnico/operativo)
  - Admin (configuración, áreas, SLA/workflow)

**Nota:** Si se desea mezclar mantenimiento e incidentes TI, el dominio soporta ambos: define categorías o tipos de ticket.

## Requerimientos según plantillas IEEE 830

### Requisitos funcionales

1. Autenticación y Usuarios

   - **RF-01 Autenticación (JWT):** Login y obtención de token; logout opcional (lista de tokens).
   - **RF-02 Gestión de usuarios:** CRUD, roles y (opcional) pertenencia a área.
   - **RF-03 Reset de contraseña:** Solicitud de cambio de contraseña por petición del usuario o temporizada.

2. Configuración de Áreas, SLA y Workflow

   - **RF-10 CRUD de áreas:** nombre único, activas/inactivas.
   - **RF-11 Configurar SLA por área:** response/resolution times (minutos).
   - **RF-12 Configurar workflow por área:** transiciones válidas y campos requeridos por estado.

3. Tickets (ciclo de vida)

   - **RF-20 Crear ticket:** título, descripción, área, prioridad, requester; calcula `slaTargetAt`.
   - **RF-21 Ver detalle ticket:** detalle, historial básico y vínculos.
   - **RF-22 Buscar/listar tickets:** filtros por área, estado, prioridad, rango, texto; paginación y orden.
   - **RF-23 Asignar ticket:** define `assigneeId`, registra audit y notifica.
   - **RF-24 Transicionar estado:** valida con workflow del área y campos requeridos.
   - **RF-25 Resolver/Cerrar ticket:** guarda `resolvedAt`, notifica y audita.
   - **RF-26 Reasignación con comentario automático:** La reasignación de ticket genera un comentario de manera automática.

4. Comentarios y Adjuntos

   - **RF-30 Comentarios:** públicos/internos, con autor y timestamps.
   - **RF-31 Adjuntos:** subir metadatos y URL/Path (no binarios en DB), auditar.
   - **RF-32 Eliminar adjunto:** eliminar un adjunto cargado a un ticket.

5. Auditoría y Trazabilidad

   - **RF-40 Auditoría:** registrar acciones críticas (quién, qué, cuándo, detalles).
   - **RF-41 Exportar historial:** exportar historial de acciones criticas.

6. SLA, Notificaciones e Integraciones

   - **RF-50 SLA Monitor:** detectar incumplimientos y generar SlaBreached.
   - **RF-60 Notificaciones (fetch):** email/webhook en eventos clave (creación, asignación, cierre, breach).
   - **RF-61 Canales (Slack/Teams):** Generar una notificación en medios de comunicación de la entidad.
   - **RF-62 Webhooks Salientes:** Notificaciones automáticas disparadas por un evento especifico.
   - **RF-90 Integración GLPI (opcional):** empujar/actualizar tickets vía REST GLPI.

7. Conocimiento (KB) y Métricas

   - **RF-70 Knowledge Base (opcional):** CRUD de artículos y referencias en tickets.
   - **RF-71 Referencias artículos con ticket:** Asociar artículos de conocimiento sobre solución de errores a los tickets creados.
   - **RF-80 Métricas:** MTTA, MTTR, TTR, % SLA cumplido, estados por área.

### Requisitos no funcionales

- **RNF-01 Seguridad:** JWT + RBAC, Helmet, CORS, rate limit, hashing de claves.
- **RNF-02 Rendimiento:** búsquedas y listados paginados; N+1 evitado.
- **RNF-03 Confiabilidad:** transacciones atómicas en cambios críticos; auditoría inmutable.
- **RNF-04 Escalabilidad:** repositorios desacoplados, EventBus, colas (BullMQ) opcional.
- **RNF-05 Observabilidad:** logs estructurados (pino), trazas de errores, ids de correlación.
- **RNF-06 Portabilidad:** dominio y casos de uso sin dependencias de Express/ORM (migrable a NestJS).

## Aplicación de Clean Architecture sugerida

[![Flow Diagram - Packages](https://mermaid.ink/img/pako:eNp1U01z2jAQ_SsaHTowNZRvsA-dIUCJE2hIaNqZ1j0IewE1RvKsJJKU4b93bVNoDzmt9uO93X2SDjzWCfCAr1P9HG8FWjZ7iBRjxq02KLIti3ioLOBaxGBYZfKSIRhTjXhexNjwR8RHWlnUaQpoIv6zVvt4RcHxlzvD3rM4FcbU9iKVibAaKX_CUdmIyuYySVJ4FkQaMOHs1mO4ErHHAFEXfHk9qOS_mYZZlspYWKlVSTcmqkcDbCQMnIaYUGih0dLQD5Bp47HJHpS9cnT6rK1cS0CPjVIdP3ns0cmk-kazsd4JeerziUgnykorSYx37KtIHbC71S-IrTnvNs3XL0BsCbiXcb7bMhUnx2PfND7lek-dwOQMu77AiknfWj5UaxTGooutQyixIWGLLSWJnM9WWaA0O1E9s99QRWWhjd0gLO9nl8QtJUo9SkHZXgq2BhtvzyWzfOuTeB_uHTg4p-aUms4WIRsmIqNn8u_M-R2PIzXOLyNSEzJhpEIyN5G6JjMrc7elmXOPb1AmPKDVwOM7QNKCXH7IGSNut7CjxgEdFTiLIs0f4ZFgmVDftd79RaJ2my0P1iI15LmMXh6MpSD1LiU0IOBIO2V50Oz4BQcPDvyF3G673u12e4OGP-i1Or1Gy-OvFO516v2m3-j4lGk1_ZZ_9Pjvom2j3vN9v9XvtQaNTqPdbPc9Dkl-FfPycxV_7PgHDBYX3Q?type=png)](https://mermaid.live/edit#pako:eNp1U01z2jAQ_SsaHTowNZRvsA-dIUCJE2hIaNqZ1j0IewE1RvKsJJKU4b93bVNoDzmt9uO93X2SDjzWCfCAr1P9HG8FWjZ7iBRjxq02KLIti3ioLOBaxGBYZfKSIRhTjXhexNjwR8RHWlnUaQpoIv6zVvt4RcHxlzvD3rM4FcbU9iKVibAaKX_CUdmIyuYySVJ4FkQaMOHs1mO4ErHHAFEXfHk9qOS_mYZZlspYWKlVSTcmqkcDbCQMnIaYUGih0dLQD5Bp47HJHpS9cnT6rK1cS0CPjVIdP3ns0cmk-kazsd4JeerziUgnykorSYx37KtIHbC71S-IrTnvNs3XL0BsCbiXcb7bMhUnx2PfND7lek-dwOQMu77AiknfWj5UaxTGooutQyixIWGLLSWJnM9WWaA0O1E9s99QRWWhjd0gLO9nl8QtJUo9SkHZXgq2BhtvzyWzfOuTeB_uHTg4p-aUms4WIRsmIqNn8u_M-R2PIzXOLyNSEzJhpEIyN5G6JjMrc7elmXOPb1AmPKDVwOM7QNKCXH7IGSNut7CjxgEdFTiLIs0f4ZFgmVDftd79RaJ2my0P1iI15LmMXh6MpSD1LiU0IOBIO2V50Oz4BQcPDvyF3G673u12e4OGP-i1Or1Gy-OvFO516v2m3-j4lGk1_ZZ_9Pjvom2j3vN9v9XvtQaNTqPdbPc9Dkl-FfPycxV_7PgHDBYX3Q)

### Estructura de carpetas sugerida

```txt showLineNumbers
src/
  domain/           # entidades, VO, servicios, eventos
  application/      # casos de uso y ports
  infrastructure/   # repos Prisma, notif (fetch), eventbus, glpi
  interfaces/       # http: controllers, routes, dtos, middlewares
  config/           # env, logger, app bootstrap
  main.ts           # composition root
prisma/             # schema.prisma y migraciones
tests/              # unit y e2e
```

## Modelo de dominio

[![Diagram Class - Domain](https://mermaid.ink/img/pako:eNqtVutv2jAQ_1csf9wo4tHxUtWKQUaj8eggrNKWaXKTI3hLbGY761rE_z4npLQNSaAS-ZDEdz_73ndeY4e7gDvY8YmUfUo8QQKbIf24VICjKGdoOLXZlsZIAHJFHEAuDwhlaL2lR098AuoKIGiNnsnR834-N_uIummyVIIyLz41zfolObtCDmcL6j2zNmlxs2H3aGkxmWj9zD0WZQoJbRlnEiwawIiyUIHMgXE_jPzyAvhKw7SOt1z8Xvj8_hSKRm5BShAmaaSCzOQL-BPq4LmfKPhusW5zCeIU4UpYoJPCT_Om3AckoleGmKvE0EItLer8BvUy2Y5QU1Hl5-npgnQEXUUuPN73MSvyLUgFIpuvzZGSegzgpUkx-0ZQLqh6QKunnxRgpogKJZLxJ8XrEwXI0WopcLsKZXHDlZvPvULSJxYRHqg8QJzYf6MDCmPR40EAug7elMwqDmCOS0moljzDn0ms7ri756o7rtOJMKQLEgQjPip0V6E9XaWIszydSYnWC-pDQaHoxqa0SOthlYcIhT8RN0Qts5qQpI_w8SGjQ73F8NClyhJRwZ4wlo4qCCXZzpOsnuWC0ppk28MdJxTioEGfGb_3wfWgK7SOuvbf2NeKGkYSr6IOlr3z-w-kiHcgTsX1vDf-NnnjuAwsDPZn8q7zpB1ycRFtuLx8TR1ObtHI6JvzEbo2B9eoNzUts9cdFo3hbes67vzJjTFG5vjnzXQymBqzGdLrvjkeIL2YDL8afdQbTmZGv0BePFKOkzY1vsyNmWVMUXdgjC1kGb1r1O2PzHG-X-NLjI2rNkZnZ5fJn75qFHCfhnwOpFIuv9OL7SArxkQjeYtIxl4GJmnCh2DPve0gctcMtsi9WtohX2_TNqSOzoKlT7MZLmFPUBd3lAihhAMQOn_1EsfJa2O1hABs3NG_LixI6Csb22yjt60I-8Z58LRT8NBb4s6C-FKvtjWTXGN3EGAuiB4PmcKd-nkjPgN31vgf7tTOW-VGu1L50G41G5V6tdks4QdNLrc0qdpu1WqtRq1eb2xK-DGWWim32-16q9JoN6rVdq3ZqJUwaN9xMUou0tFn8x-7_QMi?type=png)](https://mermaid.live/edit#pako:eNqtVutv2jAQ_1csf9wo4tHxUtWKQUaj8eggrNKWaXKTI3hLbGY761rE_z4npLQNSaAS-ZDEdz_73ndeY4e7gDvY8YmUfUo8QQKbIf24VICjKGdoOLXZlsZIAHJFHEAuDwhlaL2lR098AuoKIGiNnsnR834-N_uIummyVIIyLz41zfolObtCDmcL6j2zNmlxs2H3aGkxmWj9zD0WZQoJbRlnEiwawIiyUIHMgXE_jPzyAvhKw7SOt1z8Xvj8_hSKRm5BShAmaaSCzOQL-BPq4LmfKPhusW5zCeIU4UpYoJPCT_Om3AckoleGmKvE0EItLer8BvUy2Y5QU1Hl5-npgnQEXUUuPN73MSvyLUgFIpuvzZGSegzgpUkx-0ZQLqh6QKunnxRgpogKJZLxJ8XrEwXI0WopcLsKZXHDlZvPvULSJxYRHqg8QJzYf6MDCmPR40EAug7elMwqDmCOS0moljzDn0ms7ri756o7rtOJMKQLEgQjPip0V6E9XaWIszydSYnWC-pDQaHoxqa0SOthlYcIhT8RN0Qts5qQpI_w8SGjQ73F8NClyhJRwZ4wlo4qCCXZzpOsnuWC0ppk28MdJxTioEGfGb_3wfWgK7SOuvbf2NeKGkYSr6IOlr3z-w-kiHcgTsX1vDf-NnnjuAwsDPZn8q7zpB1ycRFtuLx8TR1ObtHI6JvzEbo2B9eoNzUts9cdFo3hbes67vzJjTFG5vjnzXQymBqzGdLrvjkeIL2YDL8afdQbTmZGv0BePFKOkzY1vsyNmWVMUXdgjC1kGb1r1O2PzHG-X-NLjI2rNkZnZ5fJn75qFHCfhnwOpFIuv9OL7SArxkQjeYtIxl4GJmnCh2DPve0gctcMtsi9WtohX2_TNqSOzoKlT7MZLmFPUBd3lAihhAMQOn_1EsfJa2O1hABs3NG_LixI6Csb22yjt60I-8Z58LRT8NBb4s6C-FKvtjWTXGN3EGAuiB4PmcKd-nkjPgN31vgf7tTOW-VGu1L50G41G5V6tdks4QdNLrc0qdpu1WqtRq1eb2xK-DGWWim32-16q9JoN6rVdq3ZqJUwaN9xMUou0tFn8x-7_QMi)

## Modelo relacional

[![Relational Diagram](https://mermaid.ink/img/pako:eNq1WN1u2kgUfpWRpZWCRLKQpDRB6oUXHEABjMBs1RUSmtiDmXbsYcfjZkmai75G73q5F73qI_Bie8Y_YLBpaOhakWLPnDlzfr455xseNZs7RKtrRDQpdgX2Jj6C57ff0JuiBzV0a_W5a7bMETox_NALSsWCsZqh2TXQY_yunvG400TUQYPbzVggBfVdpOxAE231xac2RyfkzD0rI73Z6_ThX8voW2U0HhnD0kTLLXVIYAu6kJT7m7kmlgTZgsA_R5c74-HCyY4_TZKFg2HHHHasd8fY3DXfllHPaHbGvTJqd1ptMHyoHDjYdOpLFHAhTeEQAfqbZEZ9gghDHEZ8WIQWgnJBHexkdb7I5ZGlW-PRMQ6bAwNy1OlPB0OzNTRGIxjqT9tmt1lG8Gl2_zTgrdE1R0bz4Bjccc4I9hENLCI86mMG-1oiJCigiATwJ7HD0SyaSQwp2GIrlEdGat-ZUMeiv_rS6BrmXoHMmdCHhn5guH3sZcK94AIA4GKfPmCbrr77WUffB9yH9Pgz6sKKARarrx6RgqtILYi9-jYDFQHEmqHVV3D8eNx0n_UiGsOgt-Ogm1swS7l-Rp3dBAkwkfsBsahHetQPJeR3ovWIxAnUPSJwJBWqtBcs5yxU8ClWEM_nIvYir9-aw9sbOOG_wvUoZVJgP6DKeGXykLgMqywhG3t3lKu3GOm5hYL8HVJBnBtKmKPWNrC3gAzzO0ZdLKE6wIeCTH79izxXxfcnYJsbJB6mbA3mrDmRJgHHPY2V6ho7sToknmnJwLakH8mR7lqdxq1hvagsMuLSO0bSqtRujk4rlUr1_KKo-EkqGTmsJB4SgziWAA3IOhGpoMpdYUCDgLo-Ic_Jxd1GLlO5tE0WyQLaZBikknF32ZH7mYSsxwOGLSxcInUJem-IPceA9fcEcg2dKHPGEd-UilJu2xkVgRwmBSe3SaTmY8HuNuNBAUoaZq8Hnf2gaiCp_YHINDAxvgqTEso5_1HqEozccWdZ0C99yHumW75Bweo74wi7BGaCo8uAbll6o_0rnU7cmVFGCgsHNDUJtlvLRX4uFMwUAyznOx2fPpA_lsrdnLI5sT8EoQfGmAsbjhdm9ShmbsSm0jM7auun569qpefCtQnLuNmxptZQ73R_LRhseQgWVMmDnjDREvOjUzdttPV-K-JeMUynerNpNHOdxIE-SZlqIbqCyO-OOj2rf4OyYgsS5zHDbTsUoiAKt33zbddotoypPgSfDub-xUUwSfzLmsAihD4YzIlzZNlZ6zmcDiJLb43QOzQYQ8yNEfohGwTZl5DB__UWlCRvWmQbFgDdTavOZbwIxBK7a6TrrR0JCGOD4Y9gJffioo1O1puU47Wlwua8F2QHH66f86XI0nSr8kZZ6WCcDI2u3uiY_f0Y2eAEtKw-Qx4VpwsIXALDIMSK45UTd-Elpv-hwKqwAQU-AY5eRvdcfJgxfl_KXD8-fTo95Y8xp6ujOQ7ycwkB2jOr2P-eqTVF3jOfLxKJ4NrRBparr4y7QGBtRZFj_3Zu6Ltm2kyxmRlNi35yr0X7_Yl-nEAbiSgaCCRc4OQya9A4jrVKPIfrJKM2lSBC0DIewopGKZK9Ycq7u060hJUFiqys-dm6w-xZlDA0ZyqB5GzoWrRsEy_uQZ1M0ICd96EvIXRLYBIOhfax-oa3OG2yS8pdUOTzOirbQpl2_wOhTPPbzaUeggUkvtJszFTG2euJXTuzsdi28h5YaJrgrNS2BQsiZlx4W5DiPrepR8EAXldFRZkgyIwI4tsUTpUtwgfspP7lMZpulCmNkR4XcnNPUwKihreewmXUt1nokKx9VoxxMIlFpxfAFIMfysrqmx0ynoRw4wY66dX7paJ87JTH5KlHyiF8gKVnvNxRkK50pjPBvYmvlTVFl7S6BIZZ1uB2Dnc7-NSiQjzR5JwAj9MUfh0ywyGTCq5PsGyB_b8499KVgofuXKvPMAvgK25Hyc-QaxHiO0Q0OGBaq1cvIhVa_VH7B76qZ7WLWuX61fnVZbVycX3-uqwttfrry7PKFTyvr6rXldp19fKprD1Em1bOrmqX1YvaOUycX9ZeXYE6EkGvF_8IGv0W-vQfUxM3zg?type=png)](https://mermaid.live/edit#pako:eNq1WN1u2kgUfpWRpZWCRLKQpDRB6oUXHEABjMBs1RUSmtiDmXbsYcfjZkmai75G73q5F73qI_Bie8Y_YLBpaOhakWLPnDlzfr455xseNZs7RKtrRDQpdgX2Jj6C57ff0JuiBzV0a_W5a7bMETox_NALSsWCsZqh2TXQY_yunvG400TUQYPbzVggBfVdpOxAE231xac2RyfkzD0rI73Z6_ThX8voW2U0HhnD0kTLLXVIYAu6kJT7m7kmlgTZgsA_R5c74-HCyY4_TZKFg2HHHHasd8fY3DXfllHPaHbGvTJqd1ptMHyoHDjYdOpLFHAhTeEQAfqbZEZ9gghDHEZ8WIQWgnJBHexkdb7I5ZGlW-PRMQ6bAwNy1OlPB0OzNTRGIxjqT9tmt1lG8Gl2_zTgrdE1R0bz4Bjccc4I9hENLCI86mMG-1oiJCigiATwJ7HD0SyaSQwp2GIrlEdGat-ZUMeiv_rS6BrmXoHMmdCHhn5guH3sZcK94AIA4GKfPmCbrr77WUffB9yH9Pgz6sKKARarrx6RgqtILYi9-jYDFQHEmqHVV3D8eNx0n_UiGsOgt-Ogm1swS7l-Rp3dBAkwkfsBsahHetQPJeR3ovWIxAnUPSJwJBWqtBcs5yxU8ClWEM_nIvYir9-aw9sbOOG_wvUoZVJgP6DKeGXykLgMqywhG3t3lKu3GOm5hYL8HVJBnBtKmKPWNrC3gAzzO0ZdLKE6wIeCTH79izxXxfcnYJsbJB6mbA3mrDmRJgHHPY2V6ho7sToknmnJwLakH8mR7lqdxq1hvagsMuLSO0bSqtRujk4rlUr1_KKo-EkqGTmsJB4SgziWAA3IOhGpoMpdYUCDgLo-Ic_Jxd1GLlO5tE0WyQLaZBikknF32ZH7mYSsxwOGLSxcInUJem-IPceA9fcEcg2dKHPGEd-UilJu2xkVgRwmBSe3SaTmY8HuNuNBAUoaZq8Hnf2gaiCp_YHINDAxvgqTEso5_1HqEozccWdZ0C99yHumW75Bweo74wi7BGaCo8uAbll6o_0rnU7cmVFGCgsHNDUJtlvLRX4uFMwUAyznOx2fPpA_lsrdnLI5sT8EoQfGmAsbjhdm9ShmbsSm0jM7auun569qpefCtQnLuNmxptZQ73R_LRhseQgWVMmDnjDREvOjUzdttPV-K-JeMUynerNpNHOdxIE-SZlqIbqCyO-OOj2rf4OyYgsS5zHDbTsUoiAKt33zbddotoypPgSfDub-xUUwSfzLmsAihD4YzIlzZNlZ6zmcDiJLb43QOzQYQ8yNEfohGwTZl5DB__UWlCRvWmQbFgDdTavOZbwIxBK7a6TrrR0JCGOD4Y9gJffioo1O1puU47Wlwua8F2QHH66f86XI0nSr8kZZ6WCcDI2u3uiY_f0Y2eAEtKw-Qx4VpwsIXALDIMSK45UTd-Elpv-hwKqwAQU-AY5eRvdcfJgxfl_KXD8-fTo95Y8xp6ujOQ7ycwkB2jOr2P-eqTVF3jOfLxKJ4NrRBparr4y7QGBtRZFj_3Zu6Ltm2kyxmRlNi35yr0X7_Yl-nEAbiSgaCCRc4OQya9A4jrVKPIfrJKM2lSBC0DIewopGKZK9Ycq7u060hJUFiqys-dm6w-xZlDA0ZyqB5GzoWrRsEy_uQZ1M0ICd96EvIXRLYBIOhfax-oa3OG2yS8pdUOTzOirbQpl2_wOhTPPbzaUeggUkvtJszFTG2euJXTuzsdi28h5YaJrgrNS2BQsiZlx4W5DiPrepR8EAXldFRZkgyIwI4tsUTpUtwgfspP7lMZpulCmNkR4XcnNPUwKihreewmXUt1nokKx9VoxxMIlFpxfAFIMfysrqmx0ynoRw4wY66dX7paJ87JTH5KlHyiF8gKVnvNxRkK50pjPBvYmvlTVFl7S6BIZZ1uB2Dnc7-NSiQjzR5JwAj9MUfh0ywyGTCq5PsGyB_b8499KVgofuXKvPMAvgK25Hyc-QaxHiO0Q0OGBaq1cvIhVa_VH7B76qZ7WLWuX61fnVZbVycX3-uqwttfrry7PKFTyvr6rXldp19fKprD1Em1bOrmqX1YvaOUycX9ZeXYE6EkGvF_8IGv0W-vQfUxM3zg)

## KPIs

- **First Response Time (FRT):** tiempo hasta primer contacto.
- **MTTR (Mean Time To Resolve):** promedio de resolución.
- **% SLA cumplido** por área/mes.
- Backlog abierto por prioridad/estado.
- Tickets reabiertos (% y causas).
- Uso de Knowledge Base: artículos referenciados vs. resolución.
- Tiempo en estado (en curso, pendiente, etc.).

## Matriz de trazabilidad

1. Autenticación y Usuarios

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-01**|Autenticación JWT|`AuthenticateUser`|`POST /auth/login`|`User`|`LoginDto` (email, password)|**Pre:** usuario activo y credenciales válidas. **Post:** emitir JWT con rol/área|—|Unit: hash y verificación; E2E: 200/401|—|
   |**RF-02**|Gestión de usuarios (CRUD)|`CreateUser`, `UpdateUser`, `DeactivateUser`, `GetUser`|`POST/GET/PUT /users`, `PATCH /users/:id/deactivate`|`User`, (AuditTrail)|`CreateUserDto`, `UpdateUserDto`|**Pre:** email único. **Post:** registro en AuditTrail|`UserCreated`, `UserUpdated`|Unit repos y validaciones; E2E flujos CRUD |—|
   |**RF-03** (S)|Reset de contraseña|`StartPasswordReset`, `ConfirmPasswordReset`|`POST /auth/reset/start`, `POST /auth/reset/confirm` |`User`, `PasswordResetToken`|`ResetStartDto`, `ResetConfirmDto`|**Pre:** usuario existe. **Post:** token con TTL, invalidación tras uso|`PasswordResetRequested`|Unit token/TTL; E2E correo simulado|—|

2. Configuración de Áreas, SLA, Workflow

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-10**|CRUD de Áreas|`CreateArea`, `UpdateArea`, `ListAreas`, `DeactivateArea`|`POST/GET/PUT /areas`, `PATCH /areas/:id/deactivate`|`Area`, (AuditTrail)|`CreateAreaDto`, `UpdateAreaDto`|**Pre:** nombre único. **Post:** no borrar si hay tickets activos; desactivar|`AreaCreated`, `AreaUpdated`|Unit repos; E2E creación/edición|% tickets por área|
   |**RF-11**|Configurar SLA por área|`DefineSLAForArea`|`PUT /areas/:id/sla`|`SLA`, `Area`|`UpdateSlaDto` (response/resolution mins >0)|**Pre:** área activa. **Post:** SLA aplicado a tickets nuevos (política)|`SlaChanged`|Unit cálculo `slaTargetAt`; E2E actualización|% SLA cumplido, MTTR|
   |**RF-12**|Configurar Workflow por área|`DefineWorkflowForArea`|`PUT /areas/:id/workflow`|`Workflow`, `Area`|`UpdateWorkflowDto` (transitions, requiredFields)|**Pre:** JSON válido. **Post:** validar contra estados soportados|`WorkflowChanged`|Unit guard de transiciones; E2E transición inválida=400|% rechazos por falta de datos|

3. Tickets (ciclo de vida)

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-20**|Crear ticket|`CreateTicket`|`POST /tickets`|`Ticket`, `Area`, `User`, (AuditTrail)|`CreateTicketDto` (title, description, areaId, requesterId, priority)|**Pre:** área/requester válidos. **Post:** `status=OPEN`, calcular `slaTargetAt`, auditar|`TicketCreated`|Unit VO y cálculo SLA; E2E 201 + payload |FRT, % SLA|
   |**RF-21**|Ver detalle ticket|`GetTicketById`|`GET /tickets/:id`|`Ticket` (+ joins a `Comment`, `Attachment`)|`IdParamDto`|**Pre:** permisos por rol/área. **Post:** datos sin PII sensible|—|E2E 200/404/403|—|
   |**RF-22**|Buscar / listar tickets|`SearchTickets`|`GET /tickets?areaId&status&priority&from&to&q&page&pageSize`|`Ticket`|`SearchQueryDto` (paginación/orden)|**Pre:** filtros válidos. **Post:** `total`, `data[]` ordenado por fecha|—|Unit filtro/orden; E2E paginación|Backlog, distribución por estado/prioridad|
   |**RF-23**|Asignar ticket|`AssignTicket`|`POST /tickets/:id/assign`|`Ticket`, `User`, (AuditTrail)|`AssignTicketDto` (assigneeId, reason?)|**Pre:** rol autorizado; assignee existe. **Post:** registrar en AuditTrail, notificar|`TicketAssigned`|Unit reglas; E2E 200 + side effects|Tasa re-asignación|
   |**RF-24**|Transición de estado|`TransitionTicketStatus`|`POST /tickets/:id/transition`|`Ticket`, `Workflow`, (AuditTrail)|`TransitionDto` (toStatus) + `RequiredFieldsDto` según workflow|**Pre:** transición permitida y campos requeridos. **Post:** `status` actualizado, auditar|`TicketStatusChanged`|Unit guard; E2E 400 si no cumple|Tiempo en estado|
   |**RF-25**|Resolver / Cerrar|`ResolveTicket`, `CloseTicket`|`POST /tickets/:id/close`|`Ticket`, (AuditTrail)|`CloseTicketDto` (resolutionSummary, …)|**Pre:** estado permitido. **Post:** `resolvedAt`, notificar requester, auditar|`TicketResolved`/`TicketClosed`|E2E 200, notificación enviada|MTTR, % reabiertos|
   |**RF-26** (S)|Reasignación con comentario automático|`ReassignWithNote`|`POST /tickets/:id/assign`|`Ticket`, `Comment`, (AuditTrail)|`AssignTicketDto`|**Post:** crear `Comment` interno con razón|`TicketReassigned`|Unit side-effects|—|
   |**RF-27** (S)|Relacionar tickets|`LinkTickets`|`POST /tickets/:id/links`|`Ticket`, `TicketLink`|`LinkTicketsDto` (type: duplicate/related)|**Pre:** no ciclos. **Post:** vínculos cruzados|`TicketLinked`|Unit relaciones|—|

4. Comentarios y adjuntos

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-30**|Agregar comentarios|`AddComment`|`POST /tickets/:id/comments`|`Comment`, `Ticket`, `User`|`AddCommentDto` (body, internal\:boolean)|**Pre:** permisos (interno solo agentes). **Post:** timestamp, auditar opcional|`CommentAdded`|E2E 201 público/interno|FRT cualitativo|
   |**RF-31**|Adjuntar archivos (metadatos)|`AddAttachment`|`POST /tickets/:id/attachments`|`Attachment`, `Ticket`|`AddAttachmentDto` (filename, contentType, urlOrPath, size)|**Pre:** tipo/tamaño permitido. **Post:** solo metadatos en DB; auditar|`AttachmentAdded`|Unit validación; E2E 201|—|
   |**RF-32** (S)|Eliminar adjunto (lógico)|`RemoveAttachment`|`DELETE /tickets/:id/attachments/:attId`|`Attachment`|`IdParamDto`|**Pre:** rol autorizado. **Post:** borrado lógico + audit|`AttachmentRemoved`|E2E 204 y rastro en audit|—|

5. Auditoria y trazabilidad

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-40**|AuditTrail de acciones|`RecordAudit` (cross-cutting)|`GET /tickets/:id/audit`|`AuditTrail`|`AuditQueryDto`|**Post:** entradas inmutables con `actorId`, acción, diff|—|Unit: escritura; E2E: consulta por rango|Cumplimiento / Forénsica|
   |**RF-41** (S)|Exportar historial|`ExportTicketHistory`|`GET /tickets/:id/export?format=pdf\|json`|`AuditTrail`, `Ticket`|`ExportQueryDto`|**Post:** checksum/hash de integridad|—|E2E descarga correcta|—|

6. SLA, Notificaciones e integraciones

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-50**|Monitoreo SLA y breach|`CheckSlaBreaches` (worker)|— (job/cron)|`Ticket`, `SLA`|—|**Pre:** `slaTargetAt` definido. **Post:** marcar breach y escalar|`SlaBreached`|Unit cálculo; Job test con reloj simulado|% SLA cumplido, MTTR|
   |**RF-60**|Notificaciones (fetch)|`NotifyByEvent` (subscriber)|— (suscripción de eventos)|—|`NotifyDto` (to, subject, message)|**Post:** reintentos/backoff si falla|`TicketCreated`, `Assigned`, `Resolved`, `SlaBreached`|Unit adaptador; integración simulada|FRT, satisfacción|
   |**RF-61** (S)|Canales (Slack/Teams)|`NotifyChannel`|`POST /integrations/channels/test`|`IntegrationConfig`|`ChannelConfigDto`|**Pre:** credenciales válidas. **Post:** toggle por área|—|E2E ping al canal de pruebas|—|
   |**RF-62** (S)|Webhooks salientes|`RegisterWebhook`, `DispatchWebhook`|`POST /integrations/webhooks`, (event-driven dispatch)|`WebhookConfig`, `WebhookDelivery`|`WebhookDto`|Firma HMAC, timeout y backoff|`*`|Unit firma/timeout; E2E delivery log|—|
   |**RF-90** (S)|Integración GLPI|`PushToGLPI`, `SyncFromGLPI`|— (suscriptor/worker); opcional `POST /integrations/glpi/test`|—|`GlpiConfigDto`|**Pre:** sesión GLPI válida. **Post:** mapear estados/prioridades|`TicketCreated` → GLPI|Unit cliente GLPI (mock); integración end-to-end|% sync ok|

7. Conocimiento (KB) y Métricas

   |RF|Descripción|Casos de Uso|Endpoints (REST)|Entidades / Tablas|DTOs / Validación|Reglas (Pre / Post)|Eventos|Pruebas sugeridas|KPIs|
   |--|--|--|--|--|--|--|--|--|--|
   |**RF-70** (S)|CRUD artículos KB|`CreateArticle`, `UpdateArticle`, `PublishArticle`, `ListArticles`|`POST/GET/PUT /kb/articles`|`KnowledgeArticle`, `Area`|`CreateArticleDto`, `UpdateArticleDto`|**Pre:** título único por área. **Post:** versión/borrador|`ArticlePublished`|Unit CRUD; E2E búsqueda por tag|Uso de KB en resolución|
   |**RF-71** (S)|Referenciar artículos en ticket|`LinkArticleToTicket`|`POST /tickets/:id/kb-links`|`Ticket_KB` (N\:M)|`LinkKbDto`|**Pre:** artículo existe. **Post:** relación creada|`TicketKbLinked`|E2E 201 relación N\:M|% tickets con KB|
   |**RF-80**|Métricas/KPIs|`ComputeMetrics`|`GET /metrics/sla?areaId&from&to`|`Ticket`, `SLA`|`MetricsQueryDto`|**Post:** MTTA/MTTR/TTR, % SLA, agrupaciones|—|Unit agregaciones; E2E filtros/fechas|MTTA, MTTR, % SLA, Backlog|

## Glosario (Generado con IA)

1. Dominio hospitalario

   - **UCI (Unidad de Cuidados Intensivos):** área crítica con equipos de alta dependencia (ventiladores, monitores).
   - **HIS (Hospital Information System):** sistema integral hospitalario (pacientes, órdenes, facturación).
   - **EMR/EHR (Electronic Medical Record/Health Record):** historia clínica electrónica.
   - **RIS/PACS:** Radiology Information System / Picture Archiving and Communication System (gestión y archivo de imágenes).
   - **CMMS (Computerized Maintenance Management System):** software de mantenimiento (ódenes de trabajo, repuestos).
   - **BIOMED/Ingeniería Clínica:** disciplina que gestiona equipos biomédicos.
   - **Trazabilidad:** capacidad de reconstruir “quién hizo qué y cuándo” (auditoría).

2. ITSM/ITIL y mesa de ayuda

   - **ITSM (IT Service Management):** gestión de servicios de TI; marco de procesos.
   - **ITIL:** buenas prácticas para ITSM (incidentes, problemas, cambios, niveles de servicio).
   - **Ticket:** registro de un incidente/solicitud.
   - **Prioridad:** importancia del ticket (LOW/MEDIUM/HIGH/CRITICAL) que guía atención.
   - **SLA (Service Level Agreement):** acuerdo de tiempos objetivo (respuesta, resolución).
   - **SLI/SLO:** indicador de nivel de servicio / objetivo del servicio (p.ej., % tickets dentro de SLA).
   - **FRT (First Response Time):** tiempo hasta la primera respuesta al solicitante.
   - **MTTA/MTTR/TTR:** Mean Time To Acknowledge/Resolve / Time To Resolve.

3. Integración con GLPI

   - **GLPI:** herramienta ITSM/Helpdesk open source.
   - **App-Token / User Token / Session-Token:** credenciales y token de sesión para la API de GLPI.
   - **Entidad (GLPI “Entity”):** partición organizativa (p.ej., “Hospital Central”, “Clínica Norte”).
   - **Followup (GLPI):** comentario/actualización en un ticket.
   - **Itemtype:** tipo de entidad manipulada por la API (Ticket, Document, User, etc.).

4. Arquitectura y diseño

   - **API RESTful:** interfaz sobre HTTP con recursos, verbos y códigos de estado.
   - **DTO (Data Transfer Object):** objeto para entrada/salida de la API; se valida.
   - **VO (Value Object):** objeto inmutable definido por sus valores (ej.: Email, Priority).
   - **DDD (Domain-Driven Design):** diseño centrado en el dominio (entidades, agregados, servicios).
   - **Clean Architecture / Hexagonal:** capas independientes; dominio en el centro; puertos y adaptadores.
   - **Ports & Adapters:** interfaces (puertos) y sus implementaciones (adaptadores) para infra.
   - **Repository Pattern:** capa de acceso a datos abstracta (oculta ORM/SQL).
   - **CQRS (Command Query Responsibility Segregation):** separar lectura de escritura (opcional).
   - **Event Sourcing (opcional):** estado como replay de eventos; útil para auditoría fuerte.
   - **Saga / Orquestación:** coordina transacciones distribuidas con pasos compensatorios.
   - **Idempotencia:** misma operación repetida produce el mismo resultado (clave en reintentos).

5. Seguridad

   - **JWT (JSON Web Token):** token firmado para autenticación/autorización.
   - **RBAC:** control de acceso basado en roles (Requester/Agent/Tech/Admin).
   - **CORS:** política de orígenes cruzados en HTTP.
   - **TLS/mTLS:** cifrado de transporte / mutuo (cliente y servidor con certificados).
   - **HMAC:** firma de mensajes (p. ej., webhooks) con clave compartida.
   - **OWASP Top 10:** principales riesgos web (XSS, SQLi, CSRF, SSRF, etc.).
   - **PII/PHI:** datos personales / de salud protegidos.

6. Observabilidad y confiabilidad

   - **Logs, Métricas, Trazas:** tres pilares de observabilidad (p. ej., OpenTelemetry).
   - **Correlation/Request ID:** identificador para seguir una petición end-to-end.
   - **Circuit Breaker:** corta llamadas a un servicio fallando para evitar cascadas.
   - **Retry con backoff:** reintentos con espera incremental (exponencial/jitter).
   - **Healthcheck / Readiness / Liveness:** endpoints/señales para orquestadores.

7. Rendimiento y calidad

   - **N+1:** problema de consultas múltiples por fila; se evita con include/join.
   - **Paginación:** limitar resultados (page, pageSize) para eficiencia.
   - **Cache / TTL / ETag:** almacenamiento temporal; tiempo de vida; validación condicional.
   - **Debounce/Throttle:** control de frecuencia de ejecución de funciones/eventos.
   - **Throughput/Latency:** volumen procesado / retardo de respuesta.

8. Base de datos

   - **ACID:** propiedades de transacción (Atomicidad, Consistencia, Aislamiento, Durabilidad).
   - **3FN (Tercera Forma Normal):** normalización para evitar redundancia.
   - **PK/FK/Índice:** clave primaria/foránea; aceleración de búsqueda.
   - **Vista / Vista materializada:** consulta guardada / precalculada.
   - **Particionamiento/Sharding:** dividir datos para escalar.
   - **Migración:** cambio versionado del esquema (p. ej., Prisma Migrate).

9. Estructuras de datos y algoritmos

   - **HashMap:** acceso promedio O(1) por clave (p. ej., código de activo).
   - **PriorityQueue (Heap):** extrae siempre el elemento de mayor prioridad (planificación SLA).
   - **Trie:** búsquedas por prefijo (autocompletar códigos/series).
   - **Interval Tree:** detectar solapamientos de horarios/recursos.
   - **Bloom Filter:** pertenencia probabilística con falsos positivos (pre-filtro rápido).
   - **Dijkstra/A*:** ruteo/menor camino (optimizar recorridos de técnicos).
   - **Greedy/DP:** heurísticas y programación dinámica (asignación y planificación).

10. Desarrollo, pruebas y DevOps

    - **TDD/BDD:** desarrollo guiado por pruebas / por comportamiento.
    - **Unit/E2E:** pruebas unitarias / extremo a extremo.
    - **Mock/Stub/Fixture:** dobles de prueba y datos de apoyo.
    - **CI/CD:** integración y despliegue continuo (pipelines).
    - **IaC:** infraestructura como código (Docker Compose, Terraform).
    - **Blue-Green / Canary:** estrategias de despliegue seguro.

11. HTTP y consumo de APIs

    - **Fetch/Undici:** cliente HTTP en Node.js.
    - **Headers:** metadatos de petición/respuesta (Auth, Content-Type, Cache-Control).
    - **Webhook:** llamada saliente por evento; idempotente y con firma HMAC.
    - **Polling:** consulta periódica cuando no hay webhooks.
    - **Rate Limit:** límite de peticiones por ventana de tiempo.

12. Mensajería y jobs

    - **EventBus:** bus para publicar/suscribirse a eventos de dominio.
    - **Queue/Worker:** procesamiento asíncrono (p. ej., BullMQ + Redis).
    - **Cron/Scheduler:** tareas programadas (revisión de SLA, reportes).

13. Front/Cliente (si aplicara)

    - **SPA:** aplicación de una sola página.
    - **State Management:** manejo de estado (Redux/Zustand/Context).
    - **Form Schema/Validation:** esquema de formulario + validación (Zod/Yup).
