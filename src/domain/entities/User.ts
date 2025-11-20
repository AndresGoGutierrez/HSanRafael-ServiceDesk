import { UserId } from "../value-objects/UserId"
import { Email } from "../value-objects/Email"
import { BaseEntity } from "./BaseEntity"

/**
 * Permitted roles within the system.
 */
export type UserRole = "REQUESTER" | "AGENT" | "TECH" | "ADMIN"

/**
 * Data required to create a new user.
 */
export interface CreateUserInput {
    name: string
    email: string
    password: string
    role: UserRole
    areaId?: string
}

/**
 * DTO used to reconstruct a user from a persistent source (e.g., the database).
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
 * Domain entity: User
 * Represents a system user with their role, area, and active status.
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

    // ==== Public getters (immutable outside the domain) ====

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

    // ==== Static factories ====

    /**
     * Creates a new user within the domain.
     * It is assumed that the password has already been hashed in the application layer.
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
     * Restores a user from persistent storage (e.g., the database).
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

    // ==== Domain behaviors ====

    /**
     * Deactivates the user in the domain.
     * Does not delete their record, only changes their status.
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
     * Updates the user profile within the domain.
     * Does not change the password or email address.
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
            return 
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
