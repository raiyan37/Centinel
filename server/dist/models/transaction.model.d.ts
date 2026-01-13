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
import mongoose, { Document, Types } from 'mongoose';
import { type Category } from '../constants/categories.js';
export interface ITransaction extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    avatar: string;
    name: string;
    category: Category;
    date: Date;
    amount: number;
    recurring: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}, mongoose.DefaultSchemaOptions> & ITransaction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITransaction>;
export default Transaction;
//# sourceMappingURL=transaction.model.d.ts.map