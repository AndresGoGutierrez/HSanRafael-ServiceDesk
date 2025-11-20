import type { UserRepository } from "../ports/UserRepository";
import type { PasswordHasher } from "../ports/PasswordHasher";
import type { TokenService } from "../ports/TokenService";
import type { LoginInput, LoginResponse } from "../dtos/auth";
import { Email } from "../../domain/value-objects/Email";

/**
 * Use case: User authentication.
 * 
 * Validates a user's credentials and generates a JWT token.
 */
export class AuthenticateUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenService: TokenService,
    ) {}

    /**
     * Executes the authentication flow.
     */
    async execute(dto: LoginInput): Promise<LoginResponse> {
        // Validate email with value object (if it exists in your domain)
        const email = Email.from(dto.email);

        //Search for the user in the database
        const user = await this.userRepository.findByEmail(email.toString());
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Check user status
        if (!user.isActive) {
            throw new Error("User account is deactivated");
        }

        //  Validate password
        const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        //  Generate token
        const token = this.tokenService.sign({
            userId: user.id.toString(),
            email: user.email.toString(),
            role: user.role,
        });

        // Return authentication response
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
