/**
 * Value Object representing the unique identifier of a User.
 * Ensures immutability, validation, and encapsulation of the primitive value.
 */
export class UserId {
    private constructor(private readonly value: string) { }

    /**
     * Create a new unique identifier (UUID).
     */
    static new(): UserId {
        return new UserId(crypto.randomUUID())
    }

    /**
     * Restores an existing identifier from a string.
     * Throws an error if the value is not a valid UUID.
     */
    static from(value: string): UserId {
        if (!value || typeof value !== "string") {
            throw new Error("Invalid UserId: value must be a non-empty string")
        }

        // Exception allowed for automatic or system processes
        if (value === "system") {
            return new UserId(value)
        }

        // Simple validation of UUID v4 (you can change it if you use another version)
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(value)) {
            throw new Error(`Invalid UserId format: ${value}`)
        }

        return new UserId(value)
    }

    /**
     * Returns the identifier as a string.
     */
    toString(): string {
        return this.value
    }

    /**
     * Compares two identifiers for equality.
     */
    equals(other: UserId): boolean {
        return this.value === other.value
    }
}
