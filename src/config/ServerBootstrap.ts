import cors from "cors"
import express, { type Application, Router } from "express"
import morgan from "morgan"
import type pino from "pino"
import swaggerUi from "swagger-ui-express"
import { prismaClient } from "../infrastructure/db/prisma"
import { ConfigServer } from "./ConfigServer"
import { createLogger } from "./logger"
import { swaggerSpec } from "./swagger"

// Middlewares
import { BaseMiddleware } from "../interfaces/http/middlewares/validate"
import { AuthMiddleware } from "../interfaces/http/middlewares/auth.middleware"

// Infraestructura base
import { SystemClock } from "../infrastructure/time/SystemClock"
import { InMemoryEventBus } from "../infrastructure/events/InMemoryEventBus"
import { BcryptPasswordHasher } from "../infrastructure/security/BcryptPasswordHasher"
import { JWTTokenService } from "../infrastructure/security/JWTTokenService"

// Repositories
import { PrismaTicketRepository } from "../infrastructure/repositories/PrismaTicketRepository"
import { PrismaAreaRepository } from "../infrastructure/repositories/PrismaAreaRepository"
import { PrismaUserRepository } from "../infrastructure/repositories/PrismaUserRepository"
import { PrismaCommentRepository } from "../infrastructure/repositories/PrismaCommentRepository"
import { PrismaAttachmentRepository } from "../infrastructure/repositories/PrismaAttachmentRepository"
import { PrismaAuditRepository } from "../infrastructure/repositories/PrismaAuditRepository"

// Use Cases
import { CreateTicket } from "../application/use-cases/CreateTicket"
import { ListTickets } from "../application/use-cases/ListTicket"
import { GetTicketById } from "../application/use-cases/GetTicketById"
import { AssignTicket } from "../application/use-cases/AssignTicket"
import { TransitionTicketStatus } from "../application/use-cases/TransitionTicketStatus"
import { CreateArea } from "../application/use-cases/CreateArea"
import { UpdateArea } from "../application/use-cases/UpdateArea"
import { ListAreas } from "../application/use-cases/ListArea"
import { CreateUser } from "../application/use-cases/CreateUser"
import { UpdateUser } from "../application/use-cases/UpdateUser"
import { ListUsers } from "../application/use-cases/ListUsers"
import { AddComment } from "../application/use-cases/AddComment"
import { ListCommentsByTicket } from "../application/use-cases/ListCommentsByTicket"
import { AddAttachment } from "../application/use-cases/AddAttachment"
import { ListAttachmentsByTicket } from "../application/use-cases/ListAttachmentsByTicket"
import { AuthenticateUser } from "../application/use-cases/AuthenticateUser"
import { GetTicketAuditTrail } from "../application/use-cases/GetTicketAuditTrail"
import { ComputeSLAMetrics } from "../application/use-cases/ComputeSLAMetrics"
import { DeactivateUser } from "../application/use-cases/DeactivateUser"
import { DeactivateArea } from "../application/use-cases/DeactivateArea"




// Controllers
import { TicketController } from "../interfaces/controllers/TicketController"
import { AreaController } from "../interfaces/controllers/AreaController"
import { UserController } from "../interfaces/controllers/UserController"
import { CommentController } from "../interfaces/controllers/CommentController"
import { AttachmentController } from "../interfaces/controllers/AttachmentController"
import { AuthController } from "../interfaces/controllers/AuthController"
import { MetricsController } from "../interfaces/controllers/MetricsController"
import { AuditController } from "../interfaces/controllers/AuditController"

// Routers
import { TicketsRouter } from "../interfaces/http/routes/TicketRouter"
import { AreaRouter } from "../interfaces/http/routes/AreaRouter"
import { UserRouter } from "../interfaces/http/routes/UserRouter"
import { CommentRouter } from "../interfaces/http/routes/CommentRouter"
import { AttachmentRouter } from "../interfaces/http/routes/AttachmentRouter"
import { AuthRouter } from "../interfaces/http/routes/AuthRouter"
import { MetricsRouter } from "../interfaces/http/routes/MetricsRouter"
import { AuditRouter } from "../interfaces/http/routes/AuditRouter"
import { CloseTicket } from "../application/use-cases/CloseTicket"
import { DeleteAttachment } from "../application/use-cases/DeleteAttachment"
import { SLAController } from "../interfaces/controllers/SLAController"
import { ConfigureSLAUseCase } from "../application/use-cases/ConfigureSLAUseCase"
import { PrismaSLARepository } from "../infrastructure/repositories/PrismaSLARepository"
import { PrismaWorkflowRepository } from "../infrastructure/repositories/PrismaWorkflowRepository"
import { SLARouter } from "../interfaces/http/routes/SLARouter"
import { WorkflowController } from '../interfaces/controllers/WorkflowController';
import { ConfigureWorkflowUseCase } from "../application/use-cases/ConfigureWorkflowUseCase"
import { WorkflowRouter } from "../interfaces/http/routes/WorkflowRouter"
import { ListTicketsByAreaUseCase } from "../application/use-cases/ListTicketsByAreaUseCase"
import { ExportTicketHistoryUseCase } from "../application/use-cases/ExportTicketHistoryUseCase"

export class ServerBootstrap extends ConfigServer {
    private readonly _app: Application = express()
    private readonly _port: number
    private readonly _logger: pino.Logger

    constructor() {
        super()
        this._port = this.getNumberEnv("PORT")
        this._logger = createLogger(this.env)

        this.configureMiddleware()
        this.configureRoutes()

        console.log("Jeronimo")


        this.listen()
        this.handleShutdown()
    }

