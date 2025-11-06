import { randomUUID } from "node:crypto";

export class TicketId {
    private constructor(private readonly value: string) {}

    static new(): TicketId {
        return new TicketId(randomUUID());
    }

    static from(value: string): TicketId {
        return new TicketId(value);
    }

    toString(): string {
        return this.value;
    }
}
