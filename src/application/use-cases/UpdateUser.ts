import type { UserRepository } from "../ports/UserRepository";
import { type UpdateUserInput, UpdateUserSchema } from "../dtos/user";
import type { User } from "../../domain/entities/User";
import { UserId } from "../../domain/value-objects/UserId";

/**
 * Use case: Update an existing user.
 *
 * This use case is responsible for applying changes to a domain user,
 * ensuring that the user exists and that the data complies with the validations
 * defined in the DTO. It maintains the principle of dependency inversion
 * (it does not depend on infrastructure details).
 */
export class UpdateUser {
    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Executes the user update.
     *
     * @param userIdString - User identifier as a string (UUID).
     * @param input - Updated user data.
     * @throws Error if the user does not exist.
     */
    async execute(userIdString: string, input: UpdateUserInput): Promise<User> {
        // Validate input with Zod
        const validated = UpdateUserSchema.parse(input);

        // Convert string to Value Object
        const userId = UserId.from(userIdString);

        // Search for existing user
        const user = await this.userRepository.findById(userId.toString());
        if (!user) {
            throw new Error(`User with id ${userIdString} not found`);
        }

        // Update profile (entity manages business logic)
        user.updateProfile(validated.name, validated.role, validated.areaId);

        // Persist changes
        await this.userRepository.save(user);

        return user;
    }
}
