import request from 'supertest';
import app from '../app.js';
import ExpenseService from '../services/ExpenseService.js';
import { jest } from '@jest/globals';

// Mock the ExpenseService
jest.mock('../services/ExpenseService.js');

describe('ExpenseController', () => {
  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      ExpenseService.createExpense.mockResolvedValue(1);

      const response = await request(app)
        .post('/api/expenses')
        .send({
          description: 'Test Expense',
          amount: 100,
          payer_id: 1,
          split_type: 'equal',
          participantShares: [{ user_id: 1, contributed_amount: 50 }, { user_id: 2, contributed_amount: 50 }],
          category: 'Food'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('message', 'Expense created successfully');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({
          amount: 100,
          payer_id: 1,
          split_type: 'equal',
          participantShares: [{ user_id: 1, contributed_amount: 50 }, { user_id: 2, contributed_amount: 50 }]
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'All fields are required');
    });
  });

  describe('GET /api/expenses', () => {
    it('should get all expenses', async () => {
      ExpenseService.getAllExpenses.mockResolvedValue([
        { id: 1, description: 'Test Expense', amount: 100, payer_id: 1, category: 'Food' }
      ]);

      const response = await request(app).get('/api/expenses');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /api/expenses/:id', () => {
    it('should get an expense by id', async () => {
      ExpenseService.getExpenseById.mockResolvedValue({ id: 1, description: 'Test Expense', amount: 100, payer_id: 1, category: 'Food' });

      const response = await request(app).get('/api/expenses/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
    });

    it('should return 404 if expense not found', async () => {
      ExpenseService.getExpenseById.mockResolvedValue(null);

      const response = await request(app).get('/api/expenses/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Expense not found');
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update an expense', async () => {
      ExpenseService.updateExpense.mockResolvedValue(true);

      const response = await request(app)
        .put('/api/expenses/1')
        .send({
          description: 'Updated Expense',
          amount: 150,
          payer_id: 1,
          split_type: 'equal',
          participantShares: [{ user_id: 1, contributed_amount: 75 }, { user_id: 2, contributed_amount: 75 }],
          category: 'Transport'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Expense updated successfully');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .put('/api/expenses/1')
        .send({
          amount: 150,
          payer_id: 1,
          split_type: 'equal',
          participantShares: [{ user_id: 1, contributed_amount: 75 }, { user_id: 2, contributed_amount: 75 }]
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'All fields are required');
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense', async () => {
      ExpenseService.deleteExpense.mockResolvedValue(true);

      const response = await request(app).delete('/api/expenses/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Expense deleted successfully');
    });

    it('should return 404 if expense not found', async () => {
      ExpenseService.deleteExpense.mockResolvedValue(false);

      const response = await request(app).delete('/api/expenses/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Expense not found');
    });
  });

  describe('GET /api/expenses/category/:category', () => {
    it('should get expenses by category', async () => {
      ExpenseService.getExpensesByCategory.mockResolvedValue([
        { id: 1, description: 'Test Expense', amount: 100, payer_id: 1, category: 'Food' }
      ]);

      const response = await request(app).get('/api/expenses/category/Food');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('GET /api/expenses/user/:userId/summary', () => {
    it('should get user summary', async () => {
      ExpenseService.getUserSummary.mockResolvedValue({ userId: 1, totalExpenses: 500, totalPaid: 300, totalOwed: 200 });

      const response = await request(app).get('/api/expenses/user/1/summary');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userId', 1);
    });
  });
});