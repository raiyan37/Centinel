/**
 * Pot Model
 * 
 * CONCEPT: A pot is a savings goal container.
 * Users can save money toward specific goals (like "Holiday" or "New Laptop").
 * 
 * Key fields:
 * - name: What they're saving for (e.g., "Holiday")
 * - target: Goal amount they want to reach
 * - total: Current amount saved in this pot
 * - theme: Color theme for UI display
 * 
 * Important: Adding/withdrawing from pots affects the main balance!
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

// TypeScript interface for Pot document
export interface IPot extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  target: number;  // Goal amount
  total: number;   // Current saved amount
  theme: string;   // Hex color code
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const potSchema = new Schema<IPot>(
  {
    // Reference to the user who owns this pot
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Name of the savings goal
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Target amount to save
    target: {
      type: Number,
      required: true,
      min: [0, 'Target must be a positive number'],
    },
    // Current amount saved
    total: {
      type: Number,
      default: 0,
      min: [0, 'Total cannot be negative'],
    },
    // Theme color (hex code)
    theme: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure theme is unique per user
potSchema.index({ userId: 1, theme: 1 }, { unique: true });

// Create and export the model
export const Pot = mongoose.model<IPot>('Pot', potSchema);

export default Pot;
