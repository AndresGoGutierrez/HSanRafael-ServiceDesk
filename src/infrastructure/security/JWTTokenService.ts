import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import type { TokenService, TokenPayload } from "../../application/ports/TokenService"

/**
 * Implementación de TokenService usando JWT.
 * 
 * Responsabilidades:
 *  - Firmar tokens con una clave secreta.
 *  - Verificar y decodificar tokens JWT.
 * 
 * Esta clase pertenece a la capa de infraestructura.
 */
export class JWTTokenService implements TokenService {
    private readonly secret: string
    private readonly defaultExpiration: string

    constructor(secret: string, defaultExpiration = "24h") {
        if (!secret || secret.trim().length === 0) {
            throw new Error("JWTTokenService: el secreto JWT no puede estar vacío")
        }
        this.secret = secret
        this.defaultExpiration = defaultExpiration
    }

    /**
     * Firma un nuevo token JWT con los datos proporcionados.
     * @param payload Datos a incluir en el token.
     * @param expiresIn Tiempo de expiración (por defecto el configurado).
     * @returns Token firmado como string.
     */
    sign(payload: TokenPayload, expiresIn?: string): string {
        try {
            const options: SignOptions = { expiresIn: (expiresIn ?? this.defaultExpiration) as any }
            return jwt.sign(payload, this.secret, options)
        } catch (error) {
            throw new Error(`JWTTokenService: error al firmar el token - ${(error as Error).message}`)
        }
    }

    /**
     * Verifica y decodifica un token JWT.
     * @param token Token a verificar.
     * @returns Payload decodificado si el token es válido.
     * @throws Error si el token es inválido o ha expirado.
     */
    verify(token: string): TokenPayload {
        if (!token || token.trim().length === 0) {
            throw new Error("JWTTokenService: el token no puede estar vacío")
        }

        try {
            const decoded = jwt.verify(token, this.secret) as JwtPayload
            // Validar que el payload tenga la forma esperada
            if (!decoded || typeof decoded !== "object") {
                throw new Error("JWTTokenService: token decodificado inválido")
            }
            return decoded as TokenPayload
        } catch (error) {
            throw new Error(`JWTTokenService: token inválido o expirado - ${(error as Error).message}`)
        }
    }
}
