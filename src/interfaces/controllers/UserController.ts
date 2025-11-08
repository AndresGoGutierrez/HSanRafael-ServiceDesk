import type { Request, Response } from "express";
import type { CreateUser } from "../../application/use-cases/CreateUser";
import type { UpdateUser } from "../../application/use-cases/UpdateUser";
import type { ListUsers } from "../../application/use-cases/ListUsers";

import { CreateUserSchema, UpdateUserSchema } from "../../application/dtos/user";
import { UserMapper } from "../mappers/UserMapper";
import { ZodError } from "zod";

/**
 * Controlador HTTP para la entidad User.
 * Actúa como un adaptador entre Express y los casos de uso.
 */
export class UserController {
    constructor(
        private readonly createUser: CreateUser,
        private readonly updateUser: UpdateUser,
        private readonly listUsers: ListUsers
    ) { }

    async create(req: Request, res: Response): Promise<void> {
        try {
            // 1️⃣ Validación de entrada
            const dto = CreateUserSchema.parse(req.body);

            // 2️⃣ Ejecutar caso de uso
            const user = await this.createUser.execute(dto);

            // 3️⃣ Mapear entidad a DTO HTTP
            res.status(201).json({
                success: true,
                message: "Usuario creado exitosamente",
                data: UserMapper.toHttp(user),
            });
        } catch (error) {
            this.handleError(res, error, "Error al crear el usuario");
        }
    }

    async update(req: Request, res: Response): Promise<void> {
        try {
            const dto = UpdateUserSchema.parse(req.body);
            const user = await this.updateUser.execute(req.params.id, dto);

            res.status(200).json({
                success: true,
                message: "Usuario actualizado correctamente",
                data: UserMapper.toHttp(user),
            });
        } catch (error) {
            this.handleError(res, error, "Error al actualizar el usuario");
        }
    }

    async list(_: Request, res: Response): Promise<void> {
        try {
            const users = await this.listUsers.execute();

            res.status(200).json({
                success: true,
                message: "Usuarios obtenidos correctamente",
                data: users.map(UserMapper.toHttp),
            });
        } catch (error) {
            this.handleError(res, error, "Error al listar los usuarios");
        }
    }

    /**
     * Manejo centralizado de errores y validaciones.
     */
    private handleError(res: Response, error: unknown, fallback: string): void {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                error: "Datos inválidos",
                details: error.issues.map(issue => issue.message),
            });
            return;
        }

        if (error instanceof Error) {
            res.status(400).json({
                success: false,
                error: error.message || fallback,
            });
            return;
        }

        console.error("[UserController] Error inesperado:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor",
        });
    }
}
