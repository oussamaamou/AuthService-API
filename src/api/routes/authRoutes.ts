import {Router} from "express";
import Authcontroller from "../controllers/authController.ts";
import Authmiddleware from "../middlewares/authMiddleware.ts";
import type { Request, Response } from "express";
import passport from "passport";
import { googleAuth, googleAuthCallback } from "../controllers/SSOController.ts";

class Authroutes{

    router : Router;
    
    constructor(){
        this.router = Router();
        this.setupRoutes();
    }

    private setupRoutes() : void{

        const authmiddleware : Authmiddleware = new Authmiddleware();

        this.router.post("/register", 
            authmiddleware.verifyRegisterInfos.bind(authmiddleware), 
            Authcontroller.buildRegister.bind(Authcontroller)
        );

        this.router.post("/login", 
            authmiddleware.verifyLoginInfos.bind(authmiddleware), 
            Authcontroller.buildLogin.bind(Authcontroller)
        ) ;
		
		this.router.get('/google', googleAuth);

		this.router.get('/google/callback', 
			passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure'}), 
			googleAuthCallback
		);
		
		this.router.get('/google/failure', (req: Request, res:Response) => {
			res.status(401).json({ error: 'Google authentication failed'}); 
		});

        this.router.get('/me', authmiddleware.protectRoute.bind(authmiddleware), (req: Request, res: Response) => {
            const user = (req as any).user;
            
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            
            res.status(200).json({ 
                userId: user._id.toString(), 
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role, 
                provider: user.provider, 
                isEmailVerified: user.isEmailVerified, 
                status: user.status 
            });
        });

		this.router.get('/profile', authmiddleware.protectRoute.bind(authmiddleware), (req: Request, res: Response) => {
			const user = (req as any).user;
			
			if (!user) {
				res.status(404).json({ error: 'User not found' });
				return;
			}
			
			res.status(200).json({ 
				profile: {
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					isEmailVerified: user.isEmailVerified,
					provider: user.provider,
                    status: user.status 
				}
			});
        });

        this.router.get("/2fa/toggle", 
            authmiddleware.isLoggedIn.bind(authmiddleware), 
            Authcontroller.buildToggle2Fa.bind(Authcontroller)
        );

        this.router.post("/login/2fa", 
            authmiddleware.verifyPartialLogIn.bind(authmiddleware), 
            Authcontroller.buildCheck2Fa.bind(Authcontroller)
        );

	}
}

export default Authroutes;
