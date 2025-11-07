import { TicketStatus } from "../value-objects/Status";

const ALLOWED: Record<TicketStatus, TicketStatus[]> = {
    OPEN: ["ASSIGNED", "CANCELLED"],
    ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["RESOLVED", "CANCELLED"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
    CANCELLED: [],
};

export const canTransition = (from: TicketStatus, to: TicketStatus): boolean =>
    ALLOWED[from].includes(to);
