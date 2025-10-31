import GlobalUserModel from "../../models/GlobalUser.ts";
import bcrypt from "bcrypt";
import  Jwt  from "jsonwebtoken";
import Twofaservice from "./twoFaService.ts";

class Loginservice{
    email : string;
    password : string;
    secretKey : string;
    expiresIn : string;
    
    constructor(email = "", password = "" ){
        this.email = email;
        this.password = password;
        this.secretKey = process.env.JWT_SECRET || "";
        this.expiresIn = process.env.JWT_EXPIRES_IN || "15m";
    }

    async login2Fa(payload : {email : string, twoFa : boolean, userId: string, role: string, provider: string}, code : string){
        const twoFaService =  new Twofaservice();
        const check = await twoFaService.check2Fa(payload, code);
        
        if(check){
            return {error : "invalid 2fa code", status: 401};
        }

        const user = await GlobalUserModel.findOne({email: payload.email});
        if (!user) {
            return {error: "User not found", status: 404};
        }

        const jwtPayload = {
            userId: user._id.toString(), 
            email: user.email,
            role: user.role,
            provider: user.provider
        };

        const token = Jwt.sign(jwtPayload, this.secretKey, { expiresIn: this.expiresIn } as any);

        return {
            accessToken: token,
            tokenType: "Bearer",
            expiresIn: this.expiresIn
        };
    }

    async login(){
        const user  = await GlobalUserModel.findOne({email : this.email});
        
        if(!user){
            return {error : "Incorrect email or password", status: 401};
        }

        if (user.provider === 'local') {
            if (!user.passwordHash || !await bcrypt.compare(this.password, user.passwordHash)){
                return {error : "Incorrect email or password", status: 401};
            }
        } else {
            return {error: "This account uses SSO authentication. Please use the appropriate provider.", status: 400};
        }

        if(user.twoFactorEnabled){
            const twoFaService = new Twofaservice(this.email);
            const twoFaCode = twoFaService.generateCode();
            user.twoFactorCode = twoFaCode;
            await user.save();

            const payload = {
                email : this.email, 
                twoFa : true,
                userId: user._id.toString(),
                role: user.role,
                provider: user.provider
            };
            const tempToken = Jwt.sign(payload, this.secretKey, { expiresIn: "5m" }); 
            
            twoFaService.send2Fa(twoFaCode);

            return {
                message: `2FA code sent to ${this.email}`,
                tokenType: "Bearer",
                requires2FA: true
            };
        }

        const jwtPayload = {
            userId: user._id.toString(), 
            email: user.email,
            role: user.role,
            provider: user.provider
        };

        const token = Jwt.sign(jwtPayload, this.secretKey, { expiresIn: this.expiresIn } as any);

        return {
            accessToken: token,
            tokenType: "Bearer",
            expiresIn: this.expiresIn
        };
    }
}

export default Loginservice;