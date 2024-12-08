import Expense from '../models/Expense';
import db from '../config/database';

jest.mock('../config/database');

describe('Expense Model', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('create', () => {
        it('should create an expense and corresponding splits in the database', async () => {
            // Arrange
            const mockExpenseId = 1;
            const expense = {
                description: 'Test Expense',
                amount: 100,
                payer_id: 1,
                split_type: 'equal',
                category: 'utilities'
            };
            const splits = [
                { user_id: 1, contributed_amount: 50 },
                { user_id: 2, contributed_amount: 50 }
            ];

            db.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                execute: jest.fn()
                    .mockResolvedValueOnce([{ insertId: mockExpenseId }])
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            });

            // Act
            const result = await Expense.create(expense, splits);

            // Assert
            expect(db.getConnection).toHaveBeenCalled();
            expect(result).toBe(mockExpenseId);
        });
    });

    describe('findAll', () => {
        it('should fetch all expenses with splits from the database', async () => {
            // Arrange
            const mockExpenses = [
                { id: 1, description: 'Test Expense', amount: 100, payer_id: 1, split_type: 'equal', category: 'utilities' }
            ];
            const mockSplits = [
                { expense_id: 1, user_id: 1, amount: 50 },
                { expense_id: 1, user_id: 2, amount: 50 }
            ];

            db.execute
                .mockResolvedValueOnce([mockExpenses])
                .mockResolvedValueOnce([mockSplits]);

            // Act
            const result = await Expense.findAll();

            // Assert
            expect(db.execute).toHaveBeenCalledTimes(2);
            expect(result[0].splits).toEqual(mockSplits);
        });
    });

    describe('findById', () => {
        it('should fetch an expense by its ID with splits', async () => {
            // Arrange
            const expenseId = 1;
            const mockExpense = { id: 1, description: 'Test Expense', amount: 100, payer_id: 1, split_type: 'equal', category: 'utilities' };
            const mockSplits = [
                { expense_id: 1, user_id: 1, amount: 50 },
                { expense_id: 1, user_id: 2, amount: 50 }
            ];

            db.execute
                .mockResolvedValueOnce([[mockExpense]])
                .mockResolvedValueOnce([mockSplits]);

            // Act
            const result = await Expense.findById(expenseId);

            // Assert
            expect(db.execute).toHaveBeenCalledTimes(2);
            expect(result.splits).toEqual(mockSplits);
        });
    });

    describe('update', () => {
        it('should update an expense and its splits in the database', async () => {
            // Arrange
            const expenseId = 1;
            const expense = {
                description: 'Updated Expense',
                amount: 200,
                payer_id: 1,
                split_type: 'equal',
                category: 'entertainment'
            };
            const splits = [
                { user_id: 1, amount: 100 },
                { user_id: 2, amount: 100 }
            ];

            db.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                execute: jest.fn()
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            });

            // Act
            const result = await Expense.update(expenseId, expense, splits);

            // Assert
            expect(db.getConnection).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('delete', () => {
        it('should delete an expense and its splits from the database', async () => {
            // Arrange
            const expenseId = 1;

            db.getConnection.mockResolvedValue({
                beginTransaction: jest.fn(),
                execute: jest.fn()
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            });

            // Act
            const result = await Expense.delete(expenseId);

            // Assert
            expect(db.getConnection).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('getByCategory', () => {
        it('should fetch expenses by category', async () => {
            // Arrange
            const category = 'utilities';
            const mockExpenses = [
                { id: 1, description: 'Test Expense', amount: 100, payer_id: 1, split_type: 'equal', category: 'utilities' }
            ];

            db.execute.mockResolvedValueOnce([mockExpenses]);

            // Act
            const result = await Expense.getByCategory(category);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM expenses WHERE category = ?', [category]);
            expect(result).toEqual(mockExpenses);
        });
    });

    describe('getSummaryByUser', () => {
        it('should fetch summary of expenses by user', async () => {
            // Arrange
            const userId = 1;
            const mockSummary = {
                username: 'John',
                total_paid: 100,
                total_owed: 50
            };

            db.execute.mockResolvedValueOnce([[mockSummary]]);

            // Act
            const result = await Expense.getSummaryByUser(userId);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(expect.any(String), [userId, userId]);
            expect(result).toEqual(mockSummary);
        });
    });
});