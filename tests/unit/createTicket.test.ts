import { describe, it, expect, beforeEach } from "vitest";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";

// -------------------------
// Fakes / In-memory repos
// -------------------------
class InMemoryTicketRepo {
    items: any[] = [];

    async save(ticket: any): Promise<void> {
        this.items.push(ticket);
    }

    async findById(): Promise<null> {
        return null;
    }

    async list(): Promise<any[]> {
        return this.items;
    }
}

class InMemoryAreaRepo {
    async findById(id: string) {
        return {
            id,
            name: "IT Support",
            description: "IT Area",
            isActive: true
        };
    }
}

class InMemorySLARepo {
    async findByAreaId() {
        return {
            resolutionTimeMinutes: 120, // dummy SLA
            responseTimeMinutes: 30
        };
    }
}

class InMemoryAuditRepo {
    saved: any[] = [];
    async save(audit: any): Promise<void> {
        this.saved.push(audit);
    }
}

// -------------------------
// Fakes for clock & bus
// -------------------------
class FakeClock {
    now(): Date {
        return new Date("2025-01-01T00:00:00Z");
    }
}

class FakeBus {
    public published: any[] = [];

    async publishAll(events: unknown[]): Promise<void> {
        this.published.push(...events);
    }
}

// -------------------------
// Tests
// -------------------------
describe("CreateTicket use case", (): void => {
    let ticketRepo: InMemoryTicketRepo;
    let areaRepo: InMemoryAreaRepo;
    let slaRepo: InMemorySLARepo;
    let auditRepo: InMemoryAuditRepo;
    let clock: FakeClock;
    let bus: FakeBus;
    let useCase: CreateTicket;

    const validInput = {
        title: "Printer down",
        description: "Office printer is not working",
        priority: "HIGH",
        userId: "11111111-1111-1111-1111-111111111111",
        areaId: "22222222-2222-2222-2222-222222222222",
        createdAt: new Date("2025-01-01T00:00:00Z") // <-- agregado
    } as const;

    beforeEach(() => {
        ticketRepo = new InMemoryTicketRepo();
        areaRepo = new InMemoryAreaRepo();
        slaRepo = new InMemorySLARepo();
        auditRepo = new InMemoryAuditRepo();
        clock = new FakeClock();
        bus = new FakeBus();

        useCase = new CreateTicket(
            ticketRepo as any,
            areaRepo as any,
            slaRepo as any,
            clock as any,
            bus as any,
            auditRepo as any
        );
    });

    it("sets ticket status as OPEN", async (): Promise<void> => {
        const ticket = await useCase.execute(validInput);
        expect(ticket.status).toBe("OPEN");
    });

    it("persists the ticket in the repository", async (): Promise<void> => {
        await useCase.execute(validInput);
        const all = await ticketRepo.list();

        expect(all).toHaveLength(1);
        expect(all.at(0)).toMatchObject({
            title: "Printer down",
            priority: "HIGH",
            areaId: validInput.areaId,
            status: "OPEN"
        });
    });

    it("publishes exactly one domain event", async (): Promise<void> => {
        await useCase.execute(validInput);
        expect(bus.published).toHaveLength(1);
    });

    it("publishes a ticket.created event with the expected payload", async (): Promise<void> => {
        const ticket = await useCase.execute(validInput);
        const [event] = bus.published;

        expect(event).toMatchObject({
            type: "ticket.created",
            occurredAt: new Date("2025-01-01T00:00:00Z"),
            payload: {
                id: ticket.id.toString(),
                title: "Printer down",
                userId: validInput.userId,
                areaId: validInput.areaId
            }
        });
    });

    it("uses the provided clock to timestamp the event", async (): Promise<void> => {
        await useCase.execute(validInput);
        const [event] = bus.published;
        expect(event.occurredAt).toEqual(new Date("2025-01-01T00:00:00Z"));
    });

    it("drains domain events from the entity after publishing", async (): Promise<void> => {
        const ticket = await useCase.execute(validInput);
        expect(ticket.pullDomainEvents()).toHaveLength(0);
    });

    it("throws if title is blank (validation propagates)", async (): Promise<void> => {
        await expect(
            useCase.execute({ ...validInput, title: "   " } as any)
        ).rejects.toThrow();
    });

    it("throws if priority is invalid", async (): Promise<void> => {
        await expect(
            useCase.execute({ ...validInput, priority: "INVALID" } as any)
        ).rejects.toThrow();
    });
});
