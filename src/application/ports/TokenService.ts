/**
 * Represents the minimum information included in an authentication token.
 * This model is agnostic to the technology used for signing/verifying (JWT, Paseto, etc.).
 */
export interface TokenPayload {
    userId: string;
    email: string;
    /**
     * User role within the system.
     * Ideally, it should align with the `UserRole` domain type.
     */
    role: "REQUESTER" | "AGENT" | "TECH" | "ADMIN";
}

/**
 * Service port for managing authentication tokens.
 * Defines the application layer interface, without relying on frameworks or libraries.
 */
export interface TokenService {
    /**
     * Digitally signs a payload and returns a token.
     * @param payload Data to be included in the token.
     * @param expiresIn Expiration time (e.g., “1h,” “7d”).
     * @returns Signed token as a string.
     */
    sign(payload: TokenPayload, expiresIn?: string): string;

    /**
     * Verifies and decodes a signed token.
     * @param token Token to verify.
     * @returns The original payload if the token is valid.
     * @throws Error if the token is invalid or has expired.
     */
    verify(token: string): TokenPayload;
}
