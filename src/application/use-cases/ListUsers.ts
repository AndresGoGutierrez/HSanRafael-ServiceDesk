import type { UserRepository } from "../ports/UserRepository";
import type { User } from "../../domain/entities/User";

/**
 * Caso de uso: Listar todos los usuarios del sistema.
 *
 * Este caso de uso se encarga de recuperar todas las entidades
 * `User` persistidas, delegando la obtención al repositorio.
 *
 * Principio de Clean Architecture:
 * - No depende de detalles de infraestructura.
 * - Devuelve solo entidades del dominio.
 */
export class ListUsers {
    constructor(private readonly userRepository: UserRepository) { }

    /**
     * Ejecuta el caso de uso de listado de usuarios.
     *
     * @returns Lista de usuarios o un arreglo vacío si no existen.
     */
    async execute(): Promise<User[]> {
        const users = await this.userRepository.list();

        // Garantiza retorno consistente (sin null o undefined)
        return users ?? [];
    }
}
