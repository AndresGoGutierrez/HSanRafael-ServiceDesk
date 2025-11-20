import { type Request, type Response } from "express"
import { BaseRouter } from "../base/BaseRouter"
import type { UserController } from "../../controllers/UserController"
import type { BaseMiddleware } from "../middlewares/validate"
import { CreateUserSchema, UpdateUserSchema, DeactivateUserSchema } from "../../../application/dtos/user"
import type { AuthMiddleware } from "../middlewares/auth.middleware"

/**
 * Router responsible for handling user-related routes.
 * 
 * - Applies validations at the infrastructure level (not the domain level).
 * - Complete delegation of logic to the controller.
 * - Compatible with Clean Architecture principles.
 */
export class UserRouter extends BaseRouter<UserController, BaseMiddleware> {
    constructor(
        controller: UserController,
        middleware: BaseMiddleware,
        private authMiddleware: AuthMiddleware,
    ) {
        super(controller, middleware)
        this.routes()
    }

    /**
     * Defines public routes for user management.
     */
    protected routes(): void {
        const { authenticate, authorize } = this.authMiddleware
        /**
         * @swagger
         * /users:
         *   post:
         *     summary: Crea un nuevo usuario
         *     description: >
         *       Crea un nuevo usuario dentro del sistema.  
         *       - El campo **areaId** es **obligatorio** para los roles `REQUESTER`, `AGENT` y `TECH`.  
         *       - El campo **areaId** es **opcional** para el rol `ADMIN`.  
         *       - Solo los administradores autenticados pueden crear nuevos usuarios.
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/x-www-form-urlencoded:
         *           schema:
         *             type: object
         *             required:
         *               - name
         *               - email
         *               - password
         *               - role
         *             properties:
         *               name:
         *                 type: string
         *                 description: Nombre completo del usuario
         *                 example: ""        # campo vacío por defecto (evita "string")
         *               email:
         *                 type: string
         *                 format: email
         *                 description: Correo electrónico del usuario
         *                 example: ""
         *               password:
         *                 type: string
         *                 format: password
         *                 description: Contraseña segura del usuario
         *                 example: ""
         *               role:
         *                 type: string
         *                 enum: ["REQUESTER", "AGENT", "TECH", "ADMIN"]
         *                 description: Rol del usuario dentro del sistema
         *                 default: "REQUESTER"   # elimina la opción vacía en Swagger
         *               areaId:
         *                 type: string
         *                 format: uuid
         *                 nullable: true
         *                 description: >
         *                   ID del área a la que pertenece el usuario.  
         *                   - Requerido si el rol es `REQUESTER`, `AGENT` o `TECH`.  
         *                   - Opcional si el rol es `ADMIN`.
         *                 example: ""   # sin valor por defecto
         *     responses:
         *       201:
         *         description: Usuario creado correctamente
         *       400:
         *         description: Error de validación o datos incompletos
         *       401:
         *         description: No autenticado
         *       403:
         *         description: No autorizado para realizar esta acción
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
            authenticate,
            authorize("ADMIN", "AGENT"),
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
            authenticate,
            this.safeHandler((req, res) => this.controller.list(req, res)),
        )

        /**
         * @swagger
         * /users/{id}/deactivate:
         *   patch:
         *     summary: Desactiva un usuario existente
         *     description: >
         *       Permite **desactivar** un usuario sin eliminar su registro del sistema.  
         *       - Solo los usuarios con rol **ADMIN** pueden realizar esta acción.  
         *       - La desactivación puede incluir una **razón opcional**, registrada para fines administrativos o de auditoría.
         *     tags: [Users]
         *     security:
         *       - bearerAuth: []     # requiere autenticación con token JWT
         *     parameters:
         *       - in: path
         *         name: Id Usuario
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: Identificador único del usuario a desactivar
         *     requestBody:
         *       required: false
         *       content:
         *         application/x-www-form-urlencoded:
         *           schema:
         *             type: object
         *             properties:
         *               reason:
         *                 type: string
         *                 description: >
         *                   Razón por la cual se desactiva al usuario (opcional).
         *                 example: ""        # ← deja el campo vacío en Swagger UI
         *     responses:
         *       200:
         *         description: Usuario desactivado correctamente
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 id:
         *                   type: string
         *                   format: uuid
         *                   example: "a3b5e0d1-7e12-4c23-9a8a-512ae9e71234"
         *                 status:
         *                   type: string
         *                   example: "INACTIVE"
         *                 deactivatedAt:
         *                   type: string
         *                   format: date-time
         *                   example: "2025-11-08T15:32:00Z"
         *                 reason:
         *                   type: string
         *                   example: "Inactividad prolongada del empleado"
         *       400:
         *         description: Error de validación o usuario no encontrado
         *       401:
         *         description: No autenticado
         *       403:
         *         description: No autorizado para realizar esta acción
         */
        this.router.patch(
            "/:id/deactivate",
            authenticate,
            authorize("ADMIN"),
            this.middleware.validate("body", DeactivateUserSchema),
            this.safeHandler((req, res) => this.controller.deactivate(req, res)),
        )
    }

    /**
     * Wraps controllers in a centralized try/catch block
     * to prevent server crashes in the event of unexpected errors.
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
