import type { Request, Response } from "express";
import GlobalUserModel from "../../models/GlobalUser.ts";
import Registerservice from "../services/registerService.ts";
import Loginservice from "../services/loginService.ts";

class AuthController{
    firstName : string;
    lastName : string;
    email : string;
    password : string;

    constructor(email = "", password = "", firstName = "",  lastName = ""){
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public async login(res : Response){
        const loginservice : Loginservice = new Loginservice(
            this.email, 
            this.password);
    
        const result = await loginservice.login();

        if ('error' in result) {
            res.status(result.status || 401).json({ error: result.error });
            return;
        }

        res.status(200).json(result);
    }

    public async login2fa(req : Request, res : Response){
        const loginService = new Loginservice();
        const result = await loginService.login2Fa(res.locals.payload, req.body.code);

        if ('error' in result) {
            res.status(result.status || 401).json({ error: result.error });
            return;
        }

        res.status(200).json(result);
    }

    public async toggle2Fa(req : Request, res : Response){
        const user = await GlobalUserModel.findOne({email : this.email});
        
        if (!user){
            res.status(404).json({error : `User not found`}); 
            return;
        }

        const newStatus = !user.twoFactorEnabled;
        user.twoFactorEnabled = newStatus;
        await user.save();

        const message = newStatus ? "2FA enabled" : "2FA disabled";
        res.status(200).json({ message });
    }

    public async register(res : Response){

        const existingUser = await GlobalUserModel.findOne({email : this.email});
        if(existingUser){
            res.status(409).json({error : "Email already registered"});
            return;
        }

        const registerservice : Registerservice = new Registerservice(
            this.email, 
            this.password, 
            this.firstName, 
            this.lastName);
        
        const result = await registerservice.register();

        res.status(201).json({
            message: "Registration successful",
            user: result
        });
    }

    static buildRegister(req : Request, res : Response){
        const instance : AuthController = new AuthController(
            req.body["email"], 
            req.body["password"],
            req.body["first-name"], 
            req.body["last-name"])
        
        instance.register(res);
    }

    static buildLogin(req : Request, res : Response){
        const instance : AuthController = new AuthController(
            req.body["email"], 
            req.body["password"],
        )
        
        instance.login(res);
    }

    static buildToggle2Fa(req : Request, res : Response){
        const instance : AuthController = new AuthController(res.locals.payload.email);
        return instance.toggle2Fa(req, res);
    }

    static buildCheck2Fa (req : Request, res : Response){
        const instance : AuthController = new AuthController();
        return instance.login2fa(req, res);
    }
}

export default AuthController;


