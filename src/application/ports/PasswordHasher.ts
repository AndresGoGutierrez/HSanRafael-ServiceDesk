/**
 * Contrato para servicios de hashing de contraseñas.
 *
 * Este puerto define las operaciones necesarias para manejar
 * el ciclo de vida de contraseñas en el dominio sin acoplarse
 * a una implementación concreta (por ejemplo, bcrypt, Argon2, etc.).
 */
export interface PasswordHasher {
    /**
     * Genera un hash seguro a partir de una contraseña en texto plano.
     * @param password Contraseña sin encriptar.
     * @returns Hash en formato string.
     */
    hash(password: string): Promise<string>;

    /**
     * Compara una contraseña en texto plano con su hash.
     * @param password Contraseña sin encriptar.
     * @param hash Hash previamente generado.
     * @returns `true` si coinciden, `false` en caso contrario.
     */
    compare(password: string, hash: string): Promise<boolean>;
}
