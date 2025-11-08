import type { Request, Response } from "express"
import type { AreaController } from "../../controllers/AreaController"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import { CreateAreaSchema, UpdateAreaSchema, UpdateSLASchema } from "../../../application/dtos/area"
import { z } from "zod"

export class AreaRouter extends BaseRouter<AreaController, BaseMiddleware> {
    constructor(controller: AreaController, middleware: BaseMiddleware) {
        super(controller, middleware)
        this.routes()
    }

    protected routes(): void {
        const IdParamSchema = z.object({ id: z.string().uuid() })

        /**
         * @swagger
         * /areas:
         *   get:
         *     summary: Lista todas las áreas
         *     tags: [Areas]
         *     responses:
         *       200:
         *         description: Lista de áreas
         */
        this.router.get("/", (req: Request, res: Response) => this.controller.list(req, res))

        /**
         * @swagger
         * /areas:
         *   post:
         *     summary: Crea una nueva área
         *     tags: [Areas]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CreateArea'
         *     responses:
         *       201:
         *         description: Área creada correctamente
         */
        this.router.post(
            "/",
            this.middleware.validate("body", CreateAreaSchema),
            (req: Request, res: Response) => this.controller.create(req, res),
        )

        /**
         * @swagger
         * /areas/{id}:
         *   put:
         *     summary: Actualiza una área existente
         *     tags: [Areas]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *     responses:
         *       200:
         *         description: Área actualizada correctamente
         */
        this.router.put(
            "/:id",
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", UpdateAreaSchema),
            (req: Request, res: Response) => this.controller.update(req, res),
        )

        /**
         * @swagger
         * /areas/{id}/sla:
         *   put:
         *     summary: Configura el SLA de un área
         *     tags: [Areas]
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/UpdateSLA'
         *     responses:
         *       200:
         *         description: SLA actualizado correctamente
         */
        this.router.put(
            "/:id/sla",
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", UpdateSLASchema),
            (req: Request, res: Response) => this.controller.updateSLA(req, res),
        )
    }
}
