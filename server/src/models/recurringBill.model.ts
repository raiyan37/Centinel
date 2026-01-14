/**
 * Recurring Bill Model
 * 
 * CONCEPT: A recurring bill is a template for monthly expenses.
 * It does NOT create transactions - it's just a record of bills you need to pay.
 * 
 * When a bill is PAID, a transaction is created at that time.
 * This separates bill tracking from actual money movement.
 * 
 * Key fields:
 * - name: Vendor/company name (e.g., "Netflix")
 * - amount: Monthly bill amount (stored as negative for expense)
 * - category: Expense category
 * - dueDay: Day of month when bill is due (1-31)
 * - avatar: Image for display
 */

import mongoose, { Schema, Document, Types } from 'mongoose';
import { CATEGORIES, type Category } from '../constants/categories.js';

// TypeScript interface for RecurringBill document
export interface IRecurringBill extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  amount: number;  // Negative (expense)
  category: Category;
  dueDay: number;  // 1-31
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const recurringBillSchema = new Schema<IRecurringBill>(
  {
    // Reference to the user who owns this bill
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Vendor/company name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Bill amount (negative for expense)
    amount: {
      type: Number,
      required: true,
    },
    // Category for classification
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
    },
    // Day of month when bill is due (1-31)
    dueDay: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    // Avatar image path
    avatar: {
      type: String,
      default: '/assets/images/avatars/default.jpg',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
recurringBillSchema.index({ userId: 1, name: 1 });

// Create and export the model
export const RecurringBill = mongoose.model<IRecurringBill>('RecurringBill', recurringBillSchema);

export default RecurringBill;
