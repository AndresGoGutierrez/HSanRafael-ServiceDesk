import type { Request, Response, NextFunction } from "express"
import type { TokenService } from "../../../application/ports/TokenService"

/**
 * Extiende la interfaz Request de Express para incluir
 * la información del usuario autenticado.
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string
        email: string
        role: string
    }
}

/**
 * Middleware de autenticación y autorización.
 *
 * - Verifica y decodifica el token JWT.
 * - Adjunta el usuario autenticado al request.
 * - Permite restringir el acceso por roles.
 */
export class AuthMiddleware {
    constructor(private readonly tokenService: TokenService) { }

    /**
     * Middleware para autenticar una solicitud usando JWT.
     * Lanza 401 si el token no existe, es inválido o expiró.
     */
    authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization

        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ success: false, error: "Missing or invalid Authorization header" })
            return
        }

        const token = authHeader.slice(7).trim()

        try {
            const payload = await this.tokenService.verify(token)
            if (!payload || typeof payload !== "object") {
                res.status(401).json({ success: false, error: "Invalid token payload" })
                return
            }

            // Attach user info to the request
            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            }

            next()
        } catch (error) {
            console.error("[AuthMiddleware] Token verification failed:", error)
            res.status(401).json({ success: false, error: "Invalid or expired token" })
        }
    }

    /**
     * Middleware de autorización basado en roles.
     * Solo permite el acceso a usuarios con roles específicos.
     */
    authorize =
        (...allowedRoles: string[]) =>
            (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
                if (!req.user) {
                    res.status(401).json({ success: false, error: "Unauthorized" })
                    return
                }

                if (!allowedRoles.includes(req.user.role)) {
                    res.status(403).json({ success: false, error: "Forbidden: insufficient permissions" })
                    return
                }

                next()
            }
}
