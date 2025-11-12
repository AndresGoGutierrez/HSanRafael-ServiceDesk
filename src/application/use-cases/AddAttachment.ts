import { Attachment } from "../../domain/entities/Attachment";
import { CreateAttachmentSchema, type CreateAttachmentInput } from "../dtos/attachment";
import { type AttachmentRepository } from "../ports/AttachmentRepository";
import { type Clock } from "../ports/Clock";
import { type EventBus } from "../ports/EventBus";

/**
 * Use Case: AddAttachment
 * -----------------------
 * Encargado de crear un nuevo adjunto en el sistema.
 *
 * Orquesta las operaciones de validación, creación de la entidad,
 * persistencia en el repositorio y publicación de eventos de dominio.
 */
export class AddAttachment {
    constructor(
        private readonly repository: AttachmentRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * Ejecuta el caso de uso.
     *
     * @param input Datos para crear el adjunto.
     * @returns La entidad Attachment creada.
     * @throws {ZodError} Si el DTO no cumple con las reglas de validación.
     */
    async execute(input: CreateAttachmentInput): Promise<Attachment> {
        // Validar entrada usando Zod (DTO)
        const validated = CreateAttachmentSchema.parse(input);

        // Crear entidad de dominio con fecha actual del reloj inyectado
        const attachment = Attachment.create(validated, this.clock.now());

        // Persistir en el repositorio
        await this.repository.save(attachment);

        // Publicar eventos de dominio (si los hay)
        const events = attachment.pullDomainEvents();
        if (events.length > 0) {
            await this.eventBus.publishAll(events);
        }

        return attachment;
    }
}
