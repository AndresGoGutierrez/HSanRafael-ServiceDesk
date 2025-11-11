import { SLAId } from "../value-objects/SLAId"
import { AreaId } from "../value-objects/AreaId"
import { BaseEntity } from "./BaseEntity"

export interface CreateSLAInput {
    areaId: string
    responseTimeMinutes: number
    resolutionTimeMinutes: number
}

export interface RehydrateSLADto {
    id: string
    areaId: string
    responseTimeMinutes: number
    resolutionTimeMinutes: number
    createdAt: string | Date
    updatedAt: string | Date
}

/**
 * Entidad de dominio que representa un SLA (Service Level Agreement).
 * Define los tiempos de respuesta y resolución asociados a un área específica.
 */
export class SLA extends BaseEntity<SLAId> {
    public readonly areaId: AreaId
    public responseTimeMinutes: number
    public resolutionTimeMinutes: number
    public updatedAt: Date

    private constructor(
        id: SLAId,
        areaId: AreaId,
        responseTimeMinutes: number,
        resolutionTimeMinutes: number,
        createdAt: Date,
        updatedAt: Date,
    ) {
        super(id, createdAt)
        this.areaId = areaId
        this.responseTimeMinutes = responseTimeMinutes
        this.resolutionTimeMinutes = resolutionTimeMinutes
        this.updatedAt = updatedAt
    }

    /** 
     * Crea una nueva instancia de SLA desde datos de entrada.
     */
    public static create(dto: CreateSLAInput, now: Date): SLA {
        this.validateTimes(dto.responseTimeMinutes, dto.resolutionTimeMinutes)

        const sla = new SLA(
            SLAId.new(),
            AreaId.from(dto.areaId),
            dto.responseTimeMinutes,
            dto.resolutionTimeMinutes,
            now,
            now,
        )

        sla.recordEvent({
            type: "sla.created",
            occurredAt: now,
            payload: {
                id: sla.id.toString(),
                areaId: dto.areaId,
                responseTimeMinutes: dto.responseTimeMinutes,
                resolutionTimeMinutes: dto.resolutionTimeMinutes,
            },
        })

        return sla
    }

    /**
     * Restaura una entidad SLA desde su persistencia.
     */
    public static rehydrate(row: RehydrateSLADto): SLA {
        return new SLA(
            SLAId.from(row.id),
            AreaId.from(row.areaId),
            row.responseTimeMinutes,
            row.resolutionTimeMinutes,
            new Date(row.createdAt),
            new Date(row.updatedAt),
        )
    }

    /**
     * Actualiza los tiempos configurados del SLA.
     */
    public update(responseTimeMinutes: number, resolutionTimeMinutes: number, now: Date): void {
        SLA.validateTimes(responseTimeMinutes, resolutionTimeMinutes)

        const oldResponse = this.responseTimeMinutes
        const oldResolution = this.resolutionTimeMinutes

        this.responseTimeMinutes = responseTimeMinutes
        this.resolutionTimeMinutes = resolutionTimeMinutes
        this.updatedAt = now

        this.recordEvent({
            type: "sla.updated",
            occurredAt: now,
            payload: {
                id: this.id.toString(),
                areaId: this.areaId.toString(),
                changes: {
                    responseTimeMinutes: { from: oldResponse, to: responseTimeMinutes },
                    resolutionTimeMinutes: { from: oldResolution, to: resolutionTimeMinutes },
                },
            },
        })
    }

    /**
     * Valida coherencia de los tiempos del SLA.
     */
    private static validateTimes(response: number, resolution: number): void {
        if (response < 0 || resolution < 0) {
            throw new Error("Los tiempos de SLA no pueden ser negativos.")
        }
        if (response > resolution) {
            throw new Error("El tiempo de respuesta no puede superar el tiempo de resolución.")
        }
    }
}
