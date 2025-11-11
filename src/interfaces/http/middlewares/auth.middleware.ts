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
    constructor(private readonly tokenService: TokenService) { console.log("[AuthMiddleware] Instancia creada con TokenService:", tokenService.constructor.name) }

    /**
     * Middleware para autenticar una solicitud usando JWT.
     * Lanza 401 si el token no existe, es inválido o expiró.
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

                console.log("[AuthMiddleware] Autorización concedida para rol:", req.user.role)
                next()
            }
}
