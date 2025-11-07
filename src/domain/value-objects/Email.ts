import { z } from "zod"

/**
 * Value Object que representa un correo electrónico válido.
 * Garantiza validación, inmutabilidad y comparación segura.
 */
export class Email {
    private constructor(private readonly value: string) { }

    /**
     * Crea un nuevo Email validado.
     * Lanza un error si el valor no cumple el formato.
     */
    static create(value: string): Email {
        if (!value || typeof value !== "string") {
            throw new Error("Email must be a non-empty string")
        }

        const normalized = value.trim().toLowerCase()

        const schema = z
            .string()
            .email("Invalid email format")
            .max(254, "Email is too long") // estándar RFC
        const parsed = schema.parse(normalized)

        return new Email(parsed)
    }

    /**
     * Restaura un Email existente (por ejemplo, desde la base de datos).
     * Úsalo solo cuando estés seguro de que el valor ya fue validado.
     */
    static from(value: string): Email {
        return new Email(value.trim().toLowerCase())
    }

    /**
     * Devuelve el valor primitivo (string).
     */
    toString(): string {
        return this.value
    }

    /**
     * Compara igualdad entre dos objetos Email.
     */
    equals(other: Email): boolean {
        return this.value === other.value
    }
}
