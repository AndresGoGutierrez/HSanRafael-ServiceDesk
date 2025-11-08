import type { Request, Response } from "express"
import type { AuthenticateUser } from "../../application/use-cases/AuthenticateUser"
import { LoginSchema } from "../../application/dtos/auth"
import { ZodError } from "zod"

/**
 * Controlador responsable de manejar la autenticación de usuarios.
 *
 * Pertenece a la capa de interfaz (controllers) y delega la lógica
 * de negocio al caso de uso `AuthenticateUser`.
 */
export class AuthController {
    constructor(private readonly authenticateUser: AuthenticateUser) { }

    /**
     * Inicia sesión de usuario validando las credenciales.
     * POST /auth/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            // Validación de datos de entrada
            const dto = LoginSchema.parse(req.body)

            // Ejecutar caso de uso
            const result = await this.authenticateUser.execute(dto)

            res.status(200).json({
                success: true,
                message: "Autenticación exitosa",
                data: result,
            })
        } catch (error) {
            // Manejo de errores conocidos
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Datos inválidos",
                    details: error.issues.map(issue => issue.message),
                })
                return
            }

            if (error instanceof Error) {
                // Determinar si es error de autenticación
                const isAuthError = /(invalid|incorrect|unauthorized)/i.test(error.message)
                res.status(isAuthError ? 401 : 400).json({
                    success: false,
                    error: error.message,
                })
                return
            }

            // Error desconocido
            console.error("[AuthController] Unexpected error:", error)
            res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            })
        }
    }
}
