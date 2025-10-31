import mongoose, { Schema } from 'mongoose';
import type { GlobalUserProps } from '../types/GlobalUser.ts';
import { UserRole } from '../enums/UserRole.ts';

const GlobalUserSchema = new Schema<GlobalUserProps>(
  {
    firstName: { type: String, required: false }, 
    lastName: { type: String, required: false }, 

    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },

    phoneNumber: { type: String, required: false },
    profilePicture: { type: String, required: false },
    
    passwordHash: { type: String, required: false },

    provider: { 
        type: String, 
        enum: ['local', 'google'], 
        default: 'local', 
        required: true 
    },

    role: { 
        type: String, 
        enum: Object.values(UserRole), 
        default: UserRole.Particulier, 
        required: true 
    },

    isEmailVerified: { type: Boolean, default: false },

    googleId: { type: String, unique: true, sparse: true },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, required: false },

    verificationToken: { type: String, required: false },
    verificationTokenExpiresAt: { type: Date, required: false },

    status: { 
        type: String, 
        enum: ['active', 'suspended', 'deleted'], 
        default: 'active' 
    }
  },
  { 
    timestamps: true, 
    collection: 'global_users' 
  }
);

const GlobalUserModel = mongoose.model<GlobalUserProps>('GlobalUser', GlobalUserSchema);

export default GlobalUserModel;
