import { DomainEvent } from "../../domain/events/DomainEvent";

export interface EventBus {
    publishAll(events: DomainEvent[]): Promise<void>;
}
