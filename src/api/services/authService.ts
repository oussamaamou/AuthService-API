import jwt from 'jsonwebtoken';
import GlobalUserModel from '../../models/GlobalUser.ts';

class AuthService {

    async handleGoogleUser(googleUser: any) {
        
        const email = googleUser.emails?.[0]?.value;
        
        if (!email) {
            throw new Error('No email found in Google profile');
        }

        const displayName = googleUser.displayName || '';
        const [firstName = 'User', lastName = ''] = displayName.split(' ');

        let user = await GlobalUserModel.findOne({ email });

        if (user) {
            if (!user.googleId) {
                user.googleId = googleUser.id;
                user.provider = 'google';
                user.isEmailVerified = true;
                await user.save();
            }
        } else {
            user = await GlobalUserModel.create({
                firstName,
                lastName: lastName || firstName,
                email,
                provider: 'google', 
                googleId: googleUser.id, 
                isEmailVerified: true, 
                status: 'active' 
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET || '';
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(), 
                email: user.email,
                role: user.role, 
                provider: user.provider 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN } as any 
        );

        return {
            user,
            token,
        };
    }

    buildPublicProfile(user: any) {
        return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role, 
            provider: user.provider 
        };
    }
}

export const authService = new AuthService();
