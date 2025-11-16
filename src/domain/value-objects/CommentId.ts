/**
 * Value Object representing the unique identifier of a comment.
 * Ensures immutability and encapsulates creation and validation logic.
 */
export class CommentId {
  private constructor(private readonly value: string) {}

  /**
   * Generates a new unique CommentId using UUID v4.
   */
  static new(): CommentId {
    return new CommentId(crypto.randomUUID())
  }

  /**
   * Creates a CommentId from an existing value (for example, from the database).
   */
  static from(value: string): CommentId {
    if (!value || typeof value !== "string") {
      throw new Error("El valor del CommentId debe ser una cadena válida.")
    }
    return new CommentId(value)
  }

  /**
   * Returns the identifier as a string.
   */
  toString(): string {
    return this.value
  }

  /**
   * Compares two CommentIds for equality of value.
   */
  equals(other: CommentId): boolean {
    return this.value === other.value
  }
}
