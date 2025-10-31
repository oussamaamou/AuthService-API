import GlobalUserModel from "../../models/GlobalUser.ts";
import bcrypt from "bcrypt";

class Registerservice{
    firstName : string;
    lastName : string;
    email : string;
    password : string;
    
    constructor(email : string, password : string, firstName : string,  lastName : string){
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public async register(){
        const hashedPassword : string = await bcrypt.hash(this.password, 10);

        const user = await GlobalUserModel.create({
            firstName : this.firstName, 
            lastName : this.lastName, 
            email : this.email, 
            passwordHash : hashedPassword,
            provider: 'local', 
            isEmailVerified: false, 
            status: 'active' 
        });

        return {
            id: user._id,
            email: user.email,
            provider: user.provider
        };
    }
}

export default Registerservice;