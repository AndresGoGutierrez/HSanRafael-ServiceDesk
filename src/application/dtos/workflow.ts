import { z } from "zod";

export const TicketStatusEnum = z.enum(["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]);

export const WorkflowTransitionsSchema = z.record(TicketStatusEnum, z.array(TicketStatusEnum));

export const WorkflowRequiredFieldsSchema = z.record(z.string(), z.array(z.string())).optional();

export const CreateWorkflowSchema = z.object({
    transitions: WorkflowTransitionsSchema,
    requiredFields: WorkflowRequiredFieldsSchema,
});

export const UpdateWorkflowSchema = CreateWorkflowSchema.partial();

export type CreateWorkflowDto = z.infer<typeof CreateWorkflowSchema>;
export type UpdateWorkflowDto = z.infer<typeof UpdateWorkflowSchema>;

export interface WorkflowResponseDto {
    id: string;
    areaId: string;
    transitions: Record<string, string[]>;
    requiredFields: Record<string, string[]>;
    createdAt: string;
    updatedAt: string;
}
