import { AuditTrail } from "../../domain/entities/AuditTrail"
import { UserId } from "../../domain/value-objects/UserId"
import type { UserRepository } from "../ports/UserRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"

export class DeactivateUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
    ) { }

    async execute(userId: string, actorId: string, reason?: string): Promise<void> {
        const userIdVO = UserId.from(userId)
        const actorIdVO = UserId.from(actorId)

        const user = await this.userRepository.findById(userIdVO.toString())
        if (!user) throw new Error("User not found")

        // ✅ Asegúrate de usar una propiedad inmutable o un método del dominio
        if (!user.isActive) throw new Error("User already deactivated")

        // Idealmente el dominio tiene un método como `user.deactivate()`
        // para registrar eventos y evitar modificar propiedades directamente.
        user.deactivate(this.clock.now())

        await this.userRepository.save(user)

        // Crear registro de auditoría
        const audit = AuditTrail.create(
            {
                actorId: actorIdVO,
                action: "DEACTIVATE",
                entityType: "User",
                entityId: userId,
                changes: { isActive: { from: true, to: false }, reason },
            },
            this.clock.now(),
        )

        await this.auditRepository.save(audit)
    }
}
