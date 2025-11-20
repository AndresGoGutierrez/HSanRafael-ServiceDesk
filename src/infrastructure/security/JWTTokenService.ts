import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"
import type { TokenService, TokenPayload } from "../../application/ports/TokenService"

/**
 * Implementation of TokenService using JWT.
 * 
 * Responsibilities:
 *  - Sign tokens with a secret key.
 *  - Verify and decode JWT tokens.
 * 
 * This class belongs to the infrastructure layer.
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
     * Signs a new JWT token with the provided data.
     * @param payload Data to include in the token.
     * @param expiresIn Expiration time (default is the configured time).
     * @returns Signed token as a string.
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
     * Verifies and decodes a JWT token.
     * @param token Token to verify.
     * @returns Decoded payload if the token is valid.
     * @throws Error if the token is invalid or has expired.
     */
    verify(token: string): TokenPayload {
        if (!token || token.trim().length === 0) {
            throw new Error("JWTTokenService: el token no puede estar vacío")
        }

        try {
            const decoded = jwt.verify(token, this.secret) as JwtPayload
            // Validate that the payload has the expected form
            if (!decoded || typeof decoded !== "object") {
                throw new Error("JWTTokenService: token decodificado inválido")
            }
            return decoded as TokenPayload
        } catch (error) {
            throw new Error(`JWTTokenService: token inválido o expirado - ${(error as Error).message}`)
        }
    }
}
