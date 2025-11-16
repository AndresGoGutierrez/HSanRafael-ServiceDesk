import type { Request, Response } from "express"
import type { SLAController } from "../../controllers/SLAController"
import type { BaseMiddleware } from "../middlewares/validate"
import type { AuthMiddleware } from "../middlewares/auth.middleware"
import { BaseRouter } from "../base/BaseRouter"
import { CreateSLASchema } from "../../../application/dtos/sla"
import { z } from "zod"

/**
 * HTTP router responsible for defining routes related to SLA management.
 *
 * Infrastructure layer (delivery) that connects HTTP routes with
 * the corresponding controllers and use cases.
 */
export class SLARouter extends BaseRouter<SLAController, BaseMiddleware> {
    constructor(
        controller: SLAController,
        middleware: BaseMiddleware,
        private readonly authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.registerRoutes()
    }

    /**
     * Defines the paths for the SLA module.
     */
    protected registerRoutes(): void {
        const { authenticate, authorize } = this.authMiddleware

        // Validation of route parameter with zod
        const AreaIdSchema = z.object({
            id: z.string().uuid({ message: "El parámetro 'id' debe ser un UUID válido" }),
        })

        /**
         * @swagger
         * /areas/{id}/sla:
         *   post:
         *     summary: Configura o actualiza el SLA de un área
         *     description: >
         *       Define los tiempos de respuesta y resolución para un área específica.  
         *       Si ya existe un SLA, se actualiza; de lo contrario, se crea uno nuevo.
         *     tags: [SLA]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: ID del área
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - responseTimeMinutes
         *               - resolutionTimeMinutes
         *             properties:
         *               responseTimeMinutes:
         *                 type: integer
         *                 minimum: 1
         *                 example: 30
         *                 description: Tiempo máximo de respuesta (en minutos)
         *               resolutionTimeMinutes:
         *                 type: integer
         *                 minimum: 1
         *                 example: 240
         *                 description: Tiempo máximo de resolución (en minutos)
         *     responses:
         *       200:
         *         description: SLA configurado correctamente
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 message:
         *                   type: string
         *                 data:
         *                   $ref: '#/components/schemas/SLA'
         *       400:
         *         description: Datos inválidos
         *       401:
         *         description: No autenticado
         *       403:
         *         description: No autorizado
         */
        this.router.post(
            "/areas/:id/sla",
            authenticate,
            authorize("ADMIN", "AGENT"),
            this.middleware.validate("params", AreaIdSchema),
            this.middleware.validate("body", CreateSLASchema),
            (req: Request, res: Response) => this.controller.configureSLA(req, res),
        )
    }
}
