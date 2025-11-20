import { Router } from "express";

/**
 * Generic base class for HTTP Routers.
 * Does not automatically execute `routes()` to allow complete initialization in subclasses.
 */
export class BaseRouter<C, M> {
    public readonly router: Router;
    protected readonly controller: C;
    protected readonly middleware: M;

    constructor(controller: C, middleware: M) {
        this.router = Router();
        this.controller = controller;
        this.middleware = middleware;

    }

    /** Abstract method to be implemented by subclasses. */
    protected routes(): void {}

    /** Returns the configured Express router. */
    public getRouter(): Router {
        return this.router;
    }
}
