import type { Request, Response } from "express"
import type { AreaController } from "../../controllers/AreaController"
import type { BaseMiddleware } from "../middlewares/validate"
import { BaseRouter } from "../base/BaseRouter"
import { CreateAreaSchema, UpdateAreaSchema, UpdateSLASchema, DeactivateAreaSchema, WorkflowConfigSchema } from "../../../application/dtos/area"
import type { AuthMiddleware } from "../middlewares/auth.middleware"
import { z } from "zod"

export class AreaRouter extends BaseRouter<AreaController, BaseMiddleware> {
    constructor(
        controller: AreaController,
        middleware: BaseMiddleware,
        private authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.routes()
    }

    protected routes(): void {
        const { authenticate, authorize } = this.authMiddleware
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
        this.router.get(
            "/",
            authenticate,
            (req: Request, res: Response) =>
                this.controller.list(req, res))

        /**
         * @swagger
         * /areas:
         *   post:
         *     summary: Crea una nueva área dentro del sistema
         *     description: >
         *       Permite registrar una nueva **área** a la cual se podrán asignar usuarios y tickets.  
         *       Solo los usuarios con rol **ADMIN** autenticados pueden crear nuevas áreas.
         *     tags: [Areas]
         *     security:
         *       - bearerAuth: []    # requiere token JWT válido
         *     requestBody:
         *       required: true
         *       content:
         *         application/x-www-form-urlencoded:
         *           schema:
         *             type: object
         *             required:
         *               - name
         *             properties:
         *               name:
         *                 type: string
         *                 description: Nombre del área (debe ser único)
         *                 example: ""     # evita que Swagger ponga "string"
         *               description:
         *                 type: string
         *                 description: Descripción breve del área
         *                 example: ""     # campo opcional, sin valor por defecto
         *     responses:
         *       201:
         *         description: Área creada correctamente
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                   format: uuid
         *                   description: Identificador único del área creada
         *                   example: "c0a8012e-0d22-4b6e-8df7-9329f8a013f1"
         *                 name:
         *                   type: string
         *                   example: "Radiología"
         *                 description:
         *                   type: string
         *                   example: "Área encargada de estudios por imágenes médicas"
         *       400:
         *         description: Datos inválidos o nombre duplicado
         *       401:
         *         description: No autenticado (falta token JWT)
         *       403:
         *         description: No autorizado (solo los administradores pueden crear áreas)
         */
        this.router.post(
            "/",
            authenticate,
            authorize("ADMIN"),
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
            authenticate,
            authorize("ADMIN"),
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
            authenticate,
            authorize("ADMIN", "AGENT"),
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", UpdateSLASchema),
            (req: Request, res: Response) => this.controller.updateSLA(req, res),
        )

        /**
     * @swagger
     * /areas/{id}/deactivate:
     *   patch:
     *     summary: Desactiva un área existente
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
     *             type: object
     *             properties:
     *               reason:
     *                 type: string
     *                 description: Motivo de la desactivación
     *                 example: "Área sin operaciones activas"
     *     responses:
     *       200:
     *         description: Área desactivada correctamente
     */
        this.router.patch(
            "/:id/deactivate",
            authenticate,
            authorize("ADMIN"),
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", DeactivateAreaSchema),
            (req: Request, res: Response) => this.controller.deactivate(req, res),
        )
        /**
         * @swagger
         * /areas/{id}/workflow:
         *   put:
         *     summary: Configura el flujo de trabajo (workflow) de un área
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
         *             $ref: '#/components/schemas/WorkflowConfig'
         *     responses:
         *       200:
         *         description: Workflow configurado correctamente
         */
        this.router.put(
            "/:id/workflow",
            authenticate,
            authorize("ADMIN", "AGENT"),
            this.middleware.validate("params", IdParamSchema),
            this.middleware.validate("body", WorkflowConfigSchema),
            (req: Request, res: Response) => this.controller.configureWorkflow(req, res),
        )
    }
}
