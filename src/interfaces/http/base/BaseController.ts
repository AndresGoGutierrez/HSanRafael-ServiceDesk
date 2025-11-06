import { Request, Response } from "express";

export abstract class BaseController {
    abstract create ( req: Request, res: Response ): Promise<unknown>;
    abstract list ( req: Request, res: Response ): Promise<unknown>;
    abstract getById ( req: Request, res: Response ): Promise<unknown>;
}
