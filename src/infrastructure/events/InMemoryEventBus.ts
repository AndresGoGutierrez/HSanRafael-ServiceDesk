import type { EventBus } from "../../application/ports/EventBus"
import type { DomainEvent } from "../../domain/events/DomainEvent"

/**
 * Implementación en memoria del EventBus.
 * 
 * - Se utiliza para pruebas, entornos locales o sistemas pequeños.
 * - No persiste eventos ni garantiza entrega una vez el proceso termina.
 * - Sigue el contrato definido en la capa de aplicación.
 */
export class InMemoryEventBus implements EventBus {
    /** 
     * Mapa que asocia el nombre del tipo de evento con los manejadores suscritos.
     */
    private readonly handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map()

    /**
     * Publica un único evento al bus, ejecutando todos los manejadores suscritos a su tipo.
     * Si un manejador falla, se captura el error para evitar interrumpir la propagación.
     */
    async publish(event: DomainEvent): Promise<void> {
        const handlers = this.handlers.get(event.type) ?? []

        await Promise.all(
            handlers.map(async (handler) => {
                try {
                    await handler(event)
                } catch (error) {
                    console.error(`[EventBus] Error al manejar evento ${event.type}:`, error)
                }
            })
        )
    }

    /**
     * Publica múltiples eventos en paralelo.
     */
    async publishAll(events: DomainEvent[]): Promise<void> {
        if (events.length === 0) return
        await Promise.all(events.map((event) => this.publish(event)))
    }

    /**
     * Suscribe un manejador a un tipo específico de evento.
     * 
     * @param eventType - Tipo de evento (ej. "ticket.created")
     * @param handler - Función asíncrona que procesará el evento
     */
    subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
        const handlers = this.handlers.get(eventType) ?? []
        handlers.push(handler)
        this.handlers.set(eventType, handlers)
    }

    /**
     * Limpia todas las suscripciones (útil para pruebas unitarias).
     */
    clear(): void {
        this.handlers.clear()
    }
}
