import type { Request, Response, NextFunction } from "express"
import type { TokenService } from "../../../application/ports/TokenService"

/**
 * Extends the Express Request interface to include
 * information about the authenticated user.
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string
        email: string
        role: string
    }
}

/**
 * Authentication and authorization middleware.
 *
 * - Verifies and decodes the JWT token.
 * - Attaches the authenticated user to the request.
 * - Allows access to be restricted by roles.
 */
export class AuthMiddleware {
    constructor(private readonly tokenService: TokenService) { console.log("[AuthMiddleware] Instancia creada con TokenService:", tokenService.constructor.name) }

    /**
     * Middleware to authenticate a request using JWT.
     * Throws 401 if the token does not exist, is invalid, or has expired.
     */
    authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization
        console.log("[AuthMiddleware] Authorization header:", authHeader)

        if (!authHeader?.startsWith("Bearer ")) {
            console.log("[AuthMiddleware] Header inválido o ausente")
            res.status(401).json({ success: false, error: "Missing or invalid Authorization header" })
            return
        }

        const token = authHeader.slice(7).trim()
        console.log("[AuthMiddleware] Token recibido:", token)

        try {
            const payload = await this.tokenService.verify(token)
            console.log("[AuthMiddleware] Token decodificado:", payload)

            if (!payload || typeof payload !== "object") {
                console.log("[AuthMiddleware] Payload inválido")
                res.status(401).json({ success: false, error: "Invalid token payload" })
                return
            }

            req.user = {
                userId: payload.userId,
                email: payload.email,
                role: payload.role,
            }

            console.log("[AuthMiddleware] Usuario autenticado:", req.user)
            next()
        } catch (error) {
            console.error("[AuthMiddleware] Error verificando token:", error)
            res.status(401).json({ success: false, error: "Invalid or expired token" })
        }
    }

    /**
     * Role-based authorization middleware.
     * Only allows access to users with specific roles.
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

                console.log("[AuthMiddleware] Autorización concedida para rol:", req.user.role)
                next()
            }
}
