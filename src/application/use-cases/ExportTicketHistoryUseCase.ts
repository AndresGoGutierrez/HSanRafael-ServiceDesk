import type { TicketRepository } from "../ports/TicketRepository"
import type { CommentRepository } from "../ports/CommentRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { AttachmentRepository } from "../ports/AttachmentRepository"
import { TicketId } from "../../domain/value-objects/TicketId"

export type ExportFormat = "pdf" | "json"

/**
 * Representa la estructura completa de exportación del historial de un ticket.
 */
export interface TicketHistoryExport {
    ticket: {
        id: string
        title: string
        description: string
        status: string
        priority: string
        areaId: string
        requesterId: string
        assigneeId: string | null
        createdAt: Date
        updatedAt: Date
        closedAt?: Date | null
        resolvedAt?: Date | null
        firstResponseAt?: Date | null
        slaBreached?: boolean
        slaTargetAt?: Date | null
        resolutionSummary?: string | null
    }
    comments: {
        id: string
        body: string
        authorId: string
        isInternal: boolean
        createdAt: Date
    }[]
    auditLogs: {
        id: string
        action: string
        actorId: string
        changes: Record<string, unknown>
        occurredAt: Date
    }[]
    attachments: {
        id: string
        filename: string
        contentType: string
        size: number
        url: string
        uploaderId: string
        createdAt: Date
    }[]
}

/**
 * Caso de uso: Exportar el historial completo de un ticket.
 *
 * - Recopila toda la información relacionada (comentarios, auditorías, adjuntos).
 * - Asegura consistencia y tipado fuerte.
 * - Devuelve los datos listos para exportar a PDF o JSON.
 */
export class ExportTicketHistoryUseCase {
    constructor(
        private readonly ticketRepository: TicketRepository,
        private readonly commentRepository: CommentRepository,
        private readonly auditRepository: AuditRepository,
        private readonly attachmentRepository: AttachmentRepository,
    ) { }

    async execute(ticketId: string, format: ExportFormat = "json"): Promise<TicketHistoryExport> {
        const ticket = await this.ticketRepository.findById(TicketId.from(ticketId))

        if (!ticket) {
            throw new Error("Ticket not found")
        }

        // Obtener información relacionada en paralelo para mayor eficiencia
        const [comments, auditLogs, attachments] = await Promise.all([
            this.commentRepository.findByTicketId(ticketId),
            this.auditRepository.findByTicketId(ticketId),
            this.attachmentRepository.findByTicketId(ticketId),
        ])

        // Construir respuesta tipada
        return {
            ticket: {
                id: ticket.id.toString(),
                title: ticket.title,
                description: ticket.description,
                status: ticket.status,
                priority: ticket.priority,
                areaId: ticket.areaId.toString(),
                requesterId: ticket.requesterId.toString(),
                assigneeId: ticket.assigneeId?.toString() || null,
                createdAt: ticket.createdAt,
                updatedAt: (ticket as any).updatedAt ?? ticket.createdAt,
                closedAt: ticket.closedAt,
                resolvedAt: ticket.resolvedAt,
                firstResponseAt: ticket.firstResponseAt,
                slaBreached: ticket.slaBreached,
                slaTargetAt: ticket.slaTargetAt,
                resolutionSummary: ticket.resolutionSummary,
            },
            comments: comments.map((c) => ({
                id: c.id.toString(),
                body: c.body,
                authorId: c.authorId.toString(),
                isInternal: c.isInternal,
                createdAt: c.createdAt,
            })),
            auditLogs: auditLogs.map((a) => ({
                id: a.id.toString(),
                action: a.action,
                actorId: a.actorId.toString(),
                changes: a.changes ?? {},
                occurredAt: a.occurredAt ?? (ticket as any).updatedAt ?? ticket.createdAt,
            })),
            attachments: attachments.map((f) => ({
                id: f.id.toString(),
                filename: f.filename,
                contentType: f.contentType,
                size: f.size,
                url: f.url,
                uploaderId: f.uploaderId.toString(),
                createdAt: f.createdAt,
            })),
        }
    }
}
