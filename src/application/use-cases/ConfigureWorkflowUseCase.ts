import type { WorkflowRepository } from "../ports/WorkflowRepository"
import type { AreaRepository } from "../ports/AreaRepository"
import type { AuditRepository } from "../ports/AuditRepository"
import type { Clock } from "../ports/Clock"
import type { EventBus } from "../ports/EventBus"
import { Workflow } from "../../domain/entities/Workflow"
import { AuditTrail } from "../../domain/entities/AuditTrail"
import { UserId } from "../../domain/value-objects/UserId"
import { CreateWorkflowSchema, type CreateWorkflowDto } from "../dtos/workflow"

/**
 * Caso de uso: Configurar el Workflow de un área.
 *
 * Responsabilidades:
 * - Validar la entrada con Zod.
 * - Verificar existencia del área.
 * - Crear un nuevo Workflow (manteniendo historial de versiones).
 * - Registrar cambios en el AuditTrail.
 * - Publicar eventos de dominio.
 */
export class ConfigureWorkflowUseCase {
    constructor(
        private readonly workflowRepository: WorkflowRepository,
        private readonly areaRepository: AreaRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) { }

    /**
     * Ejecuta la configuración de un Workflow para un área.
     * @param areaId Identificador del área.
     * @param input Datos de configuración del workflow.
     * @param actorId Identificador del usuario que realiza la acción.
     * @returns La nueva entidad `Workflow` creada.
     * @throws Error si el área no existe o la validación falla.
     */
    async execute(areaId: string, input: CreateWorkflowDto, actorId: string): Promise<Workflow> {
        // 1. Validación de entrada con Zod
        const validatedInput = CreateWorkflowSchema.parse(input);

        // 2. Verificar existencia del área
        const area = await this.areaRepository.findById(areaId);
        if (!area) {
            throw new Error(`Area not found: ${areaId}`);
        }

        const now = this.clock.now();

        // -----------------------------------------------------
        // 3. Validación del workflow personalizado
        // -----------------------------------------------------

        const transitions = validatedInput.transitions;

        // Extraer estados fuente
        const fromStates = Object.keys(transitions);

        // Extraer estados destino
        const toStates = Array.from(new Set(Object.values(transitions).flat()));

        // Lista completa de estados
        const allStates = new Set([...fromStates, ...toStates]);

        // A) Validar transiciones
        for (const [state, nextStates] of Object.entries(transitions)) {
            for (const next of nextStates) {
                if (!allStates.has(next)) {
                    throw new Error(`Invalid workflow: state "${next}" is not defined as a transition key or value`);
                }
            }
        }

        // B) Validar requiredFields
        if (validatedInput.requiredFields) {
            for (const state of Object.keys(validatedInput.requiredFields)) {
                if (!allStates.has(state)) {
                    throw new Error(`Invalid requiredFields: state "${state}" does not exist in transitions`);
                }
            }
        }

        // -----------------------------------------------------
        // 4. Obtener workflow anterior
        // -----------------------------------------------------

        const previousWorkflow = await this.workflowRepository.findLatestByAreaId(areaId);

        // -----------------------------------------------------
        // 5. Crear workflow
        // -----------------------------------------------------

        const workflow = Workflow.create(
            {
                areaId,
                transitions,
                requiredFields: validatedInput.requiredFields ?? {},
            },
            now,
        );

        await this.workflowRepository.save(workflow);

        // -----------------------------------------------------
        // 6. Auditoría
        // -----------------------------------------------------

        const audit = AuditTrail.create(
            {
                actorId: UserId.from(actorId),
                action: previousWorkflow ? "WORKFLOW_UPDATED" : "WORKFLOW_CREATED",
                entityType: "Workflow",
                entityId: workflow.id.toString(),
                changes: {
                    transitions: {
                        from: previousWorkflow?.transitions ?? null,
                        to: validatedInput.transitions,
                    },
                    requiredFields: {
                        from: previousWorkflow?.requiredFields ?? null,
                        to: validatedInput.requiredFields ?? {},
                    },
                },
            },
            now,
        );

        await this.auditRepository.save(audit);

        // -----------------------------------------------------
        // 7. Publicar eventos
        // -----------------------------------------------------

        await this.eventBus.publishAll(workflow.pullDomainEvents());

        return workflow;
    }

}