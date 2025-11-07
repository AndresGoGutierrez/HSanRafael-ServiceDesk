import type { AuditRepository } from "../ports/AuditRepository";
import type { Clock } from "../ports/Clock";
import { AuditTrail, type CreateAuditTrailInput } from "../../domain/entities/AuditTrail";

/**
 * Caso de uso: Registrar una acción en el sistema de auditoría.
 *
 * Este caso de uso encapsula la lógica de creación y persistencia
 * de un registro de auditoría (`AuditTrail`) cuando ocurre un evento relevante
 * en el dominio (por ejemplo, cambio de estado, actualización o eliminación).
 *
 * Principios de Clean Architecture:
 * - No depende de detalles de infraestructura.
 * - Trabaja únicamente con entidades de dominio y puertos (repositorios).
 * - Se mantiene agnóstico al framework o tecnología de persistencia.
 */
export class RecordAudit {
    constructor(
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
    ) { }

    /**
     * Ejecuta el registro de una nueva auditoría.
     *
     * @param input Datos necesarios para crear el registro de auditoría.
     * @throws Error si la creación del registro falla por validación o persistencia.
     */
    async execute(input: CreateAuditTrailInput): Promise<void> {
        // Validar y crear la entidad de dominio
        const auditTrail = AuditTrail.create(input, this.clock.now());

        // Persistir el registro en el repositorio
        await this.auditRepository.save(auditTrail);
    }
}
