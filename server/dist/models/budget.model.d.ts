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
import mongoose, { Document, Types } from 'mongoose';
import { type Category } from '../constants/categories.js';
export interface IBudget extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    category: Category;
    maximum: number;
    theme: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Budget: mongoose.Model<IBudget, {}, {}, {}, mongoose.Document<unknown, {}, IBudget, {}, {}> & IBudget & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Budget;
//# sourceMappingURL=budget.model.d.ts.map