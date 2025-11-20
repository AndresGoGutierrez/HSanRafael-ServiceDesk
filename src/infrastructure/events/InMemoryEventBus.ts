import type { EventBus } from "../../application/ports/EventBus"
import type { DomainEvent } from "../../domain/events/DomainEvent"

/**
 * In-memory implementation of EventBus.
 * 
 * - Used for testing, local environments, or small systems.
 * - Does not persist events or guarantee delivery once the process ends.
 * - Follows the contract defined in the application layer.
 */
export class InMemoryEventBus implements EventBus {
    /** 
     * Map that associates the name of the event type with the subscribed handlers.
     */
    private readonly handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map()

    /**
     * Publishes a single event to the bus, executing all handlers subscribed to its type.
     * If a handler fails, the error is caught to avoid interrupting propagation.
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
     * Publishes multiple events in parallel.
     */
    async publishAll(events: DomainEvent[]): Promise<void> {
        if (events.length === 0) return
        await Promise.all(events.map((event) => this.publish(event)))
    }

    /**
     * Subscribes a handler to a specific type of event.
     * 
     * @param eventType - Event type (e.g., “ticket.created”)
     * @param handler - Asynchronous function that will process the event
     */
    subscribe(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
        const handlers = this.handlers.get(eventType) ?? []
        handlers.push(handler)
        this.handlers.set(eventType, handlers)
    }

    /**
     * Clears all subscriptions (useful for unit testing).
     */
    clear(): void {
        this.handlers.clear()
    }
}
