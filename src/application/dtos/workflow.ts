import { z } from "zod";

// Transitions: { "OPEN": ["IN_PROGRESS", "ESCALATED"], ... }
// Keys: states defined by each area (dynamic)
export const WorkflowTransitionsSchema = z.record(
    z.string(),             
    z.array(z.string())      
)

// Required fields by state
export const WorkflowRequiredFieldsSchema = z
    .record(
        z.string(),          
        z.array(z.string())  
    )
    .optional()

export const CreateWorkflowSchema = z.object({
    transitions: WorkflowTransitionsSchema,
    requiredFields: WorkflowRequiredFieldsSchema,
});

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial();

export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowDto = z.infer<typeof UpdateWorkflowSchema>;

export interface WorkflowResponseDto {
    id: string
    areaId: string
    transitions: Record<string, string[]>
    requiredFields: Record<string, string[]>
    createdAt: string
    updatedAt: string
}
