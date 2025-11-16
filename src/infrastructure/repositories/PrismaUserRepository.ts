import { prismaClient } from "../db/prisma"
import { User } from "../../domain/entities/User"
import type { UserRepository } from "../../application/ports/UserRepository"
import type { RehydrateUserDto } from "../../application/dtos/user"

/**
 * Mapper to convert between the domain entity and the Prisma model.
 */
class UserMapper {
    static toPrisma(user: User) {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email.toString().toLowerCase(),
            password: user.password,
            role: user.role,
            areaId: user.areaId,
            isActive: user.isActive,
        }
    }

    static toDomain(record: any): User {
        return User.rehydrate({
            id: record.id,
            name: record.name,
            email: record.email,
            password: record.password,
            role: record.role,
            areaId: record.areaId,
            isActive: record.isActive,
            createdAt: record.createdAt,
        } as RehydrateUserDto)
    }
}

/**
 * Implementation of the user repository using Prisma.
 * Fulfills the application layer contract (UserRepository).
 */
export class PrismaUserRepository implements UserRepository {
    async save(user: User): Promise<void> {
        const data = UserMapper.toPrisma(user)

        await prismaClient.user.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                role: data.role,
                areaId: data.areaId,
                isActive: data.isActive,
            },
        })
    }

    async findById(id: string): Promise<User | null> {
        const record = await prismaClient.user.findUnique({ where: { id } })
        return record ? UserMapper.toDomain(record) : null
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalizedEmail = email.toLowerCase()
        const record = await prismaClient.user.findUnique({
            where: { email: normalizedEmail },
        })
        return record ? UserMapper.toDomain(record) : null
    }

    async list(): Promise<User[]> {
        const records = await prismaClient.user.findMany({
            orderBy: { createdAt: "desc" },
        })
        return records.map(UserMapper.toDomain)
    }
}
