import type { PasswordHasher } from "../../application/ports/PasswordHasher"
import bcrypt from "bcrypt"

/**
 * Implementation of PasswordHasher using bcrypt.
 *
 * Responsible for:
 *  - Generating secure password hashes.
 *  - Comparing passwords with their hashes.
 *
 * This class belongs to the infrastructure layer.
 */
export class BcryptPasswordHasher implements PasswordHasher {
    private readonly saltRounds: number

    constructor(saltRounds = 10) {
        // Allow external configuration (via .env, test, etc.)
        this.saltRounds = saltRounds
    }

    /**
     * Generates a secure hash for the given password.
     * @param password Password in plain text.
     * @returns Generated hash.
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
     * Compares a plaintext password with its hash.
     * @param password Plaintext password.
     * @param hash Previously generated hash.
     * @returns True if they match, false otherwise.
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
