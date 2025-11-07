/**
 * Value Object que representa el identificador único de un Usuario.
 * Garantiza inmutabilidad, validación y encapsulamiento del valor primitivo.
 */
export class UserId {
    private constructor(private readonly value: string) { }

    /**
     * Crea un nuevo identificador único (UUID).
     */
    static new(): UserId {
        return new UserId(crypto.randomUUID())
    }

    /**
     * Restaura un identificador existente desde un string.
     * Lanza un error si el valor no es un UUID válido.
     */
    static from(value: string): UserId {
        if (!value || typeof value !== "string") {
            throw new Error("Invalid UserId: value must be a non-empty string")
        }

        // Validación simple de UUID v4 (puedes cambiarla si usas otra versión)
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(value)) {
            throw new Error(`Invalid UserId format: ${value}`)
        }

        return new UserId(value)
    }

    /**
     * Retorna el identificador como string.
     */
    toString(): string {
        return this.value
    }

    /**
     * Compara igualdad entre dos identificadores.
     */
    equals(other: UserId): boolean {
        return this.value === other.value
    }
}
