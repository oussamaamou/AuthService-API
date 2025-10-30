import { UserRole } from '../enums/UserRole.ts';

export type Provider = 'local' | 'google';

export type GlobalUserProps = {
    firstName?: string;
    lastName?: string;
    email: string;

    passwordHash?: string;
    role: UserRole;
    verified: boolean;             


    authProvider: Provider;         
    googleId?: string;

    twoFactorAuth: boolean;
    twoFactorCode: string;
};
