import mongoose, { Schema } from 'mongoose';
import type { GlobalUserProps } from '../types/GlobalUser.ts';
import { UserRole } from '../enums/UserRole.ts';

const GlobalUserSchema = new Schema<GlobalUserProps>(
  {
    firstName: { type: String, required : true },
    lastName: { type: String, required : true },

    email: { 
        type: String, 
        required: true, unique: true, lowercase: true, trim: true 
    },
    
    passwordHash: { type: String, required: false },

    authProvider: { 
        type: String, 
        enum: ['local', 'google'], default: 'local', required: true 
    },

    role: { type: String, 
        enum: Object.values(UserRole), default: UserRole.Particulier, required: true 
    },
    verified : { type : Boolean, default : false },

    googleId: { type: String, unique: true, sparse: true },

    twoFactorAuth: { type: Boolean, default: false },
    twoFactorCode: { type: String, required: false },

  },
  { timestamps: true, collection: 'global_users' }
);

export const GlobalUserModel = mongoose.model<GlobalUserProps>('GlobalUser', GlobalUserSchema);
