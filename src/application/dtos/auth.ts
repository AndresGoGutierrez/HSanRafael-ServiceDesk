import { z } from "zod"
import type { UserRole } from "../../domain/entities/User"

/**
 * Schema para validar las credenciales de inicio de sesión.
 * Se asegura de que el correo tenga un formato válido y la contraseña
 * cumpla una longitud mínima segura.
 */
export const LoginSchema = z.object({
  email: z.string().trim().email("Formato de correo inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export type LoginInput = z.infer<typeof LoginSchema>

/**
 * Schema para estructurar la respuesta del login.
 * Representa el token de sesión y la información básica del usuario autenticado.
 */
export const LoginResponseSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  user: z.object({
    id: z.string().uuid("ID de usuario inválido"),
    name: z.string().trim().min(1, "El nombre no puede estar vacío"),
    email: z.string().email("Formato de correo inválido"),
    role: z.custom<UserRole>(),
  }),
})

export type LoginResponse = z.infer<typeof LoginResponseSchema>
