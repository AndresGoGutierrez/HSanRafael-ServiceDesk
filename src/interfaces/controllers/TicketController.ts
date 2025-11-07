import { Request, Response } from 'express';
import { CreateTicket } from '../../application/use-cases/CreateTicket';
import { ListTickets } from '../../application/use-cases/ListTicket';
import { CreateTicketSchema } from '../../application/dtos/ticket';
import z from 'zod';

export class TicketController {
    private readonly createTicket: CreateTicket;
    private readonly listTicket: ListTickets;

    constructor(createTicket: CreateTicket, listTickets: ListTickets) {
        this.createTicket = createTicket
        this.listTicket = listTickets
    }

    async create(req: Request, res: Response): Promise<unknown> {
        const parsed = CreateTicketSchema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                errors: z.treeifyError(parsed.error)
            });
        }

        const ticket = await this.createTicket.execute(parsed.data);
        res.status(201).json(ticket);
    }

    async list(req: Request, res: Response): Promise<unknown> {
        try {
            const tickets = await this.listTicket.execute()
            return res.status(200).json(tickets)
        } catch (error) {
            console.error("[TicketController] Error in list:", error)
            return res.status(500).json({
                error: error instanceof Error ? error.message : "Unknown error",
            })
        }
    }
}
