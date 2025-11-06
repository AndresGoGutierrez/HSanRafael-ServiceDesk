export const TicketStatus = [
    "OPEN",
    "ASSIGNED",
    "IN_PROGESS",
    "RESOLVED",
    "CLOSED",
    "CANCELLED",
] as const;

export type TicketStatus = (typeof TicketStatus)[number];

export const TicketPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type TicketPriority = (typeof TicketPriority)[number];
