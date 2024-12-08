import request from 'supertest';
import express from 'express';
import router from '../routes/expense.routes';
import ExpenseController from '../controllers/ExpenseController';

jest.mock('../controllers/ExpenseController');

const app = express();
app.use(express.json());
app.use('/expense', router);

describe('Expense Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /expense', () => {
        it('should call ExpenseController.createExpense', async () => {
            // Arrange
            ExpenseController.createExpense.mockImplementation((req, res) => res.status(201).json({ message: 'Expense created successfully' }));

            // Act
            const response = await request(app).post('/expense').send({ amount: 100, description: 'Groceries' });

            // Assert
            expect(ExpenseController.createExpense).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Expense created successfully');
        });
    });

    describe('GET /expense', () => {
        it('should call ExpenseController.getAllExpenses', async () => {
            // Arrange
            ExpenseController.getAllExpenses.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched all expenses' }));

            // Act
            const response = await request(app).get('/expense');

            // Assert
            expect(ExpenseController.getAllExpenses).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched all expenses');
        });
    });

    describe('GET /expense/:id', () => {
        it('should call ExpenseController.getExpenseById', async () => {
            // Arrange
            const expenseId = 1;
            ExpenseController.getExpenseById.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched expense by ID' }));

            // Act
            const response = await request(app).get(`/expense/${expenseId}`);

            // Assert
            expect(ExpenseController.getExpenseById).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched expense by ID');
        });
    });

    describe('PUT /expense/:id', () => {
        it('should call ExpenseController.updateExpense', async () => {
            // Arrange
            const expenseId = 1;
            ExpenseController.updateExpense.mockImplementation((req, res) => res.status(200).json({ message: 'Expense updated successfully' }));

            // Act
            const response = await request(app).put(`/expense/${expenseId}`).send({ amount: 150, description: 'Updated Groceries' });

            // Assert
            expect(ExpenseController.updateExpense).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Expense updated successfully');
        });
    });

    describe('DELETE /expense/:id', () => {
        it('should call ExpenseController.deleteExpense', async () => {
            // Arrange
            const expenseId = 1;
            ExpenseController.deleteExpense.mockImplementation((req, res) => res.status(200).json({ message: 'Expense deleted successfully' }));

            // Act
            const response = await request(app).delete(`/expense/${expenseId}`);

            // Assert
            expect(ExpenseController.deleteExpense).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Expense deleted successfully');
        });
    });

    describe('GET /expense/category/:category', () => {
        it('should call ExpenseController.getExpensesByCategory', async () => {
            // Arrange
            const category = 'Food';
            ExpenseController.getExpensesByCategory.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched expenses by category' }));

            // Act
            const response = await request(app).get(`/expense/category/${category}`);

            // Assert
            expect(ExpenseController.getExpensesByCategory).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched expenses by category');
        });
    });

    describe('GET /expense/user/:userId/summary', () => {
        it('should call ExpenseController.getUserSummary', async () => {
            // Arrange
            const userId = 1;
            ExpenseController.getUserSummary.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched user summary' }));

            // Act
            const response = await request(app).get(`/expense/user/${userId}/summary`);

            // Assert
            expect(ExpenseController.getUserSummary).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched user summary');
        });
    });
});