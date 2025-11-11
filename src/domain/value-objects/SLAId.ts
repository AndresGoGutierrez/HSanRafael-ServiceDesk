import { v4 as uuidv4, validate as validateUUID } from "uuid"

/**
 * Value Object que representa el identificador único de un SLA.
 * Garantiza inmutabilidad, validación y encapsulamiento del valor primitivo.
 */
export class SLAId {
  private constructor(private readonly value: string) {
    if (!SLAId.isValid(value)) {
      throw new Error(`Formato de SLAId inválido: ${value}`)
    }
  }

  /** Crea un nuevo SLAId aleatorio */
  public static new(): SLAId {
    return new SLAId(uuidv4())
  }

  /** Restaura un SLAId existente desde su valor primitivo */
  public static from(id: string): SLAId {
    return new SLAId(id)
  }

  /** Verifica si el string dado es un UUID válido */
  private static isValid(id: string): boolean {
    // Usamos la función nativa de uuid en lugar de una regex manual
    return validateUUID(id)
  }

  /** Retorna el valor primitivo subyacente */
  public toString(): string {
    return this.value
  }

  /** Compara igualdad con otro SLAId */
  public equals(other: SLAId): boolean {
    if (!other) return false
    return this.value === other.value
  }
}
