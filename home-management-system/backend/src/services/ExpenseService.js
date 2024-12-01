import Expense from '../models/Expense.js';

class ExpenseService {
    async createExpense(expenseData) {
        const { description, amount, payer_id, split_type, category, splits } = expenseData;

        // Validate required fields
        if (!description || !amount || !payer_id || !split_type || !category || !splits) {
            throw new Error('Missing required fields');
        }

        // Validate split amounts sum equals total amount
        const totalSplit = splits.reduce((sum, split) => sum + split.contributed_amount, 0);
        if (Math.abs(totalSplit - amount) > 0.01) { // Using 0.01 to handle floating point precision
            throw new Error('Split amounts must equal total amount');
        }

        return await Expense.create(
            { description, amount, payer_id, split_type, category },
            splits
        );
    }

    async getAllExpenses() {
        return await Expense.findAll();
    }

    async getExpenseById(id) {
        const expense = await Expense.findById(id);
        if (!expense) {
            throw new Error('Expense not found');
        }
        return expense;
    }

    async updateExpense(id, expenseData) {
        const { description, amount, payer_id, split_type, category, splits } = expenseData;

        if (!description || !amount || !payer_id || !split_type || !category || !splits) {
            throw new Error('Missing required fields');
        }

        const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);
        if (Math.abs(totalSplit - amount) > 0.01) {
            throw new Error('Split amounts must equal total amount');
        }

        const success = await Expense.update(
            id,
            { description, amount, payer_id, split_type, category },
            splits
        );

        if (!success) {
            throw new Error('Failed to update expense');
        }

        return await this.getExpenseById(id);
    }

    async deleteExpense(id) {
        const success = await Expense.delete(id);
        if (!success) {
            throw new Error('Failed to delete expense');
        }
        return true;
    }

    async getExpensesByCategory(category) {
        return await Expense.getByCategory(category);
    }

    async getUserSummary(userId) {
        return await Expense.getSummaryByUser(userId);
    }
}

export default new ExpenseService();