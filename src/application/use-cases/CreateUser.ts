import type { UserRepository } from "../ports/UserRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import type { PasswordHasher } from "../ports/PasswordHasher";
import { CreateUserSchema, type CreateUserInput } from "../dtos/user";
import { User } from "../../domain/entities/User";

/**
 * Caso de uso: Crear un nuevo usuario en el sistema.
 *
 * - Valida la entrada mediante Zod.
 * - Verifica unicidad del correo electrónico.
 * - Hashea la contraseña antes de crear la entidad de dominio.
 * - Persiste el usuario usando el repositorio.
 * - Publica los eventos de dominio generados.
 */
export class CreateUser {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
        private readonly passwordHasher: PasswordHasher,
    ) { }

    async execute(input: CreateUserInput): Promise<User> {
        // Validar datos de entrada con Zod
        const validatedInput = CreateUserSchema.parse(input);

        // Comprobar si el usuario ya existe
        const existingUser = await this.userRepo.findByEmail(validatedInput.email);
        if (existingUser) {
            throw new Error(`El usuario con el correo ${validatedInput.email} ya existe`);
        }

        // Hashear la contraseña antes de crear la entidad de dominio
        const hashedPassword = await this.passwordHasher.hash(validatedInput.password);

        // Crear la entidad de dominio
        const user = User.create(validatedInput, hashedPassword, this.clock.now());

        // Persistir la entidad
        await this.userRepo.save(user);

        // Publicar los eventos de dominio
        const events = user.pullDomainEvents();
        await this.eventBus.publishAll(events);

        return user;
    }
}
