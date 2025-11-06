import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

type Where = "body" | "query" | "params";

export class BaseMiddleware {
    public validate = (where: Where, schema: ZodType): RequestHandler => {
        return (req, res, next) => {
            const result = schema.safeParse((req as any)[where]);

            if (!result.success) {
                return res.status(400).json({ errors: z.treeifyError(result.error) })
            }
            Object.assign((req as any)[where], result.data);

            next();
        }
    }
}