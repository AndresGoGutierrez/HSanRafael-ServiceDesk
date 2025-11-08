import { UserId } from "../value-objects/UserId"
import { Email } from "../value-objects/Email"
import { BaseEntity } from "./BaseEntity"

/**
 * Roles permitidos dentro del sistema.
 */
export type UserRole = "REQUESTER" | "AGENT" | "TECH" | "ADMIN"

/**
 * Datos requeridos para crear un nuevo usuario.
 */
export interface CreateUserInput {
    name: string
    email: string
    password: string
    role: UserRole
    areaId?: string
}

/**
 * DTO usado para reconstruir un usuario desde una fuente persistente (por ejemplo, la base de datos).
 */
export interface RehydrateUserDto {
    id: string
    name: string
    email: string
    password?: string
    role: UserRole
    areaId?: string | null
    isActive: boolean
    createdAt: Date
}

/**
 * Entidad del dominio: User
 * Representa un usuario del sistema con su rol, área y estado activo.
 */
export class User extends BaseEntity<UserId> {
    private constructor(
        id: UserId,
        private _name: string,
        private _email: Email,
        private _password: string,
        private _role: UserRole,
        private _areaId: string | null,
        private _isActive: boolean,
        createdAt: Date,
    ) {
        super(id, createdAt)
    }

    // ==== Getters públicos (inmutables fuera del dominio) ====

    get name(): string {
        return this._name
    }

    get email(): Email {
        return this._email
    }

    get password(): string {
        return this._password
    }

    get role(): UserRole {
        return this._role
    }

    get areaId(): string | null {
        return this._areaId
    }

    get isActive(): boolean {
        return this._isActive
    }

    // ==== Fábricas estáticas ====

    /**
     * Crea un nuevo usuario dentro del dominio.
     * Se asume que el password ya fue hasheado en la capa de aplicación.
     */
    public static create(dto: CreateUserInput, hashedPassword: string, now: Date): User {
        const trimmedName = dto.name.trim()
        const email = Email.create(dto.email)

        const user = new User(
            UserId.new(),
            trimmedName,
            email,
            hashedPassword,
            dto.role,
            dto.areaId ?? null,
            true,
            now,
        )

        user.recordEvent({
            type: "user.created",
            occurredAt: now,
            payload: {
                id: user.id.toString(),
                email: user.email.toString(),
                role: user.role,
            },
        })

        return user
    }

    /**
     * Restaura un usuario desde un registro persistente (por ejemplo, la base de datos).
     */
    public static rehydrate(row: RehydrateUserDto): User {
        return new User(
            UserId.from(row.id),
            row.name.trim(),
            Email.create(row.email),
            row.password ?? "",
            row.role,
            row.areaId ?? null,
            row.isActive,
            new Date(row.createdAt),
        )
    }

    // ==== Comportamientos del dominio ====

    /**
     * Desactiva al usuario en el dominio.
     * No elimina su registro, solo cambia su estado.
     */
    public deactivate(now: Date): void {
        if (!this._isActive) return
        this._isActive = false

        this.recordEvent({
            type: "user.deactivated",
            occurredAt: now,
            payload: { id: this.id.toString(), email: this._email.toString() },
        })
    }

    /**
     * Actualiza el perfil del usuario dentro del dominio.
     * No modifica la contraseña ni el correo.
     */
    public updateProfile(
        name?: string,
        role?: UserRole,
        areaId?: string | null,
        now: Date = new Date(),
    ): void {
        const hasNameChange = name !== undefined && name.trim() !== this._name
        const hasRoleChange = role !== undefined && role !== this._role
        const hasAreaChange = areaId !== undefined && areaId !== this._areaId

        if (!hasNameChange && !hasRoleChange && !hasAreaChange) {
            return // No hay cambios
        }

        if (name !== undefined) this._name = name.trim()
        if (role !== undefined) this._role = role
        if (areaId !== undefined) this._areaId = areaId

        this.recordEvent({
            type: "user.updated",
            occurredAt: now,
            payload: {
                id: this.id.toString(),
                name: this._name,
                role: this._role,
                areaId: this._areaId,
            },
        })
    }
}
