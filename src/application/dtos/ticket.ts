import { z } from "zod"
import { ZTicketPriority, ZTicketStatus } from "../../domain/value-objects/status.zod"

/**
 * Schema for creating a new ticket
 */
export const CreateTicketSchema = z.object({
    title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
    description: z
        .string()
        .min(5, "la descripción es obligatoria"),
    priority: ZTicketPriority,
    userId: z.string().uuid("El userId debe ser un UUID válido"),
    areaId: z.string().uuid("El areaId debe ser un UUID válido"),
    createdAt: z.union([z.string(), z.date()]).optional(),
})

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>

/**
 * Basic ticket schema for transferring data (DTO)
 */
export const TicketSchema = z.object({
    id: z.string().uuid(),
    title: z.string().trim(),
    status: ZTicketStatus,
    priority: ZTicketPriority,
    userId: z.string().uuid(),
    areaId: z.string().uuid(),
    createdAt: z.date(),
})

export type TicketDto = z.infer<typeof TicketSchema>

/**
 * Extended schema for reconstructing a ticket from persistence
 * (includes optional or domain-derived fields)
 */
export const RehydrateTicketSchema = z.object({
    id: z.string().uuid(),
    title: z.string().trim(),
    description: z
        .string()
        .min(5, "la descripción es obligatoria"),
    status: ZTicketStatus,
    priority: ZTicketPriority,
    userId: z.string().uuid(),
    assigneeId: z.string().uuid().nullable().optional(),
    areaId: z.string().uuid(),
    slaTargetAt: z.date().nullable().optional(),
    slaBreached: z.boolean().optional(),
    firstResponseAt: z.date().nullable().optional(),
    resolvedAt: z.date().nullable().optional(),
    closedAt: z.date().nullable().optional(),
    resolutionSummary: z.string().nullable().optional(),
    createdAt: z.date(),
})

export type RehydrateTicketDto = z.infer<typeof RehydrateTicketSchema>

/**
 * Schema for assigning a ticket to an agent
 */
export const AssignTicketSchema = z.object({
    assigneeId: z.string().uuid("El assigneeId debe ser un UUID válido"),
})

export type AssignTicketInput = z.infer<typeof AssignTicketSchema>

/**
 * Ticket status transition diagram
 */
export const TransitionTicketSchema = z.object({
    status: ZTicketStatus,
})

export type TransitionTicketInput = z.infer<typeof TransitionTicketSchema>

export const CloseTicketSchema = z.object({
    resolutionSummary: z
        .string()
        .min(10, "El resumen de resolución debe tener al menos 10 caracteres"),
    notifyRequester: z.boolean().optional().default(true),
})

export type CloseTicketInput = z.infer<typeof CloseTicketSchema>
