import { BaseEntity } from "./BaseEntity"

/**
 * Value Object que representa el identificador único de un Attachment.
 */
export class AttachmentId {
    private constructor(private readonly value: string) { }

    /**
     * Crea un nuevo identificador UUID.
     */
    static new(): AttachmentId {
        return new AttachmentId(crypto.randomUUID())
    }

    /**
     * Reconstruye un identificador existente desde un string.
     */
    static from(value: string): AttachmentId {
        if (!value || typeof value !== "string") {
            throw new Error("Invalid AttachmentId: value must be a non-empty string")
        }
        return new AttachmentId(value)
    }

    /**
     * Retorna el identificador en formato string.
     */
    toString(): string {
        return this.value
    }

    /**
     * Verifica igualdad entre dos AttachmentId.
     */
    equals(other: AttachmentId): boolean {
        return this.value === other.value
    }
}

/**
 * Datos necesarios para crear un nuevo Attachment desde una solicitud o comando.
 */
export interface CreateAttachmentInput {
    ticketId: string
    uploaderId: string
    filename: string
    contentType: string
    size: number
    url: string
}

/**
 * DTO utilizado para rehidratar un Attachment desde la persistencia.
 */
export interface RehydrateAttachmentDto {
    id: string
    ticketId: string
    uploaderId: string
    filename: string
    contentType: string
    size: number
    url: string
    createdAt: Date | string
}

/**
 * Entidad de dominio que representa un adjunto (Attachment).
 */
export class Attachment extends BaseEntity<AttachmentId> {

    public deletedAt: Date | null = null

    private constructor(
        id: AttachmentId,
        public readonly ticketId: string,
        public readonly uploaderId: string,
        public readonly filename: string,
        public readonly contentType: string,
        public readonly size: number,
        public readonly url: string,
        createdAt: Date,
    ) {
        super(id, createdAt)
    }

    /**
     * Fábrica de dominio para crear un nuevo Attachment.
     * Registra un evento de dominio al ser creado.
     */
    static create(dto: CreateAttachmentInput, now: Date = new Date()): Attachment {
        const attachment = new Attachment(
            AttachmentId.new(),
            dto.ticketId,
            dto.uploaderId,
            dto.filename,
            dto.contentType,
            dto.size,
            dto.url,
            now,
        )

        attachment.recordEvent({
            type: "AttachmentCreated",
            occurredAt: now,
            payload: {
                id: attachment.id.toString(),
                ticketId: attachment.ticketId,
                filename: attachment.filename,
                uploaderId: attachment.uploaderId,
            },
        })

        return attachment
    }

    /**
     * Restaura un Attachment existente desde la base de datos o un DTO persistido.
     */
    static rehydrate(dto: RehydrateAttachmentDto): Attachment {
        return new Attachment(
            AttachmentId.from(dto.id),
            dto.ticketId,
            dto.uploaderId,
            dto.filename,
            dto.contentType,
            dto.size,
            dto.url,
            dto.createdAt instanceof Date ? dto.createdAt : new Date(dto.createdAt),
        )
    }

    /**
     * Marca el adjunto como eliminado lógicamente.
     * Registra un evento de dominio que indica su eliminación.
     */
    public markAsDeleted(now: Date): void {
        this.deletedAt = now

        this.recordEvent({
            type: "AttachmentDeleted",
            occurredAt: now,
            payload: { attachmentId: this.id.toString() },
        })
    }
}
