import { Request, Response } from "express";
import { BaseMiddleware } from "../middlewares/validate";
import { BaseRouter } from "../base/BaseRouter";
import { TicketController } from "../../controllers/TicketController";
import { CreateTicketSchema } from "../../../application/dtos/ticket";

export class TicketsRouter extends BaseRouter<TicketController, BaseMiddleware> {
    constructor(controller: TicketController, middleware: BaseMiddleware) {
        super(controller, middleware);
    }
    protected routes(): void {
        this.router.post("/",
            this.middleware.validate("body", CreateTicketSchema),
            (req: Request, res: Response) => this.controller.create(
                req, res
            )
        )

        this.router.get("/", (req: Request, res: Response) => this.controller.list(req, res))

        // FALLLLLLLLLLLLLLLLLLLLLLLLLLLLTAAAAAAAAAAAAAA el ListTicket
    }
}