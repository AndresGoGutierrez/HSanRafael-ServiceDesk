import { BaseEntity } from "./BaseEntity"

/**
 * Value Object representing the unique identifier of an Attachment.
 */
export class AttachmentId {
    private constructor(private readonly value: string) { }

    /**
     * Creates a new UUID identifier.
     */
    static new(): AttachmentId {
        return new AttachmentId(crypto.randomUUID())
    }

    /**
     * Reconstructs an existing identifier from a string.
     */
    static from(value: string): AttachmentId {
        if (!value || typeof value !== "string") {
            throw new Error("Invalid AttachmentId: value must be a non-empty string")
        }
        return new AttachmentId(value)
    }

    /**
     * Returns the identifier in string format.
     */
    toString(): string {
        return this.value
    }

    /**
     * Checks for equality between two AttachmentIds.
     */
    equals(other: AttachmentId): boolean {
        return this.value === other.value
    }
}

/**
 * Data required to create a new Attachment from a request or command.
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
 * DTO used to rehydrate an Attachment from persistence.
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
 * Domain entity representing an attachment.
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
     * Domain factory for creating a new Attachment.
     * Registers a domain event when created.
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
     * Restores an existing Attachment from the database or a persisted DTO.
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
     * Marks the attachment as logically deleted.
     * Records a domain event indicating its deletion.
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
