/**
 * Value Object que representa el identificador único de un comentario.
 * Garantiza inmutabilidad y encapsula la lógica de creación y validación.
 */
export class CommentId {
  private constructor(private readonly value: string) {}

  /**
   * Genera un nuevo CommentId único usando UUID v4.
   */
  static new(): CommentId {
    return new CommentId(crypto.randomUUID())
  }

  /**
   * Crea un CommentId a partir de un valor existente (por ejemplo, desde la base de datos).
   */
  static from(value: string): CommentId {
    if (!value || typeof value !== "string") {
      throw new Error("El valor del CommentId debe ser una cadena válida.")
    }
    return new CommentId(value)
  }

  /**
   * Devuelve el identificador como string.
   */
  toString(): string {
    return this.value
  }

  /**
   * Compara dos CommentId por igualdad de valor.
   */
  equals(other: CommentId): boolean {
    return this.value === other.value
  }
}
