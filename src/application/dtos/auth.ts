import { z } from "zod";
import type { UserRole } from "../../domain/entities/User";

/**
 * Schema to validate login credentials.
 * Ensures that the email address has a valid format and that the password
 * meets a minimum secure length requirement.
 */
export const LoginSchema = z.object({
    email: z.string().trim().email("Formato de correo inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Schema for structuring the login response.
 * Represents the session token and basic information about the authenticated user.
 */
export const LoginResponseSchema = z.object({
    token: z.string().min(1, "Token inválido"),
    user: z.object({
        id: z.string().uuid("ID de usuario inválido"),
        name: z.string().trim().min(1, "El nombre no puede estar vacío"),
        email: z.string().email("Formato de correo inválido"),
        role: z.custom<UserRole>(),
    }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
