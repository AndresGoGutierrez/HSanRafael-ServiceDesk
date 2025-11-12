import { z } from "zod";

/**
 * Esquema base compartido por Create y Update.
 * Define las reglas de negocio para tiempos de SLA.
 */
const BaseSLASchema = z
    .object({
        responseTimeMinutes: z.coerce
            .number()
            .int()
            .min(0, "Response time must be ≥ 0")
            .max(10080, "Response time cannot exceed 7 days"),
        resolutionTimeMinutes: z.coerce
            .number()
            .int()
            .min(0, "Resolution time must be ≥ 0")
            .max(10080, "Resolution time cannot exceed 7 days"),
    })
    .refine((data) => data.responseTimeMinutes <= data.resolutionTimeMinutes, {
        message: "Response time cannot exceed resolution time",
        path: ["responseTimeMinutes"],
    });

/**
 * DTO de creación de SLA
 * - Requiere ambos campos
 */
export const CreateSLASchema = BaseSLASchema;

/**
 * DTO de actualización de SLA
 * - Todos los campos son opcionales
 */
export const UpdateSLASchema = BaseSLASchema.partial();

/**
 * Tipos inferidos a partir de los esquemas Zod
 */
export type CreateSLADto = z.infer<typeof CreateSLASchema>;
export type UpdateSLADto = z.infer<typeof UpdateSLASchema>;

/**
 * DTO de respuesta (para capa de presentación / API)
 */
export interface SLAResponseDto {
    id: string;
    areaId: string;
    responseTimeMinutes: number;
    resolutionTimeMinutes: number;
    createdAt: string; // mejor que Date para transporte HTTP
    updatedAt: string;
}
