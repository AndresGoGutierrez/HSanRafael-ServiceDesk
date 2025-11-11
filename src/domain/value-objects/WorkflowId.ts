import { v4 as uuidv4 } from "uuid"

/**
 * Value Object que representa el identificador único de un Workflow.
 * Garantiza inmutabilidad, validación y encapsulamiento del valor primitivo.
 */
export class WorkflowId {
    private readonly value: string

    private constructor(id: string) {
        if (!WorkflowId.isValid(id)) {
            throw new Error(`Invalid WorkflowId format: "${id}"`)
        }
        this.value = id
    }

    /**
     * Crea una instancia de WorkflowId desde un UUID existente.
     * @throws Error si el formato no es válido.
     */
    public static from(id: string): WorkflowId {
        return new WorkflowId(id)
    }

    /**
     * Genera un nuevo identificador único de Workflow.
     * Usa crypto.randomUUID() si está disponible.
     */
    public static new(): WorkflowId {
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : uuidv4()
        return new WorkflowId(id)
    }

    /**
     * Verifica si una cadena cumple con el formato UUID v4.
     */
    private static isValid(id: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(id)
    }

    /** Retorna el valor UUID como string */
    public toString(): string {
        return this.value
    }

    /** Retorna el valor UUID en formato JSON seguro */
    public toJSON(): string {
        return this.value
    }

    /** Compara dos WorkflowId por valor */
    public equals(other: WorkflowId): boolean {
        return this.value === other.value
    }

    /** Compara el valor directamente con un string */
    public equalsString(id: string): boolean {
        return this.value === id
    }
}
