import type { UserRepository } from "../ports/UserRepository";
import { type UpdateUserInput, UpdateUserSchema } from "../dtos/user";
import type { User } from "../../domain/entities/User";
import { UserId } from "../../domain/value-objects/UserId";

/**
 * Caso de uso: Actualizar un usuario existente.
 *
 * Este caso de uso se encarga de aplicar cambios a un usuario del dominio,
 * garantizando que el usuario exista y que los datos cumplan las validaciones
 * definidas en el DTO. Mantiene el principio de inversión de dependencias
 * (no depende de detalles de infraestructura).
 */
export class UpdateUser {
    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Ejecuta la actualización del usuario.
     *
     * @param userIdString - Identificador del usuario como string (UUID).
     * @param input - Datos actualizados del usuario.
     * @throws Error si el usuario no existe.
     */
    async execute(userIdString: string, input: UpdateUserInput): Promise<User> {
        // Validar input con Zod
        const validated = UpdateUserSchema.parse(input);

        // Convertir string a Value Object
        const userId = UserId.from(userIdString);

        // Buscar el usuario existente
        const user = await this.userRepository.findById(userId.toString());
        if (!user) {
            throw new Error(`User with id ${userIdString} not found`);
        }

        // Actualizar el perfil (entidad gestiona la lógica de negocio)
        user.updateProfile(validated.name, validated.role, validated.areaId);

        // Persistir cambios
        await this.userRepository.save(user);

        return user;
    }
}
