import type { Request, Response } from "express"
import type { CreateTicket } from "../../application/use-cases/CreateTicket"
import type { ListTickets } from "../../application/use-cases/ListTicket"
import type { GetTicketById } from "../../application/use-cases/GetTicketById"
import type { AssignTicket } from "../../application/use-cases/AssignTicket"
import type { TransitionTicketStatus } from "../../application/use-cases/TransitionTicketStatus"
import {
    CreateTicketSchema,
    AssignTicketSchema,
    TransitionTicketSchema,
} from "../../application/dtos/ticket"
import { TicketMapper } from "../mappers/TicketMapper"
import { ZodError } from "zod"
import { CloseTicket } from "../../application/use-cases/CloseTicket"
import { ExportFormat, ExportTicketHistoryUseCase } from "../../application/use-cases/ExportTicketHistoryUseCase"
import PDFDocument from "pdfkit"

/**
 * HTTP Ticket Controller
 *
 * Only orchestrates use cases and maps entities to HTTP responses.
 * Does not contain business logic.
 * Handles errors, validation, and conversion of entities → DTOs.
 */
export class TicketController {
    constructor(
        private readonly createTicket: CreateTicket,
        private readonly listTickets: ListTickets,
        private readonly getTicketById: GetTicketById,
        private readonly assignTicket: AssignTicket,
        private readonly transitionTicketStatus: TransitionTicketStatus,
        private readonly closeTicketUseCase: CloseTicket,
        private readonly exportTicketHistoryUseCase?: ExportTicketHistoryUseCase,
    ) { }

    // ──────────────────────────────
    // Control methods
    // ──────────────────────────────

    async create(req: Request, res: Response): Promise<void> {
        try {
            const parsed = CreateTicketSchema.parse(req.body)
            const ticket = await this.createTicket.execute(parsed)
            res.status(201).json({
                success: true,
                message: "Ticket creado exitosamente",
                data: TicketMapper.toHttp(ticket),
            })
        } catch (error) {
            this.handleError(res, error, "Error al crear el ticket")
        }
    }

    async list(_: Request, res: Response): Promise<void> {
        try {
            const tickets = await this.listTickets.execute()
            res.status(200).json({
                success: true,
                data: tickets.map(TicketMapper.toHttp),
            })
        } catch (error) {
            this.handleError(res, error, "Error al listar los tickets")
        }
    }

    async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const ticket = await this.getTicketById.execute(id)

            if (!ticket) {
                res.status(404).json({ success: false, error: "Ticket no encontrado" })
                return
            }

