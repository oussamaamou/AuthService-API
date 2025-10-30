import express from 'express';
import type { Application, Request, Response } from 'express';

export default class App {

    public app: Application;

    constructor() {
        this.app = express();
        this.app.use(express.json());
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() : void {
        this.app.use(express.json());
        
    }

    private setupRoutes() : void {
        this.app.get('/api/health', (req: Request, res: Response) => {
            res.status(200).json({ message: 'Server is running'});
        });
    }

    public getExpressApp(): Application {
        return this.app;
    }
}