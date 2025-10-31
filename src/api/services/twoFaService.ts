import { Emailservice } from "./emailService.ts";
import type { Authobject, Communication } from "./emailService.ts";
import GlobalUserModel from "../../models/GlobalUser.ts";

class Twofaservice {

    userEmail : string;
    emailAuth : Authobject;
    emailProvider : string;
    
    constructor (userEmail = ""){
        this.emailAuth = {
            user : process.env.EMAIL_ADRESS || "" ,
            pass : process.env.EMAIL_PASSWORD || ""
        }
        this.emailProvider = process.env.EMAIL_SERVICE_PROVIDER || "";
        this.userEmail = userEmail || "";
    }

    public generateCode(){
        const randomSixDigit = Math.floor(100000 + Math.random() * 900000);
        return randomSixDigit.toString();
    }

    public send2Fa(twoFactorCode : string){
        const emailTitle = "2FA VERIFICATION - AUTH SERVICE"; 
        const emailContent = 
        `You tried to log in and 2FA is enabled on your account. Here is your one-time code: ${twoFactorCode}. This code will expire in 5 minutes.`; 
        
        const mailToSend : Communication = {
            from : this.emailAuth.user, 
            to : this.userEmail, 
            subject : emailTitle, 
            text : emailContent
        };

        const email = new Emailservice("gmail", this.emailAuth);
        email.send(mailToSend);
    }

    public async check2Fa (payload : {email : string, twoFa : boolean}, code : string){
        const user = await GlobalUserModel.findOne({email : payload.email});
        
        if (!user){
            return true; 
        }

        if(user.twoFactorCode === code){

            user.twoFactorCode = '';
            await user.save();
            return false; 
        }

        return true; 
    }
}

export default Twofaservice;