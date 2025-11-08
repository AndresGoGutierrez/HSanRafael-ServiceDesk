import type { UserRepository } from "../ports/UserRepository"
import type { Clock } from "../ports/Clock"
import type { EventBus } from "../ports/EventBus"
import type { PasswordHasher } from "../ports/PasswordHasher"
import {
    CreateUserSchema,
    type CreateUserInput,
    UserResponseSchema,
    type UserResponseDto,
} from "../dtos/user"
import { User } from "../../domain/entities/User"

/**
 * Caso de uso: Crear un nuevo usuario en el sistema.
 *
 * - Valida la entrada con Zod.
 * - Verifica la unicidad del correo electrónico.
 * - Hashea la contraseña.
 * - Crea y persiste la entidad de dominio.
 * - Publica eventos de dominio.
 * - Devuelve un DTO seguro sin información sensible.
 */
export class CreateUser {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
        private readonly passwordHasher: PasswordHasher,
    ) { }

    async execute(input: CreateUserInput): Promise<User> {
        const validatedInput = CreateUserSchema.parse(input);

        const existingUser = await this.userRepo.findByEmail(validatedInput.email);
        if (existingUser) {
            throw new Error(`El usuario con el correo ${validatedInput.email} ya existe`);
        }

        const hashedPassword = await this.passwordHasher.hash(validatedInput.password);

        const user = User.create(validatedInput, hashedPassword, this.clock.now());

        await this.userRepo.save(user);
        await this.eventBus.publishAll(user.pullDomainEvents());

        return user; // ✅ devolvemos la entidad de dominio
    }
}
