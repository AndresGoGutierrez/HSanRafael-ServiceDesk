import { z } from "zod"

/**
 * Schema para la creación de un adjunto (Attachment) asociado a un ticket.
 * Se valida que todos los campos requeridos sean correctos y coherentes.
 */
export const CreateAttachmentSchema = z.object({
    ticketId: z.string().uuid(),
    uploaderId: z.string().uuid(),
    filename: z.string().trim().min(1, "Filename cannot be empty"),
    contentType: z
        .string()
        .trim()
        .min(1)
        .regex(/^[\w.+-]+\/[\w.+-]+$/, "Invalid MIME type format"), // Ejemplo: "image/png"
    size: z.number().int().positive("File size must be positive"),
    url: z.string().trim().url("Invalid URL format"),
})

export type CreateAttachmentInput = z.infer<typeof CreateAttachmentSchema>

/**
 * Schema para rehidratar un adjunto desde la base de datos o una fuente persistente.
 * Se usa típicamente en el repositorio.
 */
export const RehydrateAttachmentSchema = z.object({
    id: z.string().uuid(),
    ticketId: z.string().uuid(),
    uploaderId: z.string().uuid(),
    filename: z.string().trim(),
    contentType: z
        .string()
        .trim()
        .regex(/^[\w.+-]+\/[\w.+-]+$/, "Invalid MIME type format"),
    size: z.number().int().nonnegative(),
    url: z.string().trim().url(),
    createdAt: z.preprocess((val) => (typeof val === "string" ? new Date(val) : val), z.date()),
})

export type RehydrateAttachmentDto = z.infer<typeof RehydrateAttachmentSchema>
