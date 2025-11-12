import type { Area } from "../../domain/entities/Area";

/**
 * Contrato del repositorio de áreas.
 * Define las operaciones de persistencia que deben implementarse
 * por la capa de infraestructura.
 */
export interface AreaRepository {
    /**
     * Persiste una entidad `Area` (creación o actualización).
     * @param area Entidad del dominio a guardar.
     */
    save(area: Area): Promise<void>;

    /**
     * Busca un área por su identificador único.
     * @param id Identificador UUID del área.
     * @returns Instancia de `Area` o `null` si no existe.
     */
    findById(id: string): Promise<Area | null>;

    /**
     * Busca un área por su nombre.
     * @param name Nombre del área.
     * @returns Instancia de `Area` o `null` si no existe.
     */
    findByName(name: string): Promise<Area | null>;

    /**
     * Lista todas las áreas almacenadas.
     * @returns Arreglo de entidades `Area`.
     */
    list(): Promise<Area[]>;

    /**
     * Elimina un área por su ID.
     * Aunque no siempre es necesario en DDD, puede implementarse
     * como eliminación física o lógica según el caso de uso.
     */
    delete?(id: string): Promise<void>;
}
