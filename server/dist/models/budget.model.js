/**
 * Budget Model
 *
 * CONCEPT: A budget sets a spending limit for a specific category.
 * Users can track how much they've spent vs their limit.
 *
 * Key fields:
 * - category: What type of spending (e.g., "Groceries")
 * - maximum: The spending limit for this category
 * - theme: Color theme for UI display
 *
 * Note: "spent" is NOT stored here - it's calculated from transactions.
 */
import mongoose, { Schema } from 'mongoose';
import { CATEGORIES } from '../constants/categories.js';
// Mongoose Schema
const budgetSchema = new Schema({
    // Reference to the user who owns this budget
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    // Category this budget tracks
    category: {
        type: String,
        required: true,
        enum: CATEGORIES,
    },
    // Maximum spending limit
    maximum: {
        type: Number,
        required: true,
        min: [0, 'Maximum must be a positive number'],
    },
    // Theme color (hex code)
    theme: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
// Ensure each user can only have one budget per category
// This creates a unique compound index
budgetSchema.index({ userId: 1, category: 1 }, { unique: true });
// Also ensure theme is unique per user (can't have two budgets with same color)
budgetSchema.index({ userId: 1, theme: 1 }, { unique: true });
// Create and export the model
export const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
//# sourceMappingURL=budget.model.js.map