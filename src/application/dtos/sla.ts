import { z } from "zod"

/**
 * Base schema shared by Create and Update.
 * Defines business rules for SLA times.
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
    .refine(
        (data) => data.responseTimeMinutes <= data.resolutionTimeMinutes,
        {
            message: "Response time cannot exceed resolution time",
            path: ["responseTimeMinutes"],
        }
    )

/**
 * SLA creation DTO
 * - Both fields are required
 */
export const CreateSLASchema = BaseSLASchema

/**
 * SLA update DTO
 * - All fields are optional
 */
export const UpdateSLASchema = BaseSLASchema.partial()

/**
 * Types inferred from Zod schemas
 */
export type CreateSLADto = z.infer<typeof CreateSLASchema>
export type UpdateSLADto = z.infer<typeof UpdateSLASchema>

/**
 * Response DTO (for presentation layer / API)
 */
export interface SLAResponseDto {
    id: string
    areaId: string
    responseTimeMinutes: number
    resolutionTimeMinutes: number
    createdAt: string
    updatedAt: string
}
