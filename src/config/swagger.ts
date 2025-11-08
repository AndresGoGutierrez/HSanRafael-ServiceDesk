import "dotenv/config"
import swaggerJsdoc, { type Options } from "swagger-jsdoc"

/**
 * -----------------------------------------------------------------------------
 * 🌐 Swagger / OpenAPI Specification
 * -----------------------------------------------------------------------------
 * Genera la documentación OpenAPI de la API "Hospital Service Desk",
 * manteniendo independencia del entorno mediante variables de entorno (.env).
 * -----------------------------------------------------------------------------
 */

// Se obtiene la URL base desde .env o se usa un valor por defecto.
const apiBaseUrl =
    process.env.API_BASE_URL ||
    `http://localhost:${process.env.PORT || 8000}/api`

const env = process.env.NODE_ENV || "development"

const swaggerOptions: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Hospital Service Desk API",
            version: "1.0.0",
            description:
                "API de la mesa de servicios hospitalaria basada en Clean Architecture, con autenticación JWT, manejo de SLA y auditoría.",
            contact: {
                name: "Equipo de Soporte",
                email: "support@hospitalservicedesk.com",
            },
        },
        servers: [
            {
                url: apiBaseUrl,
                description:
                    env === "production"
                        ? "Servidor de producción"
                        : "Servidor de desarrollo",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Autenticación mediante token JWT",
                },
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        error: {
                            type: "string",
                            example: "Invalid credentials",
                        },
                    },
                },
                Ticket: {
                    type: "object",
                    required: [
                        "id",
                        "title",
                        "status",
                        "priority",
                        "requesterId",
                        "areaId",
                        "createdAt",
                    ],
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            example: "e6c29f7a-88d9-4e0e-81b8-123456789abc",
                        },
                        title: {
                            type: "string",
                            example: "Error en sistema de citas",
                        },
                        description: {
                            type: "string",
                            nullable: true,
                            example: "El sistema no permite crear una nueva cita",
                        },
                        status: {
                            type: "string",
                            enum: ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"],
                            example: "OPEN",
                        },
                        priority: {
                            type: "string",
                            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
                            example: "HIGH",
                        },
                        requesterId: { type: "string", format: "uuid" },
                        assigneeId: { type: "string", format: "uuid", nullable: true },
                        areaId: { type: "string", format: "uuid" },
                        slaTargetAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                        },
                        slaBreached: { type: "boolean", example: false },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },
                CreateArea: {
                    type: "object",
                    required: ["name"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Soporte Técnico",
                        },
                        description: {
                            type: "string",
                            example: "Área encargada de los procesos de soporte",
                            nullable: true,
                        },
                    },
                },
                UpdateArea: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string",
                            example: "Infraestructura",
                        },
                        description: {
                            type: "string",
                            example: "Área relacionada con servidores y redes",
                            nullable: true,
                        },
                    },
                },
                Area: {
                    type: "object",
                    required: ["id", "name", "isActive"],
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string", example: "Soporte Técnico" },
                        description: { type: "string", nullable: true },
                        isActive: { type: "boolean", example: true },
                        slaResponseMinutes: { type: "number", nullable: true, example: 30 },
                        slaResolutionMinutes: { type: "number", nullable: true, example: 240 },
                    },
                },
                User: {
                    type: "object",
                    required: ["id", "name", "email", "role", "isActive"],
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string", example: "Juan Pérez" },
                        email: {
                            type: "string",
                            format: "email",
                            example: "juan.perez@hospital.com",
                        },
                        role: {
                            type: "string",
                            enum: ["REQUESTER", "AGENT", "TECH", "ADMIN"],
                            example: "AGENT",
                        },
                        isActive: { type: "boolean", example: true },
                    },
                },
                CreateUser: {
                    type: "object",
                    required: ["name", "email", "password", "role"],
                    properties: {
                        name: {
                            type: "string",
                            example: "Andrés Gómez",
                            description: "Nombre completo del usuario",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "andres.gomez@example.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "MiClaveSegura123",
                        },
                        role: {
                            type: "string",
                            enum: ["REQUESTER", "AGENT", "TECH", "ADMIN"],
                            example: "ADMIN",
                        },
                        areaId: {
                            type: "string",
                            format: "uuid",
                            nullable: true,
                            example: "c2b4e0f4-8d12-4c0f-94fb-8a81db7c8b75",
                        },
                    },
                },
                UpdateUser: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "Juan Pérez" },
                        email: {
                            type: "string",
                            format: "email",
                            example: "juan.perez@hospital.com",
                        },
                        password: {
                            type: "string",
                            format: "password",
                            example: "NuevaClave123",
                        },
                        role: {
                            type: "string",
                            enum: ["REQUESTER", "AGENT", "TECH", "ADMIN"],
                            example: "AGENT",
                        },
                        areaId: {
                            type: "string",
                            format: "uuid",
                            nullable: true,
                            example: "b81d6c91-84a2-4d43-b611-3ef77b2a6a9f",
                        },
                    },
                },
                
            },
        },

        security: [{ bearerAuth: [] }],
    },
    // Escanea todos los routers donde se definen endpoints
    apis: ["./src/interfaces/http/routes/**/*.ts"],
}

/**
 * Exporta la especificación lista para usar en swagger-ui-express
 */
export const swaggerSpec = swaggerJsdoc(swaggerOptions)
