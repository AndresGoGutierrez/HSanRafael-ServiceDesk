import { prismaClient } from "../db/prisma";
import { User } from "../../domain/entities/User";
import type { UserRepository } from "../../application/ports/UserRepository";
import type { RehydrateUserDto } from "../../application/dtos/user";

/**
 * Mapper to convert between the domain entity and the Prisma model.
 */
class UserMapper {
    static toPrisma(user: User): {
        id: string;
        name: string;
        email: string;
        password: string;
        role: string;
        areaId: string | null;
        isActive: boolean;
    } {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email.toString().toLowerCase(),
            password: user.password,
            role: user.role,
            areaId: user.areaId,
            isActive: user.isActive,
        };
    }

    static toDomain(record: unknown): User {
        const r = record as Record<string, unknown>;
        return User.rehydrate({
            id: r.id as string,
            name: r.name as string,
            email: r.email as string,
            password: r.password as string,
            role: r.role as string,
            areaId: (r.areaId as string) ?? null,
            isActive: (r.isActive as boolean) ?? false,
            createdAt: r.createdAt as Date,
        } as RehydrateUserDto);
    }
}

/**
 * Implementation of the user repository using Prisma.
 * Fulfills the application layer contract (UserRepository).
 */
export class PrismaUserRepository implements UserRepository {
    async save(user: User): Promise<void> {
        const data = UserMapper.toPrisma(user);

        await prismaClient.user.upsert({
            where: { id: data.id },
            create: data,
            update: {
                name: data.name,
                role: data.role,
                areaId: data.areaId,
                isActive: data.isActive,
            },
        });
    }

    async findById(id: string): Promise<User | null> {
        const record = await prismaClient.user.findUnique({ where: { id } });
        return record ? UserMapper.toDomain(record) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const normalizedEmail = email.toLowerCase();
        const record = await prismaClient.user.findUnique({
            where: { email: normalizedEmail },
        });
        return record ? UserMapper.toDomain(record) : null;
    }

    async list(): Promise<User[]> {
        const records = await prismaClient.user.findMany({
            orderBy: { createdAt: "desc" },
        });
        return records.map(UserMapper.toDomain);
    }
}
