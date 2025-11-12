/**
 * Representa la información mínima que se incluye en un token de autenticación.
 * Este modelo es agnóstico a la tecnología usada para firmar/verificar (JWT, Paseto, etc.).
 */
export interface TokenPayload {
    userId: string;
    email: string;
    /**
     * Rol del usuario dentro del sistema.
     * Idealmente debe alinearse con el tipo de dominio `UserRole`.
     */
    role: "REQUESTER" | "AGENT" | "TECH" | "ADMIN";
}

/**
 * Puerto de servicio para la gestión de tokens de autenticación.
 * Define la interfaz de la capa de aplicación, sin depender de frameworks o librerías.
 */
export interface TokenService {
    /**
     * Firma digitalmente un payload y retorna un token.
     * @param payload Datos que se incluirán dentro del token.
     * @param expiresIn Tiempo de expiración (por ejemplo: "1h", "7d").
     * @returns Token firmado como string.
     */
    sign(payload: TokenPayload, expiresIn?: string): string;

    /**
     * Verifica y decodifica un token firmado.
     * @param token Token a verificar.
     * @returns El payload original si el token es válido.
     * @throws Error si el token es inválido o ha expirado.
     */
    verify(token: string): TokenPayload;
}
