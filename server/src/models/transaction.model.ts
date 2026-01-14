/**
 * Transaction Model
 * 
 * CONCEPT: A Mongoose model defines the structure of documents in a MongoDB collection.
 * 
 * Schema vs Model:
 * - Schema: Defines the shape/structure of documents (like a blueprint)
 * - Model: A constructor compiled from the schema (used to create/query documents)
 * 
 * Each transaction represents either income or expense.
 * - Positive amount = income (money received)
 * - Negative amount = expense (money spent)
 */

import mongoose, { Schema, Document, Types } from 'mongoose';
import { CATEGORIES, type Category } from '../constants/categories.js';

// TypeScript interface for Transaction document
export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  avatar: string;
  name: string;
  category: Category;
  date: Date;
  amount: number;  // Positive = income, Negative = expense
  recurring: boolean;
  isTemplate: boolean; // If true, this is a bill template that doesn't affect balance
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const transactionSchema = new Schema<ITransaction>(
  {
    // Reference to the user who owns this transaction
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,  // Index for faster queries by user
    },
    // Avatar image path for the transaction recipient/sender
    avatar: {
      type: String,
      required: true,
    },
    // Name of the recipient/sender
    name: {
      type: String,
      required: true,
      trim: true,  // Remove whitespace from both ends
    },
    // Category for classification
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,  // Only allow values from our categories list
      index: true,  // Index for filtering by category
    },
    // Transaction date
    date: {
      type: Date,
      required: true,
      index: true,  // Index for sorting/filtering by date
    },
    // Amount (positive = income, negative = expense)
    amount: {
      type: Number,
      required: true,
    },
    // Whether this is a recurring transaction
    recurring: {
      type: Boolean,
      default: false,
    },
    // Whether this is a bill template (doesn't affect balance until paid)
    isTemplate: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// Compound index for common queries
// This makes queries like "get user's transactions sorted by date" faster
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

// Text index for search functionality
transactionSchema.index({ name: 'text' });

// Create and export the model
export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);

export default Transaction;
