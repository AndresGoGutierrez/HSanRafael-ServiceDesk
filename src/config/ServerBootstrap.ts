import cors from "cors";
import express, { Application, Router } from "express";
import morgan from "morgan";
import pino from "pino";
import { prismaClient } from "../infrastructure/db/prisma";
import { ConfigServer } from "./ConfigServer";
import { createLogger } from "./logger";

export class ServerBootstrap extends ConfigServer {
    private _app: Application = express();
    private _port: number;
    private _logger: pino.Logger;

    constructor() {
        super();
        this._port = this.getNumberEnv("PORT");
        this._logger = createLogger(this.env);

        this.configureMiddleware();

        this._app.use("/api", this._routers);

        this.listen();

        this.handleShutdown();
    }

    private handleShutdown(): void {
        process.on("SIGINT", async () => {
            await prismaClient.$disconnect();
            this._logger.info("Prisma disconnected on SIGINT");
            process.exit(0);
        });
        process.on("SIGTERM", async () => {
            await prismaClient.$disconnect();
            this._logger.info("Prisma disconnected on SIGTERM");
            process.exit(0);
        });
    }

    private configureMiddleware(): void {
        this._app.use(express.json());
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(cors());
        this._app.use(morgan("dev"));
    }

    public listen(): void {
        this._app.listen(this._port, async () => {
            this._logger.info(
                `Server listen on port: ${this._port} in ${this.getEnvironment("NODE_ENV")} mode`,
            );
            this._logger.info(`http://localhost:${this._port}`);

            await this.dbConnection();
        });
    }

    private async dbConnection(): Promise<void> {
        try {
            await prismaClient.$connect();
            this._logger.info("Prisma connected to the database");
        } catch (error) {
            this._logger.error({
                msg: "Error connecting Prisma to the database",
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }

    private _routers = (): Router[] => {
        return [];
    };
}
