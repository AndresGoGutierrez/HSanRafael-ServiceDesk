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

/**
 * Controlador HTTP de Tickets
 *
 * 👉 Solo orquesta casos de uso y mapea entidades a respuestas HTTP.
 * ❌ No contiene lógica de negocio.
 * ✅ Maneja errores, validación y conversión de entidades → DTOs.
 */
export class TicketController {
    constructor(
        private readonly createTicket: CreateTicket,
        private readonly listTickets: ListTickets,
        private readonly getTicketById: GetTicketById,
        private readonly assignTicket: AssignTicket,
        private readonly transitionTicketStatus: TransitionTicketStatus,
    ) { }

    // ──────────────────────────────
    // Métodos de control
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

    // ──────────────────────────────
    // Método utilitario privado
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
