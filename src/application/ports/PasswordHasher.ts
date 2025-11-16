/**
 * Contract for password hashing services.
 *
 * This port defines the operations necessary to manage
 * the password lifecycle in the domain without coupling
 * to a specific implementation (e.g., bcrypt, Argon2, etc.).
 */
export interface PasswordHasher {
    /**
     * Generates a secure hash from a plaintext password.
     * @param password Unencrypted password.
     * @returns Hash in string format.
     */
    hash(password: string): Promise<string>

    /**
     * Compares a plaintext password with its hash.
     * @param password Unencrypted password.
     * @param hash Previously generated hash.
     * @returns `true` if they match, `false` otherwise.
     */
    compare(password: string, hash: string): Promise<boolean>
}
