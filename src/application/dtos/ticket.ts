import { z } from "zod"
import { ZTicketPriority, ZTicketStatus } from "../../domain/value-objects/status.zod"

/**
 * Esquema para crear un nuevo ticket
 */
export const CreateTicketSchema = z.object({
    title: z.string().trim().min(3, "El título debe tener al menos 3 caracteres"),
    priority: ZTicketPriority,
    userId: z.string().uuid("El userId debe ser un UUID válido"),
    areaId: z.string().uuid("El areaId debe ser un UUID válido"),
    createdAt: z
        .union([z.string(), z.date()])
        .optional()
        .transform((val) => (val ? new Date(val) : new Date())), // fallback seguro
})

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>

/**
 * Esquema de ticket básico para transferir datos (DTO)
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
 * Esquema extendido para reconstruir un ticket desde persistencia
 * (incluye campos opcionales o derivados del dominio)
 */
export const RehydrateTicketSchema = z.object({
    id: z.string().uuid(),
    title: z.string().trim(),
    description: z.string().nullable().optional(),
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
 * Esquema para asignar un ticket a un agente
 */
export const AssignTicketSchema = z.object({
    assigneeId: z.string().uuid("El assigneeId debe ser un UUID válido"),
})

export type AssignTicketInput = z.infer<typeof AssignTicketSchema>

/**
 * Esquema para transición de estado del ticket
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
