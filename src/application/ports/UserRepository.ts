import { User } from "../../domain/entities/User"

/**
 * UserRepository
 * ---------------
 * Port (contract) that defines the operations necessary
 * to persist and retrieve entities of type User.
 * 
 * This interface belongs to the application layer and does not know
 * implementation details (such as Prisma, TypeORM, etc.).
 */
export interface UserRepository {
    /**
     * Persists a user (creation or update).
     * 
     * @param user User domain entity to be saved.
     */
    save(user: User): Promise<void>

    /**
     * Searches for a user by their unique identifier.
     * 
     * @param id User identifier.
     * @returns The User entity or null if it does not exist.
     */
    findById(id: string): Promise<User | null>

    /**
     * Searches for a user by their email address.
     * 
     * @param email User's email address.
     * @returns The User entity or null if it does not exist.
     */
    findByEmail(email: string): Promise<User | null>

    /**
     * Lists all registered users.
     * 
     * @returns An array with all User entities.
     */
    list(): Promise<User[]>
}
