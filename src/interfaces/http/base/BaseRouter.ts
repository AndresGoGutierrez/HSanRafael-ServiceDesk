import { Router } from "express";

/**
 * Clase base genérica para Routers HTTP.
 * No ejecuta `routes()` automáticamente para permitir inicialización completa en subclases.
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

    /** Método abstracto a implementar por subclases. */
    protected routes(): void {}

    /** Devuelve el router de Express configurado. */
    public getRouter(): Router {
        return this.router;
    }
}
