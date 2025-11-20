import { v4 as uuidv4 } from "uuid"

/**
 * Value Object representing the unique identifier of a Workflow.
 * Ensures immutability, validation, and encapsulation of the primitive value.
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
     * Creates an instance of WorkflowId from an existing UUID.
     * @throws Error if the format is invalid.
     */
    public static from(id: string): WorkflowId {
        return new WorkflowId(id)
    }

    /**
     * Generates a new unique Workflow identifier.
     * Uses crypto.randomUUID() if available.
     */
    public static new(): WorkflowId {
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : uuidv4()
        return new WorkflowId(id)
    }

    /**
     * Verifies whether a string complies with the UUID v4 format.
     */
    private static isValid(id: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(id)
    }

    /** Returns the UUID value as a string */
    public toString(): string {
        return this.value
    }

    /** Returns the UUID value in secure JSON format */
    public toJSON(): string {
        return this.value
    }

    /** Compare two WorkflowIds by value */
    public equals(other: WorkflowId): boolean {
        return this.value === other.value
    }

    /** Compare the value directly with a string */
    public equalsString(id: string): boolean {
        return this.value === id
    }
}
