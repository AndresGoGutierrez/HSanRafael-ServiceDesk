import type { UserRepository } from "../ports/UserRepository";
import type { PasswordHasher } from "../ports/PasswordHasher";
import type { TokenService } from "../ports/TokenService";
import type { LoginInput, LoginResponse } from "../dtos/auth";
import { Email } from "../../domain/value-objects/Email";

/**
 * Caso de uso: Autenticación de usuario.
 * 
 * Valida las credenciales de un usuario y genera un token JWT.
 */
export class AuthenticateUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenService: TokenService
    ) { }

    /**
     * Ejecuta el flujo de autenticación.
     */
    async execute(dto: LoginInput): Promise<LoginResponse> {
        // 1️⃣ Validar email con value object (si existe en tu dominio)
        const email = Email.from(dto.email);

        // 2️⃣ Buscar el usuario en la base de datos
        const user = await this.userRepository.findByEmail(email.toString());
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // 3️⃣ Verificar estado del usuario
        if (!user.isActive) {
            throw new Error("User account is deactivated");
        }

        // 4️⃣ Validar contraseña
        const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        // 5️⃣ Generar token
        const token = this.tokenService.sign({
            userId: user.id.toString(),
            email: user.email.toString(),
            role: user.role,
        });

        // 6️⃣ Retornar respuesta de autenticación
        return {
            token,
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email.toString(),
                role: user.role,
            },
        };
    }
}
