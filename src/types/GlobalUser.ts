import { UserRole } from '../enums/UserRole.ts';

export type Provider = 'local' | 'google';

export type GlobalUserProps = {
    firstName?: string;
    lastName?: string;
    email: string;
    phoneNumber?: string; 
    profilePicture?: string; 

    passwordHash?: string;
    
    role: UserRole; 
    
    isEmailVerified: boolean;

    provider: Provider;
    
    googleId?: string; 

    twoFactorEnabled: boolean;
    twoFactorCode?: string; 

    verificationToken?: string;
    verificationTokenExpiresAt?: Date;

    status?: 'active' | 'suspended' | 'deleted';
};