            res.status(200).json({
                success: true,
                data: TicketMapper.toHttp(ticket),
            })
        } catch (error) {
            this.handleError(res, error, "Error al obtener el ticket")
        }
    }

    async assign(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const parsed = AssignTicketSchema.parse(req.body)

            await this.assignTicket.execute(id, parsed)
            res.status(200).json({
                success: true,
                message: "Ticket asignado exitosamente",
            })
        } catch (error) {
            this.handleError(res, error, "Error al asignar el ticket")
        }
    }

    async transition(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const parsed = TransitionTicketSchema.parse(req.body)

            await this.transitionTicketStatus.execute(id, parsed)
            res.status(200).json({
                success: true,
                message: "Estado del ticket actualizado correctamente",
            })
        } catch (error) {
            this.handleError(res, error, "Error al cambiar el estado del ticket")
        }
    }

    async close(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params
            const { resolutionSummary, notifyRequester } = req.body
            const actorId = (req as any).user?.userId

            if (!actorId) {
                res.status(401).json({
                    success: false,
                    error: "No se encontró el usuario autenticado",
                })
                return
            }

            await this.closeTicketUseCase.execute({
                ticketId: id,
                resolutionSummary,
                notifyRequester,
                actorId,
            })

            res.status(200).json({
                success: true,
                message: "Ticket cerrado exitosamente",
            })
        } catch (error) {
            this.handleError(res, error, "Error al cerrar el ticket")
        }
    }

    /** Exports the history of a ticket. (GET /tickets/:id/export) */
    async exportHistory(req: Request, res: Response): Promise<void> {
        try {
            if (!this.exportTicketHistoryUseCase) {
                res.status(501).json({
                    success: false,
                    error: "Feature not implemented",
                })
                return
            }

            const { id: ticketId } = req.params
            const format = (req.query.format as "json" | "pdf") || "json"

            const historyExport = await this.exportTicketHistoryUseCase.execute(ticketId, format)

            // === JSON EXPORT ===
            if (format === "json") {
                res.status(200).json({
                    success: true,
                    message: "Historial exportado correctamente",
                    data: historyExport,
                })
                return
            }

            // === PDF EXPORT ===
            if (format === "pdf") {
                // Import pdfkit correctly above:
                // import PDFDocument from “pdfkit”

                const doc = new PDFDocument({ margin: 50 })

                res.setHeader("Content-Type", "application/pdf")
                res.setHeader(
                    "Content-Disposition",
                    `attachment; filename="ticket-${ticketId}.pdf"`
                )

                // Secure piping
                doc.pipe(res)

                const { ticket, comments, auditLogs, attachments } = historyExport

                // === HEADER ===
                doc
                    .fontSize(20)
                    .fillColor("#333")
                    .fillOpacity(0.85)
                    .text("Reporte de Ticket", { align: "center" })
                    .fillOpacity(1)
                    .moveDown()

                // === TICKET INFORMATION ===
                doc.fontSize(14).text(`ID: ${ticket.id}`)
                doc.text(`Título: ${ticket.title}`)
                doc.text(`Descripción: ${ticket.description}`)
                doc.text(`Estado: ${ticket.status}`)
                doc.text(`Prioridad: ${ticket.priority}`)
                doc.text(`Área: ${ticket.areaId}`)
                doc.text(`Solicitante: ${ticket.requesterId}`)
                doc.text(`Fecha de creación: ${new Date(ticket.createdAt).toLocaleString()}`)
                doc.moveDown(1.5)

                // === COMMENTS ===
                doc.fontSize(16).text("Comentarios", { underline: true }).moveDown(0.5)
                if (!comments?.length) {
                    doc.fontSize(12).text("No hay comentarios registrados.")
                } else {
                    comments.forEach((c, i) => {
                        doc.fontSize(12).text(`${i + 1}. ${c.body}`)
                        doc.fontSize(10).text(
                            `Autor: ${c.authorId} | Interno: ${c.isInternal ? "Sí" : "No"} | Fecha: ${new Date(c.createdAt).toLocaleString()}`
                        )
                        doc.moveDown(0.5)
                    })
                }
                doc.moveDown(1.5)

                // === AUDIT HISTORY ===
                doc.fontSize(16).text("Historial de Auditoría", { underline: true }).moveDown(0.5)
                if (!auditLogs?.length) {
                    doc.fontSize(12).text("No hay registros de auditoría.")
                } else {
                    auditLogs.forEach((log, i) => {
                        doc.fontSize(12).text(`${i + 1}. Acción: ${log.action}`)
                        doc.fontSize(10).text(
                            `Actor: ${log.actorId} | Fecha: ${new Date(log.occurredAt).toLocaleString()}`
                        )
                        doc.fontSize(10).text(`Cambios: ${JSON.stringify(log.changes, null, 2)}`)
                        doc.moveDown(0.5)
                    })
                }
                doc.moveDown(1.5)

                // === ATTACHMENTS ===
                if (attachments?.length > 0) {
                    doc.fontSize(16).text("Adjuntos", { underline: true }).moveDown(0.5)
                    attachments.forEach((att, i) => {
                        doc.fontSize(12).text(`${i + 1}. ${att.filename} (${att.url || "sin URL"})`)
                    })
                    doc.moveDown(1.5)
                }

                // === FOOTER ===
                doc
                    .moveDown(2)
                    .fontSize(10)
                    .fillColor("#666")
                    .text("Reporte generado automáticamente por el sistema de tickets.", {
                        align: "center",
                    })

                doc.end()
                return
            }

            res.status(400).json({
                success: false,
                error: `Formato "${format}" no soportado`,
            })
        } catch (error) {
            this.handleError(res, error, "Error al exportar historial")
        }
    }



    // ──────────────────────────────
    // Private utility method
    // ──────────────────────────────
    private handleError(res: Response, error: unknown, defaultMessage: string): void {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                errors: error.flatten(),
            })
            return
        }

        res.status(400).json({
            success: false,
            error: error instanceof Error ? error.message : defaultMessage,
        })
    }
}
