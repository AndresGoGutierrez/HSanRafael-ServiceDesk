import { EnvVariables, loadEnv } from "./env.config";
import * as dotenv from "dotenv";
import path from "path";

export abstract class ConfigServer {
    public readonly env: EnvVariables;

    constructor() {
        // Determine the environment
        const nodeEnv = this.nodeEnv;

        // Use .env by default in development
        const envFile =
            nodeEnv && nodeEnv !== "production"
                ? path.resolve(process.cwd(), ".env")
                : path.resolve(process.cwd(), `.${nodeEnv}.env`);

        // Load environment variables
        dotenv.config({ path: envFile });

        // Typed variable load
        this.env = loadEnv();
    }

    protected getEnvironment(key: keyof typeof this.env): string | number | undefined {
        return this.env[key];
    }

    protected getNumberEnv(key: keyof typeof this.env): number {
        const value = this.env[key];

        if (value === undefined || value === null || value === "") {
            throw new Error(`Environment variable ${String(key)} is required but was not provided`);
        }

        return Number(value);
    }


    protected get nodeEnv(): string {
        // return env.NODE_ENV?.trim() || "";
        return process.env["NODE_ENV"]?.trim() || "";
    }

    protected get databaseUrl(): string {
        const url = this.getEnvironment("DATABASE_URL");
        if (!url) {
            throw new Error("DATABASE_URL is required but was not provided");
        }
        return url.toString();
    }


    protected createPathEnv(path: string): string {
        const arrayEnv: string[] = ["env"];

        if (path.length) {
            const stringToArray: string[] = path.split(".");
            arrayEnv.unshift(...stringToArray);
        }
        return `.${arrayEnv.join(".")}`;
    }
}
