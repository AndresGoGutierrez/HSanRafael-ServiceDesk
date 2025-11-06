import { Router } from "express";

export class BaseRouter<C, M> {
    public router: Router;
    protected controller: C;
    protected middleware: M;

    constructor(controller: C, middleware: M) {
        this.router = Router();
        this.controller = controller;
        this.middleware = middleware;

        this.routes();
    }

    protected routes(): void { }
}