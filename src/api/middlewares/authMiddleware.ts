import type {NextFunction ,Request, Response } from "express";
import  Jwt  from "jsonwebtoken";
import passport from "passport";

class Authmiddleware{
    secretKey  : string;

    constructor(){
        this.secretKey = process.env.JWT_SECRET || "";
        if (!this.secretKey){
            throw new Error("JWT_SECRET is missing in environment variables");
        }
    }

    public isLoggedIn(req : Request, res : Response, next : NextFunction) {
        if (!req.headers.authorization){
            res.status(401).json({error : "No authorization header provided"}); 
            return;
        }

        const token : string = req.headers.authorization?.split(" ")[1] || "";
        
        if(token){
            try {
                const payload = Jwt.verify(token, this.secretKey) as any;

                if (payload.twoFa){
                    res.status(401).json({
                        error : "2FA verification required. Please complete 2FA at /auth/login/2fa"
                    });
                    return;
                }

                res.locals.payload = payload;
                next();
                return;

            } catch (error) {
                res.status(401).json({
                    error : "Invalid or expired token",
                    details: error instanceof Error ? error.message : "Unknown error"
                });
                return;
            }
        }

        res.status(401).json({error: "Token not provided"});
    }

    public verifyPartialLogIn (req : Request, res : Response, next : NextFunction){
        if (!req.headers.authorization){
            res.status(401).json({error : "No authorization header provided"});
            return;
        }

        const token : string = req.headers.authorization?.split(" ")[1] || "";

        if(token){
            try {
                const payload = Jwt.verify(token, this.secretKey) as any;
                res.locals.payload = payload;
                next();
                return;
            } catch (error) {
                res.status(401).json({
                    error : "Invalid or expired 2FA token",
                    details: error instanceof Error ? error.message : "Unknown error"
                });
                return;
            }
        }

        res.status(401).json({error: "Token not provided"});
    }

    public verifyLoginInfos(req : Request, res : Response, next : NextFunction){
        if (!req.body){
            res.status(400).json({error : "Request body is empty"});
            return;
        }

        if(!req.body["email"] || !req.body["password"]){
            res.status(400).json({error : "Email and password are required"});
            return;
        }

        const emailRegex : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValidation : boolean = emailRegex.test(req.body.email);

        if(!emailValidation){
            res.status(400).json({error : "Invalid email format"});
            return;
        }

        next();
    }

    public verifyRegisterInfos(req : Request, res : Response, next : NextFunction) : void{
        if (!req.body){
            res.status(400).json({error : "Request body is empty"});
            return;
        }

        if(!req.body["first-name"] || !req.body["last-name"] || !req.body["password"] || !req.body["email"]){
            res.status(400).json({error : "All fields are required (first-name, last-name, email, password)"});
            return;
        }

        const emailRegex : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValidation : boolean = emailRegex.test(req.body.email);

        if(!emailValidation){
            res.status(400).json({error : "Invalid email format"});
            return;
        }

        next();
    }

    public protectRoute(req: Request, res: Response, next: NextFunction) {
        return passport.authenticate(
            'jwt',
            { session: false },
            (err: any, user: any) => {
                if (err) return next(err);

                if (!user) {
                    res.status(401).json({ error: 'Unauthorized - Invalid token' }); 
                    return;
                }

                (req as any).user = user;
                next();
            }
        )(req, res, next);
    }
}

export default Authmiddleware;