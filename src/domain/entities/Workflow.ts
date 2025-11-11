import { WorkflowId } from "../value-objects/WorkflowId"
import { AreaId } from "../value-objects/AreaId"
import { BaseEntity } from "./BaseEntity"

/** Posibles estados del ticket dentro del workflow */
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED"

/** Define las transiciones válidas entre estados */
export type WorkflowTransitions = Record<TicketStatus, TicketStatus[]>

/** Define los campos requeridos por cada estado */
export type WorkflowRequiredFields = Partial<Record<TicketStatus, string[]>>

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

/**
 * Entidad del dominio que representa el flujo de trabajo (Workflow).
 * Define las reglas de transición y los campos requeridos por estado.
 */
export class Workflow extends BaseEntity<WorkflowId> {
    public readonly areaId: AreaId
    public transitions: WorkflowTransitions
    public requiredFields: WorkflowRequiredFields
    public updatedAt: Date

    private constructor(
        id: WorkflowId,
        areaId: AreaId,
        transitions: WorkflowTransitions,
        requiredFields: WorkflowRequiredFields | undefined,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id, createdAt)
        this.areaId = areaId
        this.transitions = transitions
        this.requiredFields = requiredFields ?? {}
        this.updatedAt = updatedAt
    }

    /** Crea una nueva instancia de Workflow desde datos de entrada */
    public static create(dto: CreateWorkflowInput, now: Date): Workflow {
        Workflow.validateTransitions(dto.transitions)

        const workflow = new Workflow(
            WorkflowId.new(),
            AreaId.from(dto.areaId),
            dto.transitions,
            dto.requiredFields,
            now,
            now,
        )

        workflow.recordEvent({
            type: "workflow.created",
            occurredAt: now,
            payload: {
                id: workflow.id.toString(),
                areaId: dto.areaId,
                transitions: dto.transitions,
            },
        })

        return workflow
    }

    /** Restaura una entidad desde la persistencia */
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

    /** Verifica si una transición es válida */
    public canTransition(from: TicketStatus, to: TicketStatus): boolean {
        return this.transitions[from]?.includes(to) ?? false
    }

    /** Obtiene los campos requeridos para un estado */
    public getRequiredFields(status: TicketStatus): string[] {
        return this.requiredFields[status] ?? []
    }

    /** Actualiza las transiciones del workflow */
    public updateTransitions(
        transitions: WorkflowTransitions,
        requiredFields: WorkflowRequiredFields,
        now: Date,
    ): void {
        Workflow.validateTransitions(transitions)

        const previousTransitions = this.transitions
        const previousRequiredFields = this.requiredFields

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
                    transitions: { from: previousTransitions, to: transitions },
                    requiredFields: { from: previousRequiredFields, to: requiredFields },
                },
            },
        })
    }

    /** Valida que las transiciones sean coherentes con los estados posibles */
    private static validateTransitions(transitions: WorkflowTransitions): void {
        const validStatuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"]

        for (const [from, toStates] of Object.entries(transitions)) {
            if (!validStatuses.includes(from as TicketStatus)) {
                throw new Error(`Invalid source status in transitions: "${from}"`)
            }

            for (const to of toStates) {
                if (!validStatuses.includes(to)) {
                    throw new Error(`Invalid destination status in transitions: "${to}"`)
                }
            }
        }
    }
}
