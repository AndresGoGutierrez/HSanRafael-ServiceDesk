import { User } from "../../domain/entities/User";

/**
 * UserRepository
 * ---------------
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
     */
    save(user: User): Promise<void>;

    /**
     * Busca un usuario por su identificador único.
     *
     * @param id Identificador del usuario.
     * @returns La entidad User o null si no existe.
     */
    findById(id: string): Promise<User | null>;

    /**
     * Busca un usuario por su correo electrónico.
     *
     * @param email Correo electrónico del usuario.
     * @returns La entidad User o null si no existe.
     */
    findByEmail(email: string): Promise<User | null>;

    /**
     * Lista todos los usuarios registrados.
     *
     * @returns Un arreglo con todas las entidades User.
     */
    list(): Promise<User[]>;
}
