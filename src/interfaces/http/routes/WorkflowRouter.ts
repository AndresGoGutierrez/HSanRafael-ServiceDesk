import type { Request, Response } from "express"
import { BaseRouter } from "../base/BaseRouter"
import { z } from "zod"

import type { WorkflowController } from "../../controllers/WorkflowController"
import type { BaseMiddleware } from "../middlewares/validate"
import type { AuthMiddleware } from "../middlewares/auth.middleware"
import { CreateWorkflowSchema } from "../../../application/dtos/workflow"

/**
 * Router for configuring workflows in areas.
 * Defines routes related to workflow management.
 */
export class WorkflowRouter extends BaseRouter<WorkflowController, BaseMiddleware> {
    constructor(
        controller: WorkflowController,
        middleware: BaseMiddleware,
        private readonly authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.registerRoutes()
    }

    /**
     * Records the routes associated with the Workflow.
     */
    protected registerRoutes(): void {
        const { authenticate, authorize } = this.authMiddleware

        // Reusable and clear validation for the route parameter :id
        const AreaIdParamSchema = z.object({
            id: z.string().uuid({ message: "El ID del área debe ser un UUID válido" }),
        })

        /**
         * @swagger
         * /areas/{id}/workflow:
         *   put:
         *     summary: Configura el workflow de un área
         *     description: >
         *       Define las transiciones permitidas entre estados de tickets
         *       y los campos requeridos para cada estado.  
         *       Crea un nuevo workflow (manteniendo el historial de versiones previas).
         *     tags: [Workflow]
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
         *               - transitions
         *             properties:
         *               transitions:
         *                 type: object
         *                 additionalProperties:
         *                   type: array
         *                   items:
         *                     type: string
         *                     enum: [OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED]
         *                 example:
         *                   OPEN: [IN_PROGRESS]
         *                   IN_PROGRESS: [PENDING, RESOLVED]
         *                   PENDING: [IN_PROGRESS, RESOLVED]
         *                   RESOLVED: [CLOSED]
         *                   CLOSED: []
         *               requiredFields:
         *                 type: object
         *                 additionalProperties:
         *                   type: array
         *                   items:
         *                     type: string
         *                 example:
         *                   RESOLVED: [resolutionSummary]
         *                   CLOSED: [resolutionSummary]
         *     responses:
         *       200:
         *         description: Workflow configurado correctamente
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
         *                   $ref: '#/components/schemas/Workflow'
         *       400:
         *         description: Datos inválidos
         *       401:
         *         description: No autenticado
         *       403:
         *         description: No autorizado
         */
        this.router.put(
            "/areas/:id/workflow",
            authenticate,
            authorize("ADMIN", "AGENT"), 
            this.middleware.validate("params", AreaIdParamSchema),
            this.middleware.validate("body", CreateWorkflowSchema),
            (req: Request, res: Response) => this.controller.configureWorkflow(req, res),
        )
    }
}
