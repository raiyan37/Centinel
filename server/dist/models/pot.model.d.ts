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
import mongoose, { Document, Types } from 'mongoose';
export interface IPot extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    target: number;
    total: number;
    theme: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Pot: mongoose.Model<IPot, {}, {}, {}, mongoose.Document<unknown, {}, IPot, {}, mongoose.DefaultSchemaOptions> & IPot & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPot>;
export default Pot;
//# sourceMappingURL=pot.model.d.ts.map