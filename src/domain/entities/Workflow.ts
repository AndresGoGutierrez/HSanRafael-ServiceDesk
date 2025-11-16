import { WorkflowId } from "../value-objects/WorkflowId"
import { AreaId } from "../value-objects/AreaId"
import { BaseEntity } from "./BaseEntity"

export type TicketStatus = string

export type WorkflowTransitions = Record<string, string[]>

export type WorkflowRequiredFields = Record<string, string[]>

export interface CreateWorkflowInput {
    areaId: string
    transitions: WorkflowTransitions
    requiredFields?: WorkflowRequiredFields
}

export interface RehydrateWorkflowDto {
    id: string
    areaId: string
    transitions: WorkflowTransitions
    requiredFields: WorkflowRequiredFields
    createdAt: string | Date
    updatedAt: string | Date
}

export class Workflow extends BaseEntity<WorkflowId> {
    public readonly areaId: AreaId
    public transitions: WorkflowTransitions
    public requiredFields: WorkflowRequiredFields
    public updatedAt: Date

    private constructor(
        id: WorkflowId,
        areaId: AreaId,
        transitions: WorkflowTransitions,
        requiredFields: WorkflowRequiredFields,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id, createdAt)
        this.areaId = areaId
        this.transitions = transitions
        this.requiredFields = requiredFields
        this.updatedAt = updatedAt
    }

    public static create(dto: CreateWorkflowInput, now: Date): Workflow {
        return new Workflow(
            WorkflowId.new(),
            AreaId.from(dto.areaId),
            dto.transitions,
            dto.requiredFields ?? {},
            now,
            now,
        )
    }

    public static rehydrate(row: RehydrateWorkflowDto): Workflow {
        return new Workflow(
            WorkflowId.from(row.id),
            AreaId.from(row.areaId),
            row.transitions,
            row.requiredFields,
            new Date(row.createdAt),
            new Date(row.updatedAt),
        )
    }

    public canTransition(from: TicketStatus, to: TicketStatus): boolean {
        return this.transitions[from]?.includes(to) ?? false
    }

    public getRequiredFields(status: TicketStatus): string[] {
        return this.requiredFields[status] ?? []
    }

    public updateTransitions(
        transitions: WorkflowTransitions,
        requiredFields: WorkflowRequiredFields,
        now: Date,
    ): void {
        const prevT = this.transitions
        const prevR = this.requiredFields

        this.transitions = transitions
        this.requiredFields = requiredFields
        this.updatedAt = now

        this.recordEvent({
            type: "workflow.updated",
            occurredAt: now,
            payload: {
                id: this.id.toString(),
                areaId: this.areaId.toString(),
                changes: {
                    transitions: { from: prevT, to: transitions },
                    requiredFields: { from: prevR, to: requiredFields },
                },
            },
        })
    }
}
