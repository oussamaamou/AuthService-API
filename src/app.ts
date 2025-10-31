import express from 'express';
import type { Application, Request, Response } from 'express';
import Authroutes from './api/routes/authRoutes.ts';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import configurePassport from './config/passport.ts';

export default class App {

    public app: Application;
    public authroutes: Authroutes;

    constructor() {
        this.app = express();
        this.authroutes = new Authroutes();
        this.setupMiddleware();
        this.setupRoutes();
    }

    private setupMiddleware() : void {

        this.app.use(express.json());
        this.app.use(cookieParser());

        this.app.use(
            session({
                secret: process.env.SECRET_KEY || '',
                resave: false,
                saveUninitialized: false,
                cookie: { secure: false }, 
            })
        );

        this.app.use(passport.initialize());
        this.app.use(passport.session());

        configurePassport();
        
    }

    private setupRoutes() : void {

        this.app.get('/api/health', (req: Request, res: Response) => {
            res.status(200).json({ 
                status: 'healthy',
                service: 'auth-service'
            });
        });

        this.app.use(("/api/auth"), this.authroutes.router);
    }

    public getExpressApp(): Application {
        return this.app;
    }
}