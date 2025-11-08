import type { PasswordHasher } from "../../application/ports/PasswordHasher"
import bcrypt from "bcrypt"

/**
 * Implementación de PasswordHasher usando bcrypt.
 *
 * Responsable de:
 *  - Generar hashes seguros de contraseñas.
 *  - Comparar contraseñas con sus hashes.
 *
 * Esta clase pertenece a la capa de infraestructura.
 */
export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds: number

    constructor(saltRounds = 10) {
        // Permitir configuración externa (por .env, test, etc.)
        this.saltRounds = saltRounds
    }

    /**
     * Genera un hash seguro para la contraseña dada.
     * @param password Contraseña en texto plano.
     * @returns Hash generado.
     */
    async hash(password: string): Promise<string> {
        if (!password || password.trim().length === 0) {
            throw new Error("PasswordHasher: la contraseña no puede estar vacía")
        }

        try {
            return await bcrypt.hash(password, this.saltRounds)
        } catch (error) {
            throw new Error(`PasswordHasher: error al generar hash - ${(error as Error).message}`)
        }
    }

    /**
     * Compara una contraseña en texto plano con su hash.
     * @param password Contraseña en texto plano.
     * @param hash Hash previamente generado.
     * @returns Verdadero si coinciden, falso en caso contrario.
     */
    async compare(password: string, hash: string): Promise<boolean> {
        if (!password || !hash) return false

        try {
            return await bcrypt.compare(password, hash)
        } catch (error) {
            throw new Error(`PasswordHasher: error al comparar contraseñas - ${(error as Error).message}`)
        }
    }
}
