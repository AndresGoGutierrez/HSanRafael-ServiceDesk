import { User } from "../../domain/entities/User";

/**
 * UserRepository
 * ---------------
<<<<<<< HEAD
 * Puerto (contrato) que define las operaciones necesarias
 * para persistir y recuperar entidades de tipo User.
 *
 * Esta interfaz pertenece a la capa de aplicación y no conoce
 * detalles de implementación (como Prisma, TypeORM, etc.).
 */
export interface UserRepository {
    /**
     * Persiste un usuario (creación o actualización).
     *
     * @param user Entidad de dominio User a guardar.
=======
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
>>>>>>> main
     */
    save(user: User): Promise<void>;

    /**
<<<<<<< HEAD
     * Busca un usuario por su identificador único.
     *
     * @param id Identificador del usuario.
     * @returns La entidad User o null si no existe.
=======
     * Searches for a user by their unique identifier.
     * 
     * @param id User identifier.
     * @returns The User entity or null if it does not exist.
>>>>>>> main
     */
    findById(id: string): Promise<User | null>;

    /**
<<<<<<< HEAD
     * Busca un usuario por su correo electrónico.
     *
     * @param email Correo electrónico del usuario.
     * @returns La entidad User o null si no existe.
=======
     * Searches for a user by their email address.
     * 
     * @param email User's email address.
     * @returns The User entity or null if it does not exist.
>>>>>>> main
     */
    findByEmail(email: string): Promise<User | null>;

    /**
<<<<<<< HEAD
     * Lista todos los usuarios registrados.
     *
     * @returns Un arreglo con todas las entidades User.
=======
     * Lists all registered users.
     * 
     * @returns An array with all User entities.
>>>>>>> main
     */
    list(): Promise<User[]>;
}
