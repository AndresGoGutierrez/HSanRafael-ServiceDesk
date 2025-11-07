import type { Request, Response } from "express"
import type { AreaController } from "../../controllers/AreaController"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import { CreateAreaSchema, UpdateAreaSchema, UpdateSLASchema } from "../../../application/dtos/area"
import { z } from "zod"

/**
 * Define y configura las rutas HTTP para el recurso `Area`.
 * Aplica validaciones de entrada usando esquemas Zod a través del `BaseMiddleware`.
 */
export class AreaRouter extends BaseRouter<AreaController, BaseMiddleware> {
    constructor(controller: AreaController, middleware: BaseMiddleware) {
        super(controller, middleware)
    }

    /** Registra las rutas y sus middlewares asociados. */
    protected routes(): void {
        const IdParamSchema = z.object({ id: z.string().uuid() })

        /**
         * Obtener todas las áreas
         * GET /areas
         */
        this.router.get("/", (req: Request, res: Response) =>
            this.controller.list(req, res)
        )

        /**
         * Crear una nueva área
         * POST /areas
         */
        this.router.post(
            "/",
            this.middleware.validate("body", CreateAreaSchema),
            (req: Request, res: Response) => this.controller.create(req, res)
        )

        /**
         * Actualizar una área existente
         * PUT /areas/:id
         */
        this.router.put(
            "/:id",
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", UpdateAreaSchema),
            (req: Request, res: Response) => this.controller.update(req, res)
        )

        /**
         * Configurar el SLA de un área
         * PUT /areas/:id/sla
         */
        this.router.put(
            "/:id/sla",
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", UpdateSLASchema),
            (req: Request, res: Response) => this.controller.updateSLA(req, res)
        )
    }
}
