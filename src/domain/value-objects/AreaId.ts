import { randomUUID } from "crypto"

/**
 * Value Object representing the unique identifier of an area.
 * Ensures immutability and validity of the UUID format.
 */
export class AreaId {
    private constructor(private readonly value: string) { }

    /** Create a new random identifier */
    public static new(): AreaId {
        return new AreaId(randomUUID())
    }

    /** Create an instance from an existing value */
    public static from(value: string): AreaId {
        if (!AreaId.isValidUUID(value)) {
            throw new Error(`El valor proporcionado no es un UUID válido: "${value}"`)
        }
        return new AreaId(value)
    }

    /** Returns the primitive value of the identifier */
    public toString(): string {
        return this.value
    }

    /** Compare two AreaIds for structural equality */
    public equals(other: AreaId): boolean {
        return this.value === other.value
    }

    /** Checks if a string has a valid UUID format */
    private static isValidUUID(value: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(value)
    }
}
