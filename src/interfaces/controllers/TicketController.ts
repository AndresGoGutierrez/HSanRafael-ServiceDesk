import { Request, Response } from 'express';
import { CreateTicket } from '../../application/use-cases/CreateTicket';
import { CreateTicketSchema } from '../../application/dtos/ticket';
import z from 'zod';

export class TicketController {
    private readonly createTicket: CreateTicket;

    constructor(createTicket: CreateTicket) {
        this.createTicket = createTicket;
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

    async list (req: Request, res: Response): Promise<unknown> {
        return res.status(501).json({ message: "Not implemented" })
    }
}
