import { randomUUID } from "crypto"

/**
 * Value Object que representa el identificador único de un área.
 * Garantiza inmutabilidad y validez del formato UUID.
 */
export class AreaId {
    private constructor(private readonly value: string) { }

    /** Crea un nuevo identificador aleatorio */
    public static new(): AreaId {
        return new AreaId(randomUUID())
    }

    /** Crea una instancia a partir de un valor existente */
    public static from(value: string): AreaId {
        if (!AreaId.isValidUUID(value)) {
            throw new Error(`El valor proporcionado no es un UUID válido: "${value}"`)
        }
        return new AreaId(value)
    }

    /** Devuelve el valor primitivo del identificador */
    public toString(): string {
        return this.value
    }

    /** Compara dos AreaId para igualdad estructural */
    public equals(other: AreaId): boolean {
        return this.value === other.value
    }

    /** Verifica si un string tiene formato UUID válido */
    private static isValidUUID(value: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(value)
    }
}
