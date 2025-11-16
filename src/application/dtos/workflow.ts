import { z } from "zod"

// Transitions: { "OPEN": ["IN_PROGRESS", "ESCALATED"], ... }
// Keys: estados definidos por cada área (dinámicos)
export const WorkflowTransitionsSchema = z.record(
    z.string(),              // estado actual
    z.array(z.string())      // estados permitidos siguientes
)

// Required fields por estado
export const WorkflowRequiredFieldsSchema = z
    .record(
        z.string(),          // estado
        z.array(z.string())  // lista de campos requeridos
    )
    .optional()

export const CreateWorkflowSchema = z.object({
    transitions: WorkflowTransitionsSchema,
    requiredFields: WorkflowRequiredFieldsSchema,
})

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial()

export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>
export type UpdateWorkflowDto = z.infer<typeof UpdateWorkflowSchema>

export interface WorkflowResponseDto {
    id: string
    areaId: string
    transitions: Record<string, string[]>
    requiredFields: Record<string, string[]>
    createdAt: string
    updatedAt: string
}
