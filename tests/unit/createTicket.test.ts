import { describe, it, expect, beforeEach } from "vitest";
import { CreateTicket } from "../../src/application/use-cases/CreateTicket";

class InMemoryRepo {
    items: any[] = [];

    async save(ticket: unknown): Promise<void> {
        this.items.push(ticket);
    }

    async findById(): Promise<null> {
        return null;
    }

    async list(): Promise<any[]> {
        return this.items;
    }
}

class InMemoryAuditRepo {
    items: any[] = [];

    async save(audit: unknown): Promise<void> {
        this.items.push(audit);
    }
}

class InMemoryAreaRepo {
    // return a simple area object with SLA minutes
    async findById(id: string): Promise<any | null> {
        return { id, slaResolutionMinutes: 60 };
    }
}

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

describe("CreateTicket use case", (): void => {
    let repo: InMemoryRepo;
    let clock: FakeClock;
    let bus: FakeBus;
    let useCase: CreateTicket;

    const input = {
        title: "Printer down",
        description: "La impresora no responde y muestra error E23",
        priority: "HIGH",
        userId: "11111111-1111-4111-8111-111111111111",
        areaId: "22222222-2222-4222-8222-222222222222",
        createdAt: new Date("2025-01-01T00:00:00Z"),
    } as const;

    beforeEach(() => {
        repo = new InMemoryRepo();
        clock = new FakeClock();
        bus = new FakeBus();
        const areaRepo = new InMemoryAreaRepo();
        const auditRepo = new InMemoryAuditRepo();

        useCase = new CreateTicket(
            repo as any,
            areaRepo as any,
            clock as any,
            bus as any,
            auditRepo as any,
        );
    });

    it("sets ticket status as OPEN", async (): Promise<void> => {
        const ticket = await useCase.execute(input);
        expect(ticket.status).toBe("OPEN");
    });

    it("persists the ticket in the repository", async (): Promise<void> => {
        await useCase.execute(input);
        const all = await repo.list();
        expect(all).toHaveLength(1);
        const saved: any = all.at(0);
        expect(saved.title).toBe("Printer down");
        expect(saved.priority).toBe("HIGH");
        expect(saved.status).toBe("OPEN");
        expect(saved.requesterId?.toString()).toBe("11111111-1111-4111-8111-111111111111");
        expect(saved.areaId).toBe("22222222-2222-4222-8222-222222222222");
    });

    it("publishes exactly one domain event", async (): Promise<void> => {
        await useCase.execute(input);
        expect(bus.published).toHaveLength(1);
    });

    it("publishes a ticket.created event with the expected payload", async (): Promise<void> => {
        const ticket = await useCase.execute(input);
        const [event] = bus.published;

        expect(event).toMatchObject({
            type: "ticket.created",
            occurredAt: new Date("2025-01-01T00:00:00Z"),
            payload: {
                id: ticket.id.toString(),
                title: "Printer down",
                userId: "11111111-1111-4111-8111-111111111111",
                areaId: "22222222-2222-4222-8222-222222222222",
            },
        });
    });

    it("uses the provided clock to timestamp the event", async (): Promise<void> => {
        await useCase.execute(input);
        const [event] = bus.published;
        expect(event.occurredAt).toEqual(new Date("2025-01-01T00:00:00Z"));
    });

    it("drains domain events from the entity after publishing", async (): Promise<void> => {
        const ticket = await useCase.execute(input);
        expect(ticket.pullDomainEvents()).toHaveLength(0);
    });

    it("throws if title is blank (validation propagates)", async (): Promise<void> => {
        await expect(useCase.execute({ ...input, title: "   " } as any)).rejects.toThrow();
    });

    it("throws if priority is invalid", async (): Promise<void> => {
        await expect(useCase.execute({ ...input, priority: "INVALID" } as any)).rejects.toThrow();
    });
});
