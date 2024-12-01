import ExpenseService from '../services/ExpenseService.js';

class ExpenseController {
    async createExpense(req, res, next) {
        try {
            const expenseId = await ExpenseService.createExpense(req.body);
            res.status(201).json({
                id: expenseId,
                message: 'Expense created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllExpenses(req, res, next) {
        try {
            const expenses = await ExpenseService.getAllExpenses();
            res.json(expenses);
        } catch (error) {
            next(error);
        }
    }

    async getExpenseById(req, res, next) {
        try {
            const expense = await ExpenseService.getExpenseById(req.params.id);
            res.json(expense);
        } catch (error) {
            next(error);
        }
    }

    async updateExpense(req, res, next) {
        try {
            const expense = await ExpenseService.updateExpense(req.params.id, req.body);
            res.json({
                expense,
                message: 'Expense updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteExpense(req, res, next) {
        try {
            await ExpenseService.deleteExpense(req.params.id);
            res.json({
                message: 'Expense deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getExpensesByCategory(req, res, next) {
        try {
            const expenses = await ExpenseService.getExpensesByCategory(req.params.category);
            res.json(expenses);
        } catch (error) {
            next(error);
        }
    }

    async getUserSummary(req, res, next) {
        try {
            const summary = await ExpenseService.getUserSummary(req.params.userId);
            res.json(summary);
        } catch (error) {
            next(error);
        }
    }
}

export default new ExpenseController();