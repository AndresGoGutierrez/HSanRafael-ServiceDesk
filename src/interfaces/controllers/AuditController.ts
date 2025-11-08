import type { Request, Response } from "express"
import type { GetTicketAuditTrail } from "../../application/use-cases/GetTicketAuditTrail"

export class AuditController {
    constructor(private readonly getTicketAuditTrail: GetTicketAuditTrail) { }

    async getTicketAudit(req: Request, res: Response): Promise<void> {
        try {
            const { ticketId } = req.params
            const auditTrail = await this.getTicketAuditTrail.execute(ticketId)
            res.status(200).json(auditTrail)
        } catch (error) {
            if (error instanceof Error) {
                res.status(400).json({ error: error.message })
            } else {
                res.status(500).json({ error: "Internal server error" })
            }
        }
    }
}
