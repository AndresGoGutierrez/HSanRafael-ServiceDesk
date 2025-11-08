import { z } from "zod"

/**
 * Enumeración de roles de usuario dentro del sistema
 */
export const ZUserRole = z.enum(["REQUESTER", "AGENT", "TECH", "ADMIN"])

export type UserRole = z.infer<typeof ZUserRole>

/**
 * Esquema para la creación de un nuevo usuario
 */
export const CreateUserSchema = z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
    email: z.string().email("El formato del correo es inválido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(64, "La contraseña no puede exceder los 64 caracteres"),
    role: ZUserRole,
    areaId: z.string().uuid("El área debe tener un UUID válido").optional(),
})

export type CreateUserInput = z.infer<typeof CreateUserSchema>

/**
 * Esquema para la actualización de datos de usuario
 */
export const UpdateUserSchema = z.object({
    name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").optional(),
    role: ZUserRole.optional(),
    areaId: z.string().uuid("El área debe tener un UUID válido").nullable().optional(),
    isActive: z.boolean().optional(),
})

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>

/**
 * Esquema para reconstruir un usuario desde persistencia
 */
export const RehydrateUserSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    role: ZUserRole,
    areaId: z.string().uuid().nullable(),
    isActive: z.boolean(),
    createdAt: z
        .union([z.string(), z.date()])
        .transform((val) => new Date(val))
        .default(() => new Date()),
})

export type RehydrateUserDto = z.infer<typeof RehydrateUserSchema>

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: ZUserRole,
  areaId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).optional(),
})

export type UserResponseDto = z.infer<typeof UserResponseSchema>
