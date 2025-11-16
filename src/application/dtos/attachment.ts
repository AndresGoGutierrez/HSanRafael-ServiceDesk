import { z } from "zod"

/**
 * Schema for creating an attachment associated with a ticket.
 * All required fields are validated to ensure they are correct and consistent.
 */
export const CreateAttachmentSchema = z.object({
    ticketId: z.string().uuid(),
    uploaderId: z.string().uuid(),
    filename: z.string().trim().min(1, "Filename cannot be empty"),
    contentType: z
        .string()
        .trim()
        .min(1)
        .regex(/^[\w.+-]+\/[\w.+-]+$/, "Invalid MIME type format"),
    size: z.number().int().positive("File size must be positive"),
    url: z.string().trim().url("Invalid URL format"),
})

export type CreateAttachmentInput = z.infer<typeof CreateAttachmentSchema>

/**
 * Schema for rehydrating an attachment from the database or a persistent source.
 * Typically used in the repository.
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
