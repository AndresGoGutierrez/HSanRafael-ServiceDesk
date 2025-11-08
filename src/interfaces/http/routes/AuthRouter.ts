import { Router, type Request, type Response } from "express"
import type { AuthController } from "../../controllers/AuthController"

/**
 * Router HTTP encargado de exponer los endpoints de autenticación.
 *
 * Actúa como punto de entrada para operaciones relacionadas con login y autenticación JWT.
 * Su responsabilidad es puramente de transporte (infraestructura).
 */
export class AuthRouter {
    private readonly router: Router

    constructor(private readonly controller: AuthController) {
        this.router = Router()
        this.initializeRoutes()
    }

    /**
     * Inicializa las rutas de autenticación.
     */
    private initializeRoutes(): void {
        /**
         * @swagger
         * /auth/login:
         *   post:
         *     summary: Autentica a un usuario y genera un token JWT.
         *     tags: [Authentication]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - password
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *               password:
         *                 type: string
         *                 format: password
         *     responses:
         *       200:
         *         description: Autenticación exitosa.
         *       400:
         *         description: Datos inválidos.
         *       401:
         *         description: Credenciales incorrectas.
         */
        this.router.post(
            "/login",
            this.safeHandler((req, res) => this.controller.login(req, res)),
        )
    }

    /**
     * Devuelve el router configurado para ser montado en la aplicación.
     */
    public getRouter(): Router {
        return this.router
    }

    /**
     * Envoltorio seguro para manejar errores de forma centralizada.
     * Previene caídas por excepciones no controladas.
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
