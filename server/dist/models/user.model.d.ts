/**
 * User Model
 *
 * CONCEPT: The User model stores user account information.
 * Supports both email/password authentication and Google OAuth.
 *
 * Key fields:
 * - email: Unique identifier for login
 * - password: Hashed password (optional for OAuth users)
 * - fullName: Display name
 * - balance: Current account balance (affected by pots)
 * - googleId: Google OAuth identifier (optional)
 * - authProvider: How the user registered ('local' or 'google')
 */
import mongoose, { Document, Types } from 'mongoose';
export type AuthProvider = 'local' | 'google';
export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    password?: string;
    fullName: string;
    balance: number;
    avatarUrl?: string;
    verified: boolean;
    googleId?: string;
    authProvider: AuthProvider;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    omitPassword(): Partial<IUser>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=user.model.d.ts.map