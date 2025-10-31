import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import type { VerifyCallback } from 'passport-google-oauth20';
import GlobalUserModel from '../models/GlobalUser.ts';
import dotenv from 'dotenv';

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback';
const JWT_SECRET = process.env.JWT_SECRET || '';

export interface OAuthUser {
  id:string;
  displayName?:string;
  emails?: Array<{ value?: string}>;
  provider?: string;
}

export function configurePassport(): void {
  passport.use(
      new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },

      (accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) => {

        const user: OAuthUser = {
          id: profile.id,
          displayName: profile.displayName,
          emails: profile.emails,
          provider: profile.provider,
        };
        return done(null, user);
      }
    )
  );

  const jwtOpts: any = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
    secretOrKey: JWT_SECRET, 
  };

  passport.use(
    new JwtStrategy(jwtOpts, async (payload: any, done: (err: any, user?: any) => void) => {
      try {
        if (!payload?.userId) {
          return done(null, false);
        }
        
        const user = await GlobalUserModel.findById(payload.userId).select('-passwordHash');
        
        if (!user) {
          return done(null, false);
        }

        if (user.status !== 'active') {
          return done(null, false);
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    })
  );

}

export default configurePassport;