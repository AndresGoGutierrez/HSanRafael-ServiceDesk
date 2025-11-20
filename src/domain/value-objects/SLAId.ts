import { v4 as uuidv4, validate as validateUUID } from "uuid"

/**
 * Value Object representing the unique identifier of an SLA.
 * Ensures immutability, validation, and encapsulation of the primitive value.
 */
export class SLAId {
  private constructor(private readonly value: string) {
    if (!SLAId.isValid(value)) {
      throw new Error(`Formato de SLAId inválido: ${value}`)
    }
  }

  /** Create a new random SLAId */
  public static new(): SLAId {
    return new SLAId(uuidv4())
  }

  /** Restores an existing SLAId from its primitive value */
  public static from(id: string): SLAId {
    return new SLAId(id)
  }

  /** Checks if the given string is a valid UUID */
  private static isValid(id: string): boolean {
    // We use the native uuid function instead of a manual regex
    return validateUUID(id)
  }

  /** Returns the underlying primitive value */
  public toString(): string {
    return this.value
  }

  /** Compare equality with another SLAId */
  public equals(other: SLAId): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
