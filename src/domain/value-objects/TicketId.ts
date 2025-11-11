import { randomUUID } from "node:crypto";

export class TicketId {
    private constructor(private readonly value: string) {}

    static new(): TicketId {
        return new TicketId(randomUUID());
    }

    static from(value: string): TicketId {
        if (!TicketId.isValidUUID(value)) {
            throw new Error(`Invalid TicketId: ${value}`);
        }
        return new TicketId(value);
    }

    toString(): string {
        return this.value;
    }

    private static isValidUUID(value: string): boolean {
        return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
    }
}
