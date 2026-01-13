/**
 * Overview Controller
 *
 * CONCEPT: Overview aggregates data from all resources.
 *
 * Returns:
 * - Balance (current, income, expenses)
 * - Pots summary (total saved, count)
 * - Budgets summary
 * - Recent transactions
 * - Recurring bills summary
 */
import { User, Transaction, Budget, Pot } from '../models/index.js';
import { catchErrors } from '../utils/catchErrors.js';
import { HTTP_STATUS } from '../constants/http.js';
// Current month for calculations
const CURRENT_MONTH_START = new Date('2024-08-01T00:00:00.000Z');
const CURRENT_MONTH_END = new Date('2024-08-31T23:59:59.999Z');
// =============================================================================
// GET OVERVIEW
// =============================================================================
export const getOverview = catchErrors(async (req, res) => {
    const userId = req.userId;
    // Get user for balance
    const user = await User.findById(userId).lean();
    // Calculate income and expenses from transactions
    const [incomeResult, expenseResult] = await Promise.all([
        // Sum of positive amounts (income)
        Transaction.aggregate([
            { $match: { userId, amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        // Sum of negative amounts (expenses) - we'll take absolute value
        Transaction.aggregate([
            { $match: { userId, amount: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
    ]);
    const income = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const expenses = expenseResult.length > 0 ? Math.abs(expenseResult[0].total) : 0;
    // Get pots summary
    const pots = await Pot.find({ userId }).lean();
    const totalSaved = pots.reduce((sum, pot) => sum + pot.total, 0);
    // Get budgets with spent amounts
    const budgets = await Budget.find({ userId }).lean();
    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
        const spentResult = await Transaction.aggregate([
            {
                $match: {
                    userId,
                    category: budget.category,
                    amount: { $lt: 0 },
                    date: { $gte: CURRENT_MONTH_START, $lte: CURRENT_MONTH_END },
                },
            },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const spent = spentResult.length > 0 ? Math.abs(spentResult[0].total) : 0;
        return { ...budget, spent };
    }));
    // Get recent transactions (latest 5)
    const recentTransactions = await Transaction.find({ userId })
        .sort({ date: -1 })
        .limit(5)
        .lean();
    // Get recurring bills summary
    const recurringBills = await Transaction.find({
        userId,
        recurring: true,
        amount: { $lt: 0 }, // Only expenses
    }).lean();
    // Deduplicate by name (one per vendor)
    const uniqueBills = Array.from(new Map(recurringBills.map((bill) => [bill.name, bill])).values());
    // Calculate bills summary for August 2024
    const paidBills = uniqueBills.filter((bill) => {
        const billDate = new Date(bill.date);
        return billDate >= CURRENT_MONTH_START && billDate <= CURRENT_MONTH_END;
    });
    // Due soon = within 5 days of Aug 19, 2024 (latest transaction)
    // Bills due between Aug 20 and Aug 24 are "due soon"
    const dueSoonBills = uniqueBills.filter((bill) => {
        // Get day of month from any recurring transaction
        const dayOfMonth = new Date(bill.date).getDate();
        return dayOfMonth > 19 && dayOfMonth <= 24;
    });
    const totalBillsAmount = uniqueBills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0);
    const paidBillsAmount = paidBills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0);
    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
            balance: {
                current: user?.balance || 0,
                income,
                expenses,
            },
            pots: {
                totalSaved,
                items: pots.slice(0, 4), // Show first 4 pots
            },
            budgets: {
                items: budgetsWithSpent,
            },
            transactions: {
                recent: recentTransactions,
            },
            recurringBills: {
                total: uniqueBills.length,
                totalAmount: totalBillsAmount,
                paid: {
                    count: paidBills.length,
                    amount: paidBillsAmount,
                },
                upcoming: {
                    count: uniqueBills.length - paidBills.length,
                    amount: totalBillsAmount - paidBillsAmount,
                },
                dueSoon: {
                    count: dueSoonBills.length,
                    amount: dueSoonBills.reduce((sum, bill) => sum + Math.abs(bill.amount), 0),
                },
            },
        },
    });
});
// =============================================================================
// GET BALANCE
// =============================================================================
export const getBalance = catchErrors(async (req, res) => {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    // Calculate from transactions
    const [incomeResult, expenseResult] = await Promise.all([
        Transaction.aggregate([
            { $match: { userId, amount: { $gt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Transaction.aggregate([
            { $match: { userId, amount: { $lt: 0 } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
    ]);
    const income = incomeResult.length > 0 ? incomeResult[0].total : 0;
    const expenses = expenseResult.length > 0 ? Math.abs(expenseResult[0].total) : 0;
    res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
            currentBalance: user?.balance || 0,
            income,
            expenses,
        },
    });
});
//# sourceMappingURL=overview.controller.js.map