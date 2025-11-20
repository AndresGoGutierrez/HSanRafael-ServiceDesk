import type { UserRepository } from "../ports/UserRepository";
import type { User } from "../../domain/entities/User";

/**
 * Use case: List all users in the system.
 *
 * This use case is responsible for retrieving all persisted
 * `User` entities, delegating the retrieval to the repository.
 *
 * Clean Architecture principle:
 * - Does not depend on infrastructure details.
 * - Returns only domain entities.
 */
export class ListUsers {
    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Executes the user listing use case.
     *
     * @returns List of users or an empty array if none exist.
     */
    async execute(): Promise<User[]> {
        const users = await this.userRepository.list();

        // Guarantees consistent return (no null or undefined)
        return users ?? [];
    }
}
