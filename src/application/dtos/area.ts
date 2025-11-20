import { z } from "zod";

/**
 * Outline for creating an area.* Applies basic validations and space cleaning.
*/
export const CreateAreaSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres." })
        .max(100, { message: "El nombre no puede exceder los 100 caracteres." }),
    description: z
        .string()
        .trim()
        .max(255, { message: "La descripción no puede exceder los 255 caracteres." })
        .optional(),
});

export type CreateAreaInput = z.infer<typeof CreateAreaSchema>;

/**
 * Schema for updating an existing area.
 * Inherits the same restrictions as CreateAreaSchema.
 */
export const UpdateAreaSchema = CreateAreaSchema.extend({
    // podrías incluir validaciones condicionales si aplica
});
export type UpdateAreaInput = z.infer<typeof UpdateAreaSchema>;
/**
 * Scheme for rehydrating an Area entity from persistence.
 */
export const RehydrateAreaSchema = z.object({
    id: z.string().uuid({ message: "El ID debe ser un UUID válido." }),
    name: z.string(),
    description: z.string().nullable(),
    isActive: z.boolean(),
    slaResponseMinutes: z.number().nullable(),
    slaResolutionMinutes: z.number().nullable(),
    createdAt: z
        .union([z.date(), z.string().transform((val) => new Date(val))])
        .refine((d) => !isNaN(d.getTime()), { message: "Fecha inválida." }),
});

export type RehydrateAreaDto = z.infer<typeof RehydrateAreaSchema>;

export const DeactivateAreaSchema = z.object({
    reason: z.string().optional(),
});

export type DeactivateAreaInput = z.infer<typeof DeactivateAreaSchema>;
