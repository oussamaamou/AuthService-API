import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

type Authobject  = {
    user : string,
    pass : string,
}
    
type Communication = {
    from: string,
    to: string,
    subject : string,
    text : string,
}

class Emailservice {
    serviceProvider : string;
    auth : Authobject;
    transporter : Transporter;

    constructor (serviceProvider : string, auth : Authobject){
        this.serviceProvider = serviceProvider;
        this.auth = auth;
        this.transporter = nodemailer.createTransport({
            service : this.serviceProvider, 
            auth : this.auth
        });
    }

    public async send(mailInfos : Communication){
        try {
            const infos = await this.transporter.sendMail(mailInfos);
            return {
                success : "Email sent successfully",
                messageId: infos.messageId 
            };
        } catch (err : any) {

            console.error("Email sending failed:", err);
            throw new Error(`Failed to send email: ${err.message}`);
        }
    }

}

export { Emailservice};
export type {Authobject, Communication};