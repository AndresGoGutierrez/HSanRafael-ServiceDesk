import { Router, type Request, type Response } from "express"
import type { AuthController } from "../../controllers/AuthController"

/**
 * HTTP router responsible for exposing authentication endpoints.
 *
 * Acts as an entry point for operations related to login and JWT authentication.
 * Its responsibility is purely transport (infrastructure).
 */
export class AuthRouter {
    private readonly router: Router

    constructor(private readonly controller: AuthController) {
        this.router = Router()
        this.initializeRoutes()
    }

    /**
     * Initializes authentication paths.
     */
    private initializeRoutes(): void {
        /**
         * @swagger
         * /auth/login:
         *   post:
         *     summary: Autentica a un usuario y genera un token JWT
         *     description: >
         *       Inicia sesión en el sistema mediante las credenciales del usuario.  
         *       Si la autenticación es exitosa, devuelve un **token JWT** que debe incluirse en el encabezado  
         *       `Authorization: Bearer <token>` para acceder a los endpoints protegidos.
         *     tags: [Authentication]
         *     requestBody:
         *       required: true
         *       content:
         *         application/x-www-form-urlencoded:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - password
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *                 description: Correo electrónico del usuario registrado
         *                 example: ""     # evita que Swagger ponga "string"
         *               password:
         *                 type: string
         *                 format: password
         *                 description: Contraseña asociada a la cuenta del usuario
         *                 example: ""     # campo vacío por defecto
         *     responses:
         *       200:
         *         description: Autenticación exitosa
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 accessToken:
         *                   type: string
         *                   description: Token JWT generado
         *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
         *                 user:
         *                   type: object
         *                   description: Información básica del usuario autenticado
         *                   properties:
         *                     id:
         *                       type: string
         *                       format: uuid
         *                       example: "a5b6e8f2-74a3-47cf-97c2-59dcf013a1f2"
         *                     name:
         *                       type: string
         *                       example: "Andrés Gómez"
         *                     email:
         *                       type: string
         *                       example: "andres.gomez@example.com"
         *                     role:
         *                       type: string
         *                       enum: ["REQUESTER", "AGENT", "TECH", "ADMIN"]
         *                       example: "ADMIN"
         *       400:
         *         description: Solicitud inválida o campos faltantes
         *       401:
         *         description: Credenciales incorrectas
         */
        this.router.post(
            "/login",
            this.safeHandler((req, res) => this.controller.login(req, res)),
        )
    }

    /**
     * Returns the router configured to be mounted in the application.
     */
    public getRouter(): Router {
        return this.router
    }

    /**
     * Secure wrapper for centralized error handling.
     * Prevents crashes due to unhandled exceptions.
     */
    private safeHandler(
        handler: (req: Request, res: Response) => Promise<void> | void,
    ) {
        return async (req: Request, res: Response): Promise<void> => {
            try {
                await handler(req, res)
            } catch (error) {
                console.error("[AuthRouter] Unhandled error:", error)
                res.status(500).json({
                    success: false,
                    error: error instanceof Error ? error.message : "Internal server error",
                })
            }
        }
    }
}
