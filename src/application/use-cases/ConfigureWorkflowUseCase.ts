import type { WorkflowRepository } from "../ports/WorkflowRepository";
import type { AreaRepository } from "../ports/AreaRepository";
import type { AuditRepository } from "../ports/AuditRepository";
import type { Clock } from "../ports/Clock";
import type { EventBus } from "../ports/EventBus";
import { Workflow } from "../../domain/entities/Workflow";
import { AuditTrail } from "../../domain/entities/AuditTrail";
import { UserId } from "../../domain/value-objects/UserId";
import { CreateWorkflowSchema, type CreateWorkflowDto } from "../dtos/workflow";

/**
 * Use case: Configure the workflow for an area.
 *
 * Responsibilities:
 * - Validate the entry with Zod.
 * - Verify the existence of the area.
 * - Create a new workflow (keeping a version history).
 * - Record changes in the AuditTrail.
 * - Publish domain events.
 */
export class ConfigureWorkflowUseCase {
    constructor(
        private readonly workflowRepository: WorkflowRepository,
        private readonly areaRepository: AreaRepository,
        private readonly auditRepository: AuditRepository,
        private readonly clock: Clock,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * Executes the configuration of a Workflow for an area.
     * @param areaId Identifier of the area.
     * @param input Workflow configuration data.
     * @param actorId Identifier of the user performing the action.
     * @returns The newly created `Workflow` entity.
     * @throws Error if the area does not exist or validation fails.
     */
    async execute(areaId: string, input: CreateWorkflowDto, actorId: string): Promise<Workflow> {
        // Input validation with Zod
        const validatedInput = CreateWorkflowSchema.parse(input);

        // Verify existence of the area
        const area = await this.areaRepository.findById(areaId);
        if (!area) {
            throw new Error(`Area not found: ${areaId}`);
        }

        const now = this.clock.now();

        // -----------------------------------------------------
        // Custom workflow validation
        // -----------------------------------------------------

        const transitions = validatedInput.transitions;

        // Extract source states
        const fromStates = Object.keys(transitions);

        // Extract destination states
        const toStates = Array.from(new Set(Object.values(transitions).flat()));

        // Complete list of states
        const allStates = new Set([...fromStates, ...toStates]);

        // A) Validate transitions
        for (const [state, nextStates] of Object.entries(transitions)) {
            for (const next of nextStates) {
                if (!allStates.has(next)) {
                    throw new Error(`Invalid workflow: state "${next}" is not defined as a transition key or value`);
                }
            }
        }

        // B) Validate requiredFields
        if (validatedInput.requiredFields) {
            for (const state of Object.keys(validatedInput.requiredFields)) {
                if (!allStates.has(state)) {
                    throw new Error(`Invalid requiredFields: state "${state}" does not exist in transitions`);
                }
            }
        }

        // -----------------------------------------------------
        // Get previous workflow
        // -----------------------------------------------------

        const previousWorkflow = await this.workflowRepository.findLatestByAreaId(areaId);

        // -----------------------------------------------------
        // Create workflow
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
        // Audit
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
        // Publish events
        // -----------------------------------------------------

        await this.eventBus.publishAll(workflow.pullDomainEvents());

        return workflow;
    }

}
