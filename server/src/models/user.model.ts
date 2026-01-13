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

import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

// Authentication provider types
export type AuthProvider = 'local' | 'google';

// TypeScript interface for User document
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password?: string; // Optional for OAuth users
  fullName: string;
  balance: number; // Current account balance
  avatarUrl?: string;
  verified: boolean;
  // OAuth fields
  googleId?: string;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt: Date;
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  omitPassword(): Partial<IUser>;
}

// Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Always store lowercase
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        // Password only required for local auth
        return this.authProvider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    // Current account balance
    // This is updated when:
    // 1. Money is added to a pot (decreases)
    // 2. Money is withdrawn from a pot (increases)
    // 3. A pot is deleted (increases by pot total)
    balance: {
      type: Number,
      default: 0,
    },
    avatarUrl: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    // Google OAuth ID
    googleId: {
      type: String,
      sparse: true, // Allows null values while maintaining uniqueness
      unique: true,
    },
    // How the user registered
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes are defined in the schema above (unique: true)

/**
 * Pre-save Hook: Hash password before saving
 *
 * CONCEPT: Mongoose "hooks" (middleware) run before/after certain operations.
 * This runs BEFORE saving, and hashes the password if it was modified.
 *
 * bcrypt.hash() creates a secure one-way hash.
 * The "10" is the salt rounds (higher = more secure but slower).
 */
userSchema.pre('save', async function () {
  // Only hash if password exists and was modified (or is new)
  if (!this.password || !this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: Compare password
 *
 * Used during login to check if the provided password matches.
 * bcrypt.compare() safely compares without revealing the hash.
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false; // OAuth users don't have passwords
  }
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Instance Method: Omit password from response
 *
 * Returns user object without the password field.
 * Use this when sending user data to the client.
 */
userSchema.methods.omitPassword = function (): Partial<IUser> {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create and export the model
export const User = mongoose.model<IUser>('User', userSchema);

export default User;