    /** Configure global server middleware */
    private configureMiddleware(): void {
        this._app.use(express.json())
        this._app.use(express.urlencoded({ extended: true }))
        this._app.use(cors())
        this._app.use(morgan("dev"))
        this._app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    }

    /** Configures the main routes with their dependencies */
    private configureRoutes(): void {
        const router = Router()
        const middleware = new BaseMiddleware()

        // Shared dependencies
        const clock = new SystemClock()
        const eventBus = new InMemoryEventBus()
        const passwordHasher = new BcryptPasswordHasher()
        const jwtSecret = String(this.getEnvironment("JWT_SECRET"))
        const tokenService = new JWTTokenService(jwtSecret)
        const authMiddleware = new AuthMiddleware(tokenService)

        // Repositories
        const ticketRepo = new PrismaTicketRepository()
        const areaRepo = new PrismaAreaRepository()
        const userRepo = new PrismaUserRepository()
        const commentRepo = new PrismaCommentRepository()
        const attachmentRepo = new PrismaAttachmentRepository()
        const auditRepo = new PrismaAuditRepository()
        const slaRepo = new PrismaSLARepository()
        const workflowRepo = new PrismaWorkflowRepository()

        // Auth
        const authenticateUser = new AuthenticateUser(userRepo, passwordHasher, tokenService)
        const authController = new AuthController(authenticateUser)
        router.use("/auth", new AuthRouter(authController).getRouter())

        // Tickets
        const ticketController = new TicketController(
            new CreateTicket(ticketRepo, areaRepo, slaRepo,clock, eventBus, auditRepo),
            new ListTickets(ticketRepo),
            new GetTicketById(ticketRepo),
            new AssignTicket(ticketRepo, clock, eventBus),
            new TransitionTicketStatus(ticketRepo, clock, eventBus),
            new CloseTicket(ticketRepo, auditRepo, eventBus, clock),
            new ExportTicketHistoryUseCase(ticketRepo, commentRepo, auditRepo, attachmentRepo)
        )
        router.use("/tickets", new TicketsRouter(ticketController, middleware, authMiddleware).getRouter())

        // Areas
        const areaController = new AreaController(
            new CreateArea(areaRepo, clock, eventBus),
            new UpdateArea(areaRepo, eventBus),
            new ListAreas(areaRepo),
            new DeactivateArea(areaRepo, ticketRepo, auditRepo, clock),
            new ListTicketsByAreaUseCase(ticketRepo, areaRepo)
        )
        router.use("/areas", new AreaRouter(areaController, middleware, authMiddleware).getRouter())

        // SLA

        const slaController = new SLAController(
            new ConfigureSLAUseCase(slaRepo, areaRepo, auditRepo, clock, eventBus)
        )

        router.use("/", new SLARouter(slaController, middleware, authMiddleware).getRouter())

        // WORKFLOW
        const workflowController = new WorkflowController(
            new ConfigureWorkflowUseCase(workflowRepo, areaRepo, auditRepo, clock, eventBus)
        )

        router.use("/", new WorkflowRouter(workflowController, middleware, authMiddleware).getRouter())

        // Users

        const userController = new UserController(
            new CreateUser(userRepo, clock, eventBus, passwordHasher),
            new UpdateUser(userRepo),
            new ListUsers(userRepo),
            new DeactivateUser(userRepo, auditRepo, clock)
        )
        router.use("/users", new UserRouter(userController, middleware, authMiddleware).getRouter())

        // Comments
        const commentController = new CommentController(
            new AddComment(commentRepo, clock, eventBus),
            new ListCommentsByTicket(commentRepo),
        )
        router.use("/", new CommentRouter(commentController, middleware, authMiddleware).getRouter())

        // Attachments
        const attachmentController = new AttachmentController(
            new AddAttachment(attachmentRepo, clock, eventBus),
            new ListAttachmentsByTicket(attachmentRepo),
            new DeleteAttachment(attachmentRepo, auditRepo, clock)
        )
        router.use("/", new AttachmentRouter(attachmentController, middleware, authMiddleware).getRouter())

        // Metrics
        const metricsController = new MetricsController(new ComputeSLAMetrics(ticketRepo))
        router.use("/metrics", new MetricsRouter(metricsController, authMiddleware).getRouter())

        // Audit
        router.use("/", new AuditRouter(new AuditController(new GetTicketAuditTrail(auditRepo)), authMiddleware).getRouter())


        this._app.use("/api", router)
    }

    /** Connect Prisma to the database */
    private async dbConnection(): Promise<void> {
        console.log("DB URL:", process.env.DATABASE_URL);
        try {
            await prismaClient.$connect()
            this._logger.info("✅ Prisma connected to the database")
        } catch (error) {
            this._logger.error({
                msg: "❌ Error connecting Prisma to the database",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            })
            throw error
        }
    }

    /** Listen to the configured port */
    public listen(): void {
        this._app.listen(this._port, async () => {
            this._logger.info(`🚀 Server listening on port ${this._port} in ${this.getEnvironment("NODE_ENV")} mode`)
            this._logger.info(`📚 Swagger: http://localhost:${this._port}/api-docs`)
            await this.dbConnection()
        })
    }

    /** Handles controlled shutdown of the server */
    private handleShutdown(): void {
        const disconnect = async (signal: string): Promise<void> => {
            await prismaClient.$disconnect()
            this._logger.info(`🧩 Prisma disconnected on ${signal}`)
            process.exit(0)
        }
        process.on("SIGINT", () => disconnect("SIGINT"))
        process.on("SIGTERM", () => disconnect("SIGTERM"))
    }
}
