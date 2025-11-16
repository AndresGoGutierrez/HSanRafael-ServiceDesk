import { z } from "zod";

/**
 * Schema for creating a new comment.
 * Defines input validation rules from the infrastructure layer (HTTP, etc.).
 */
export const CreateCommentSchema = z.object({
  body: z.string().trim().min(1, "El comentario no puede estar vacío"),
  isInternal: z
    .union([
      z.boolean(),
      z.enum(["true", "false"])
    ])
    .transform(val => val === true || val === "true")
    .default(false)
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>

/**
 * Schema for rehydrating the entity from a data source (e.g., database).
 * Ensures that the loaded data complies with the domain structure.
 */
export const RehydrateCommentSchema = z.object({
    id: z.string().uuid({ message: "El id debe ser un UUID válido" }),
    ticketId: z.string().uuid({ message: "El ticketId debe ser un UUID válido" }),
    authorId: z.string().uuid({ message: "El authorId debe ser un UUID válido" }),
    body: z.string().trim(),
    isInternal: z.boolean(),
    createdAt: z.preprocess(
        (val) => {
            if (val instanceof Date) return val
            if (typeof val === "string" || typeof val === "number") return new Date(val)
            return undefined
        },
        z.date()
    ),
});

/**
 * DTO type used to rehydrate the Comment domain entity.
 */
export type RehydrateCommentDto = z.infer<typeof RehydrateCommentSchema>;
