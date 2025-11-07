Patrones de Arquitectura
1. Clean Architecture (Arquitectura Limpia)
El sistema está organizado en capas con dependencias unidireccionales: Dominio → Aplicación → Infraestructura → Interfaces. README.md:427-465

Capas:

Domain: Entidades puras sin dependencias externas (Ticket, User, Area) README.md:834-870
Application: Casos de uso y puertos (interfaces) README.md:1045-1065
Infrastructure: Implementaciones concretas (repositorios Prisma, event bus) README.md:917-952
Interfaces: Controladores HTTP, rutas, middlewares README.md:2026-2062

2. Vertical Slice Architecture (Módulos Verticales)
Cada feature se encapsula en un módulo que contiene sus propios casos de uso, controladores y rutas. README.md:1458-1475 El TicketModule agrupa toda la lógica relacionada con tickets en una unidad cohesiva. README.md:1980-2013

Patrones de Diseño
3. Repository Pattern
Define contratos (TicketRepository) que abstraen la persistencia del dominio. README.md:897-904 La implementación PrismaTicketRepository usa Prisma ORM para operaciones CRUD sin acoplar el dominio a la base de datos. README.md:917-952

4. Strategy Pattern
La interfaz Clock permite intercambiar implementaciones de tiempo: SystemClock (hora del sistema) y LocalClock (UTC-5 para Colombia). README.md:700-719 Esto facilita pruebas con tiempo controlado.

5. Domain Event Pattern
Las entidades registran eventos significativos mediante recordEvent() en BaseEntity. README.md:987-1002 Por ejemplo, Ticket.create() emite ticket.created. README.md:1007-1031 Los casos de uso extraen eventos con pullDomainEvents() y los publican vía EventBus. README.md:1053-1061

6. Event Bus Pattern
La interfaz EventBus desacopla la emisión de eventos de su manejo. README.md:959-964 InMemoryEventBus implementa publicación asíncrona para auditoría y reactividad. README.md:1493

7. State Machine Pattern
TicketStateMachine define transiciones válidas entre estados de tickets mediante el objeto ALLOWED. README.md:877-890 La función canTransition() valida cambios de estado antes de aplicarlos. README.md:889

8. Mapper Pattern
TicketMapper.toHttp() transforma entidades de dominio a objetos planos para respuestas HTTP, desacoplando el modelo interno del formato expuesto. README.md:1075-1083

9. Controller Pattern
TicketsController actúa como punto de entrada HTTP, validando entrada con Zod, delegando a casos de uso y transformando respuestas. README.md:1100-1112

10. Dependency Injection
Los módulos reciben dependencias (repositorio, event bus, clock) en el constructor y las inyectan en casos de uso y controladores. README.md:1458-1475 ServerBootstrap ensambla todas las dependencias. README.md:1490-1496


