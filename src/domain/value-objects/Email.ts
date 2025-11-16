import { z } from "zod"

/**
 * Value Object representing a valid email address.
 * Ensures validation, immutability, and secure comparison.
 */
export class Email {
    private constructor(private readonly value: string) { }

    /**
     * Creates a new validated email address.
     * Throws an error if the value does not comply with the format.
     */
    static create(value: string): Email {
        if (!value || typeof value !== "string") {
            throw new Error("Email must be a non-empty string")
        }

        const normalized = value.trim().toLowerCase()

        const schema = z
            .string()
            .email("Invalid email format")
            .max(254, "Email is too long") 
        const parsed = schema.parse(normalized)

        return new Email(parsed)
    }

    /**
     * Restores an existing email (for example, from the database).
     * Use this only when you are sure that the value has already been validated.
     */
    static from(value: string): Email {
        return new Email(value.trim().toLowerCase())
    }

    /**
     * Returns the primitive value (string).
     */
    toString(): string {
        return this.value
    }

    /**
     * Compares equality between two Email objects.
     */
    equals(other: Email): boolean {
        return this.value === other.value
    }
}
