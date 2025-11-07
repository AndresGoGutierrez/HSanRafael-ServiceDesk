import { z } from "zod";

/**
 * Schema para crear un nuevo comentario.
 * Define las reglas de validación de entrada desde la capa de infraestructura (HTTP, etc.)
 */
export const CreateCommentSchema = z.object({
    ticketId: z
        .string()
        .uuid({ message: "El ticketId debe ser un UUID válido" }),

    authorId: z
        .string()
        .uuid({ message: "El authorId debe ser un UUID válido" }),

    body: z
        .string()
        .trim()
        .min(1, { message: "El cuerpo del comentario no puede estar vacío" })
        .max(1000, { message: "El comentario no puede superar los 1000 caracteres" }),

    isInternal: z.boolean().default(false),
});

/**
 * Tipo derivado del esquema de creación.
 * Se utiliza en los casos de uso de aplicación.
 */
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

/**
 * Schema para rehidratar la entidad desde una fuente de datos (p. ej. base de datos).
 * Garantiza que los datos cargados cumplen con la estructura del dominio.
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
 * Tipo DTO usado para rehidratar la entidad de dominio Comment.
 */
export type RehydrateCommentDto = z.infer<typeof RehydrateCommentSchema>;
