import type { Request, Response } from "express"
import type { AuthenticateUser } from "../../application/use-cases/AuthenticateUser"
import { LoginSchema } from "../../application/dtos/auth"
import { ZodError } from "zod"

/**
 * Controller responsible for handling user authentication.
 *
 * Belongs to the interface layer (controllers) and delegates business logic
 * to the `AuthenticateUser` use case.
 */
export class AuthController {
    constructor(private readonly authenticateUser: AuthenticateUser) { }

    /**
     * Logs in the user by validating their credentials.
     * POST /auth/login
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            // Input data validation
            const dto = LoginSchema.parse(req.body)

            // Run use case
            const result = await this.authenticateUser.execute(dto)

            res.status(200).json({
                success: true,
                message: "Autenticación exitosa",
                data: result,
            })
        } catch (error) {
            // Handling known errors
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Datos inválidos",
                    details: error.issues.map(issue => issue.message),
                })
                return
            }

            if (error instanceof Error) {
                // Determine if it is an authentication error
                const isAuthError = /(invalid|incorrect|unauthorized)/i.test(error.message)
                res.status(isAuthError ? 401 : 400).json({
                    success: false,
                    error: error.message,
                })
                return
            }

            // Unknown error
            console.error("[AuthController] Unexpected error:", error)
            res.status(500).json({
                success: false,
                error: "Error interno del servidor",
            })
        }
    }
}
