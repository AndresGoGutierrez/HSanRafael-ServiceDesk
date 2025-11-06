import { z } from "zod";
import { ZTicketPriority, ZTicketStatus } from "../../domain/value-objects/status.zod";

export const CreateTicketSchema = z.object({
    title: z.string().trim().min(3),
    priority: ZTicketPriority,
    userId: z.string(),
    areaId: z.string(),
    createdAt: z.date().optional(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const TicketSchema = z.object({
    id: z.uuidv4(),
    title: z.string().trim(),
    status: ZTicketStatus,
    priority: ZTicketPriority,
    userId: z.uuidv4(),
    areaId: z.uuidv4(),
    createdAt: z.date(),
});

export type TicketDto = z.infer<typeof TicketSchema>;

export const RehydrateTicketSchema = z.object({
    id: z.uuidv4(),
    title: z.string().trim(),
    status: ZTicketStatus,
    priority: ZTicketPriority,
    userId: z.uuidv4(),
    areaId: z.uuidv4(),
    createdAt: z.date(),
});

export type RehydrateTicketDto = z.infer<typeof RehydrateTicketSchema>;
