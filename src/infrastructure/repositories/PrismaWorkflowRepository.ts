import type { WorkflowRepository } from "../../application/ports/WorkflowRepository"
import type { RehydrateWorkflowDto } from "../../domain/entities/Workflow"
import { Workflow } from "../../domain/entities/Workflow"
import { prismaClient } from "../db/prisma"

/**
 * Mapper responsible for converting between:
 *  - `Workflow` domain entity
 *  - Prisma model (`workflow` table)
 *  - Output DTO (for HTTP responses)
 *
 * Its purpose is to isolate the domain from the infrastructure.
 */
export class WorkflowMapper {
    /**
     * Converts a `Workflow` domain entity to Prisma format.
     */
    static toPrisma(workflow: Workflow) {
        return {
            id: workflow.id.toString(),
            areaId: workflow.areaId.toString(),
            transitions: workflow.transitions,
            requiredFields: workflow.requiredFields,
            createdAt: workflow.createdAt,
            updatedAt: workflow.updatedAt,
        }
    }

    /**
     * Restores a `Workflow` domain entity from a database record.
     */
    static toDomain(record: any): Workflow {
        const dto: RehydrateWorkflowDto = {
            id: record.id,
            areaId: record.areaId,
            transitions: record.transitions,
            requiredFields: record.requiredFields,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        }
        return Workflow.rehydrate(dto)
    }

    /**
     * Converts a `Workflow` domain entity to a serializable response object.
     */
    static toResponse(workflow: Workflow) {
        return {
            id: workflow.id.toString(),
            areaId: workflow.areaId.toString(),
            transitions: workflow.transitions,
            requiredFields: workflow.requiredFields,
            createdAt: workflow.createdAt.toISOString(),
            updatedAt: workflow.updatedAt.toISOString(),
        }
    }
}

/**
 * Implementation of the `Workflow` repository using Prisma ORM.
 *
 * Encapsulates database access and ensures that
 * the domain does not depend on infrastructure details.
 */
export class PrismaWorkflowRepository implements WorkflowRepository {
    async save(workflow: Workflow): Promise<void> {
        const data = WorkflowMapper.toPrisma(workflow)

        await prismaClient.workflow.upsert({
            where: { id: data.id },
            create: data,
            update: {
                transitions: data.transitions,
                requiredFields: data.requiredFields,
                updatedAt: data.updatedAt,
            },
        })
    }

    async findById(id: string): Promise<Workflow | null> {
        const row = await prismaClient.workflow.findUnique({ where: { id } })
        return row ? WorkflowMapper.toDomain(row) : null
    }

    async findByAreaId(areaId: string): Promise<Workflow[]> {
        const rows = await prismaClient.workflow.findMany({
            where: { areaId },
            orderBy: { createdAt: "desc" },
        })
        return rows.map((row) => WorkflowMapper.toDomain(row))
    }

    async findLatestByAreaId(areaId: string): Promise<Workflow | null> {
        const row = await prismaClient.workflow.findFirst({
            where: { areaId },
            orderBy: { createdAt: "desc" },
        })
        return row ? WorkflowMapper.toDomain(row) : null
    }

    async listAll(): Promise<Workflow[]> {
        const rows = await prismaClient.workflow.findMany({
            orderBy: { createdAt: "desc" },
        })
        return rows.map((row) => WorkflowMapper.toDomain(row))
    }

    async deleteById(id: string): Promise<void> {
        try {
            await prismaClient.workflow.delete({ where: { id } })
        } catch (error: any) {
            if (error.code === "P2025") return 
            throw new Error(`Error eliminando Workflow con id ${id}: ${error.message}`)
        }
    }
}