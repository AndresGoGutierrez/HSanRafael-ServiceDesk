import { z } from "zod"

/**
 * Schema for creating an audit trail.
 * Required fields are validated for consistency and security.
 */
export const CreateAuditTrailSchema = z.object({
    ticketId: z.string().uuid().optional().nullable(),
    actorId: z.string().uuid({ message: "actorId must be a valid UUID" }),
    action: z.string().trim().min(1, "Action cannot be empty"),
    entityType: z.string().trim().min(1, "Entity type cannot be empty"),
    entityId: z.string().trim().min(1, "Entity ID cannot be empty"),

    changes: z
        .record(z.string(), z.any())
        .optional()
        .nullable()
        .default(null)
        .describe("Representa los cambios realizados en formato JSON"),

    metadata: z
        .record(z.string(), z.any())
        .optional()
        .nullable()
        .default(null)
        .describe("Metadatos adicionales de la acción"),

    ipAddress: z
        .string()
        .trim()
        .regex(
            /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/,
            "Invalid IPv4 address format"
        )
        .optional()
        .nullable()
        .describe("Dirección IP desde la que se ejecutó la acción"),

    userAgent: z.string().trim().optional().nullable(),
})

export type CreateAuditTrailInput = z.infer<typeof CreateAuditTrailSchema>

/**
 * Schema for rehydrating an audit log from the database.
 */
export const RehydrateAuditTrailSchema = z.object({
    id: z.string().uuid(),
    ticketId: z.string().uuid().optional().nullable(),
    actorId: z.string().uuid(),
    action: z.string().trim(),
    entityType: z.string().trim(),
    entityId: z.string().trim(),

    changes: z.record(z.string(), z.any()).optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional().nullable(),

    ipAddress: z
        .string()
        .trim()
        .regex(
            /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/,
            "Invalid IPv4 address format"
        )
        .optional()
        .nullable(),

    userAgent: z.string().trim().optional().nullable(),

    occurredAt: z.preprocess(
        (val) => (typeof val === "string" ? new Date(val) : val),
        z.date()
    ),
})

export type RehydrateAuditTrailDto = z.infer<typeof RehydrateAuditTrailSchema>
