
Hospital Service Desk — Arquitectura y Diseño

🧩 Patrones de Arquitectura
1. Clean Architecture (Arquitectura Limpia)

El sistema está organizado en capas con dependencias unidireccionales:

Dominio → Aplicación → Infraestructura → Interfaces

Capas principales:

 - Domain: Entidades puras sin dependencias externas (Ticket, User, Area)
 - Application: Casos de uso y puertos (interfaces)
 - Infrastructure: Implementaciones concretas (repositorios Prisma, event bus)
 - Interfaces: Controladores HTTP, rutas y middlewares

Esta estructura garantiza baja dependencia, alta mantenibilidad y reglas de negocio aisladas.

2. Vertical Slice Architecture (Módulos Verticales)

Cada funcionalidad del sistema se organiza como un módulo vertical independiente, incluyendo:

 - Casos de uso
 - Controladores
 - Rutas
 - Repositorios
 - Lógica de negocio

Ejemplo: TicketModule, que encapsula toda la lógica referente a tickets en un único paquete cohesivo.

🛠️ Patrones de Diseño Implementados

3. Repository Pattern

Define contratos como TicketRepository para abstraer la lógica de persistencia.
La implementación PrismaTicketRepository ejecuta operaciones CRUD sin acoplar el dominio a la base de datos.

4. Strategy Pattern

El sistema usa una interfaz Clock que permite intercambiar implementaciones de tiempo:

 - SystemClock → hora real del sistema
 - LocalClock → UTC-5 (Colombia)

Esto permite pruebas controladas sin depender del tiempo real.

5. Domain Event Pattern

Las entidades heredan de BaseEntity y registran eventos mediante recordEvent().
Ejemplo:
Ticket.create() emite el evento ticket.created.

Los casos de uso extraen eventos con pullDomainEvents() y los publican mediante EventBus.

6. Event Bus Pattern

La interfaz EventBus desacopla la emisión y manejo de eventos.
InMemoryEventBus publica eventos de forma asíncrona para:

 - Auditoría
 - Procesos reactivos
 - Listeners internos

7. State Machine Pattern

TicketStateMachine define todas las transiciones válidas entre estados del ticket mediante una matriz ALLOWED.
canTransition() valida cada cambio antes de aplicarse.

Esto evita estados inválidos y mantiene consistencia en el flujo del ticket.

8. Mapper Pattern

TicketMapper.toHttp() transforma entidades de dominio en objetos planos listos para ser enviados como respuesta HTTP.
Evita exponer el modelo interno directamente.

9. Controller Pattern

Los controladores:

 - Validan la entrada con Zod.
 - Delegan la lógica a los casos de uso.
 - Formatean respuestas con los mappers.

Ejemplo: TicketsController.

10. Dependency Injection

Los módulos reciben sus dependencias desde el constructor:

 - repositorios
 - event bus
 - clock

ServerBootstrap es el encargado de ensamblar todo el sistema.

🗄️ Modelo de Base de Datos

📌 Diagrama (DBML):
https://github.com/AndresGoGutierrez/HSanRafael-ServiceDesk/blob/main/prisma/DBML-Schema.png?raw=true

📚 Documentación Completa

📘 Diccionario de Datos / endpoints - Hospital Service Desk
https://github.com/AndresGoGutierrez/HSanRafael-ServiceDesk/wiki
