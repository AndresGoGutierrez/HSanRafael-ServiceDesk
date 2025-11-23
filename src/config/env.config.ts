import { z } from "zod";
//import en from "zod/v4/locales/en.js";

const envSchema = z.object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    JWT_SECRET: z.string().min(8),

    DB_DATABASE: z.string().optional(),
    DB_USERNAME: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_HOST: z.string().default("localhost").optional(),
    DB_PORT: z.coerce.number().optional(),

    PGADMIN_DEFAULT_EMAIL: z.email().optional(),
    PGADMIN_DEFAULT_PASSWORD: z.string().min(8).optional(),

    DATABASE_URL: z.string().url().or(z.string()),
});

export type EnvVariables = z.infer<typeof envSchema>;

export function loadEnv(): EnvVariables {
    return envSchema.parse(process.env);
}
