import { z } from "zod";

/**
 * Schema para crear un registro de auditoría (AuditTrail).
 * Se valida que los campos requeridos sean coherentes y seguros.
 */
export const CreateAuditTrailSchema = z.object({
    ticketId: z.string().uuid().optional().nullable(),
    actorId: z.string().uuid({ message: "actorId must be a valid UUID" }),
    action: z.string().trim().min(1, "Action cannot be empty"),
    entityType: z.string().trim().min(1, "Entity type cannot be empty"),
    entityId: z.string().trim().min(1, "Entity ID cannot be empty"),

    // ✅ Cambiado: ahora especificamos keyType y valueType
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
            "Invalid IPv4 address format",
        )
        .optional()
        .nullable()
        .describe("Dirección IP desde la que se ejecutó la acción"),

    userAgent: z.string().trim().optional().nullable(),
});

export type CreateAuditTrailInput = z.infer<typeof CreateAuditTrailSchema>;

/**
 * Schema para rehidratar un registro de auditoría desde la base de datos.
 */
export const RehydrateAuditTrailSchema = z.object({
    id: z.string().uuid(),
    ticketId: z.string().uuid().optional().nullable(),
    actorId: z.string().uuid(),
    action: z.string().trim(),
    entityType: z.string().trim(),
    entityId: z.string().trim(),

    // ✅ Igual ajuste aquí
    changes: z.record(z.string(), z.any()).optional().nullable(),
    metadata: z.record(z.string(), z.any()).optional().nullable(),

    ipAddress: z
        .string()
        .trim()
        .regex(
            /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/,
            "Invalid IPv4 address format",
        )
        .optional()
        .nullable(),

    userAgent: z.string().trim().optional().nullable(),

    occurredAt: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
});

export type RehydrateAuditTrailDto = z.infer<typeof RehydrateAuditTrailSchema>;
