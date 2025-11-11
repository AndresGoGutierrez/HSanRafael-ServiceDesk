import type { WorkflowRepository } from "../../application/ports/WorkflowRepository"
import type { RehydrateWorkflowDto } from "../../domain/entities/Workflow"
import { Workflow } from "../../domain/entities/Workflow"
import { prismaClient } from "../db/prisma"

/**
 * Mapper responsable de convertir entre:
 *  - Entidad de dominio `Workflow`
 *  - Modelo Prisma (`workflow` table)
 *  - DTO de salida (para respuestas HTTP)
 *
 * Su propósito es aislar el dominio de la infraestructura.
 */
export class WorkflowMapper {
    /**
     * Convierte una entidad de dominio `Workflow` a formato Prisma.
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
     * Restaura una entidad de dominio `Workflow` desde un registro de base de datos.
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
     * Convierte una entidad de dominio `Workflow` a un objeto de respuesta serializable.
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
 * Implementación del repositorio de `Workflow` usando Prisma ORM.
 *
 * Encapsula el acceso a la base de datos y asegura que
 * el dominio no dependa de detalles de infraestructura.
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
            if (error.code === "P2025") return // Registro no encontrado
            throw new Error(`Error eliminando Workflow con id ${id}: ${error.message}`)
        }
    }
}