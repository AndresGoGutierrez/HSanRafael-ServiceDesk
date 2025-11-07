import { BaseEntity } from "./BaseEntity"
import { UserId } from "../value-objects/UserId"

/**
 * Identificador único del registro de auditoría.
 */
export class AuditTrailId {
    private constructor(private readonly value: string) { }

    static new(): AuditTrailId {
        return new AuditTrailId(crypto.randomUUID())
    }

    static from(value: string): AuditTrailId {
        return new AuditTrailId(value)
    }

    toString(): string {
        return this.value
    }
}

export interface CreateAuditTrailInput {
    ticketId?: string
    actorId: UserId
    action: string
    entityType: string
    entityId: string
    changes?: Record<string, unknown>
    metadata?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
}

export interface RehydrateAuditTrailDto {
    id: string
    ticketId?: string | null
    actorId: string
    action: string
    entityType: string
    entityId: string
    changes?: Record<string, unknown> | null
    metadata?: Record<string, unknown> | null
    ipAddress?: string | null
    userAgent?: string | null
    createdAt: Date
}

/**
 * Entidad de dominio que representa una acción registrada en el sistema.
 */
export class AuditTrail extends BaseEntity<AuditTrailId> {
    public constructor(
        id: AuditTrailId,
        public readonly ticketId: string | null,
        public readonly actorId: UserId,
        public readonly action: string,
        public readonly entityType: string,
        public readonly entityId: string,
        public readonly changes: Record<string, unknown> | null,
        public readonly metadata: Record<string, unknown> | null,
        public readonly ipAddress: string | null,
        public readonly userAgent: string | null,
        createdAt: Date,
    ) {
        super(id, createdAt)
    }

    public static create(dto: CreateAuditTrailInput, now: Date): AuditTrail {
        const audit = new AuditTrail(
            AuditTrailId.new(),
            dto.ticketId ?? null,
            dto.actorId,
            dto.action,
            dto.entityType,
            dto.entityId,
            dto.changes ?? null,
            dto.metadata ?? null,
            dto.ipAddress ?? null,
            dto.userAgent ?? null,
            now,
        )

        audit.recordEvent({
            type: "audit.created",
            occurredAt: now,
            payload: {
                id: audit.id.toString(),
                actorId: audit.actorId.toString(),
                action: audit.action,
                entityType: audit.entityType,
            },
        })

        return audit
    }

    public static rehydrate(row: RehydrateAuditTrailDto): AuditTrail {
        return new AuditTrail(
            AuditTrailId.from(row.id),
            row.ticketId ?? null,
            UserId.from(row.actorId),
            row.action,
            row.entityType,
            row.entityId,
            row.changes ?? null,
            row.metadata ?? null,
            row.ipAddress ?? null,
            row.userAgent ?? null,
            new Date(row.createdAt),
        )
    }
}
