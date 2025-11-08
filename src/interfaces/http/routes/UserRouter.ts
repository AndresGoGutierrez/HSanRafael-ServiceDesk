import { type Request, type Response } from "express"
import { BaseRouter } from "../base/BaseRouter"
import type { UserController } from "../../controllers/UserController"
import type { BaseMiddleware } from "../middlewares/validate"
import { CreateUserSchema, UpdateUserSchema } from "../../../application/dtos/user"

/**
 * Router encargado de manejar las rutas relacionadas con usuarios.
 * 
 * - Aplica validaciones a nivel de infraestructura (no de dominio).
 * - Delegación completa de lógica al controlador.
 * - Compatible con los principios de Clean Architecture.
 */
export class UserRouter extends BaseRouter<UserController, BaseMiddleware> {
    constructor(controller: UserController, middleware: BaseMiddleware) {
        super(controller, middleware)
        this.routes() 
    }

    /**
     * Define las rutas públicas para la gestión de usuarios.
     */
    protected routes(): void {
        /**
         * @swagger
         * /users:
         *   post:
         *     summary: Create a new user
         *     tags: [Users]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             $ref: '#/components/schemas/CreateUser'
         *     responses:
         *       201:
         *         description: User created successfully
         *       400:
         *         description: Validation error
         */
        this.router.post(
            "/",
            this.middleware.validate("body", CreateUserSchema),
            this.safeHandler((req, res) => this.controller.create(req, res)),
        )

        /**
         * @swagger
         * /users/{id}:
         *   put:
         *     summary: Update user information
         *     tags: [Users]
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
         *             $ref: '#/components/schemas/UpdateUser'
         *     responses:
         *       200:
         *         description: User updated successfully
         *       400:
         *         description: Validation error
         *       404:
         *         description: User not found
         */
        this.router.put(
            "/:id",
            this.middleware.validate("body", UpdateUserSchema),
            this.safeHandler((req, res) => this.controller.update(req, res)),
        )

        /**
         * @swagger
         * /users:
         *   get:
         *     summary: List all users
         *     tags: [Users]
         *     responses:
         *       200:
         *         description: List of users
         */
        this.router.get(
            "/",
            this.safeHandler((req, res) => this.controller.list(req, res)),
        )
    }

    /**
     * Envuelve controladores en un try/catch centralizado
     * para evitar caídas del servidor ante errores inesperados.
     */
    private safeHandler(
        handler: (req: Request, res: Response) => Promise<void> | void,
    ) {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                await handler(req, res)
            } catch (error) {
                console.error("[UserRouter] Unhandled error:", error)
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Internal server error",
                })
            }
        }
    }
}
