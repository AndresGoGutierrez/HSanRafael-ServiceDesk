import { AreaId } from "../value-objects/AreaId"
import { BaseEntity } from "./BaseEntity"

export interface CreateAreaInput {
    name: string
    description?: string
}

export interface RehydrateAreaDto {
    id: string
    name: string
    description: string | null
    isActive: boolean
    slaResponseMinutes: number | null
    slaResolutionMinutes: number | null
    createdAt: string | Date // <-- más flexible para serialización
}

export interface SLAConfig {
    responseMinutes: number
    resolutionMinutes: number
}

export interface WorkflowConfig {
    transitions: Record<
        "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED",
        ("OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED")[]
    >
    requiredFields?: Record<
        "OPEN" | "IN_PROGRESS" | "PENDING" | "RESOLVED" | "CLOSED",
        string[]
    >
}



/**
 * Representa un área dentro del dominio.
 * Contiene información de SLA, estado y eventos de creación.
 */
export class Area extends BaseEntity<AreaId> {
    public name: string
    public description: string | null
    public isActive: boolean
    public slaResponseMinutes: number | null
    public slaResolutionMinutes: number | null
    public workflowConfig: WorkflowConfig | null

    private constructor(
        id: AreaId,
        name: string,
        description: string | null,
        isActive: boolean,
        slaResponseMinutes: number | null,
        slaResolutionMinutes: number | null,
        createdAt: Date,
        workflowConfig: WorkflowConfig | null = null,
    ) {
        super(id, createdAt)
        this.name = name.trim()
        this.description = description
        this.isActive = isActive
        this.slaResponseMinutes = slaResponseMinutes
        this.slaResolutionMinutes = slaResolutionMinutes
        this.workflowConfig = workflowConfig
    }

    /** Crea una nueva instancia de Area desde datos de entrada */
    public static create(dto: CreateAreaInput, now: Date): Area {
        if (!dto.name?.trim()) {
            throw new Error("El nombre del área no puede estar vacío.")
        }

        const area = new Area(
            AreaId.new(),
            dto.name.trim(),
            dto.description?.trim() || null,
            true,
            null,
            null,
            now,
        )

        area.recordEvent({
            type: "area.created",
            occurredAt: now,
            payload: {
                id: area.id.toString(),
                name: area.name,
            },
        })

        return area
    }

    /** Restaura una entidad desde la persistencia */
    public static rehydrate(row: RehydrateAreaDto): Area {
        return new Area(
            AreaId.from(row.id),
            row.name,
            row.description,
            row.isActive,
            row.slaResponseMinutes,
            row.slaResolutionMinutes,
            new Date(row.createdAt),
        )
    }

    /** Desactiva el área (soft delete) */
    public deactivate(at: Date): void {
        if (!this.isActive) {
            throw new Error("Area is already deactivated")
        }

        this.isActive = false

        this.recordEvent({
            type: "area.deactivated",
            occurredAt: at,
            payload: { id: this.id.toString() },
        })
    }

    /** Actualiza nombre y descripción */
    public update(name: string, description?: string): void {
        const trimmedName = name?.trim()
        if (!trimmedName) {
            throw new Error("El nombre del área no puede estar vacío.")
        }

        this.name = trimmedName
        this.description = description?.trim() || null

        this.recordEvent({
            type: "area.updated",
            occurredAt: new Date(),
            payload: {
                id: this.id.toString(),
                name: this.name,
                description: this.description,
            },
        })
    }

    /** Configura los parámetros de SLA */
    public configureSLA(config: SLAConfig): void {
        if (config.responseMinutes < 0 || config.resolutionMinutes < 0) {
            throw new Error("Los valores de SLA no pueden ser negativos.")
        }

        this.slaResponseMinutes = config.responseMinutes
        this.slaResolutionMinutes = config.resolutionMinutes

        this.recordEvent({
            type: "area.sla_configured",
            occurredAt: new Date(),
            payload: {
                id: this.id.toString(),
                responseMinutes: config.responseMinutes,
                resolutionMinutes: config.resolutionMinutes,
            },
        })
    }

    public setWorkflow(config: WorkflowConfig): void {
        this.workflowConfig = config

        this.recordEvent({
            type: "area.workflow_changed",
            occurredAt: new Date(),
            payload: {
                areaId: this.id.toString(),
                config,
            },
        })
    }
}

