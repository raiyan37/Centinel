/**
 * Models Index
 * 
 * Central export point for all Mongoose models.
 * Import from here: import { User, Transaction } from './models';
 */

export { User, type IUser } from './user.model.js';
export { Transaction, type ITransaction } from './transaction.model.js';
export { Budget, type IBudget } from './budget.model.js';
export { Pot, type IPot } from './pot.model.js';
export { RecurringBill, type IRecurringBill } from './recurringBill.model.js';
