import { AreaId } from "../value-objects/AreaId";
import { BaseEntity } from "./BaseEntity";

export interface CreateAreaInput {
    name: string;
    description?: string;
    slaResolutionMinutes?: number; // opcional al crear el área
}

export interface RehydrateAreaDto {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string | Date;
    slaResolutionMinutes?: number; // opcional al restaurar desde persistencia
}

/**
 * Representa un área dentro del dominio.
 * Contiene información de SLA, estado y eventos de creación.
 */
export class Area extends BaseEntity<AreaId> {
    public name: string;
    public description: string | null;
    public isActive: boolean;
    public slaResolutionMinutes?: number; // <-- ahora parte del modelo

    private constructor(
        id: AreaId,
        name: string,
        description: string | null,
        isActive: boolean,
        createdAt: Date,
        slaResolutionMinutes?: number,
    ) {
        super(id, createdAt);
        this.name = name.trim();
        this.description = description;
        this.isActive = isActive;
        this.slaResolutionMinutes = slaResolutionMinutes;
    }

    /** Crea una nueva instancia de Area desde datos de entrada */
    public static create(dto: CreateAreaInput, now: Date): Area {
        if (!dto.name?.trim()) {
            throw new Error("El nombre del área no puede estar vacío.");
        }

        const area = new Area(
            AreaId.new(),
            dto.name.trim(),
            dto.description?.trim() || null,
            true,
            now,
            dto.slaResolutionMinutes ?? 60, // valor por defecto si no se especifica
        );

        area.recordEvent({
            type: "area.created",
            occurredAt: now,
            payload: {
                id: area.id.toString(),
                name: area.name,
                slaResolutionMinutes: area.slaResolutionMinutes,
            },
        });

        return area;
    }

    /** Restaura una entidad desde la persistencia */
    public static rehydrate(row: RehydrateAreaDto): Area {
        return new Area(
            AreaId.from(row.id),
            row.name,
            row.description,
            row.isActive,
            new Date(row.createdAt),
            row.slaResolutionMinutes,
        );
    }

    /** Desactiva el área (soft delete) */
    public deactivate(at: Date): void {
        if (!this.isActive) {
            throw new Error("Area is already deactivated");
        }

        this.isActive = false;

        this.recordEvent({
            type: "area.deactivated",
            occurredAt: at,
            payload: { id: this.id.toString() },
        });
    }

    /** Actualiza nombre, descripción o SLA */
    public update(name: string, description?: string, slaResolutionMinutes?: number): void {
        const trimmedName = name?.trim();
        if (!trimmedName) {
            throw new Error("El nombre del área no puede estar vacío.");
        }

        this.name = trimmedName;
        this.description = description?.trim() || null;
        if (slaResolutionMinutes !== undefined) {
            this.slaResolutionMinutes = slaResolutionMinutes;
        }

        this.recordEvent({
            type: "area.updated",
            occurredAt: new Date(),
            payload: {
                id: this.id.toString(),
                name: this.name,
                description: this.description,
                slaResolutionMinutes: this.slaResolutionMinutes,
            },
        });
    }
}
