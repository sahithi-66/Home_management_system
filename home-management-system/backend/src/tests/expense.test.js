import request from 'supertest';
import app from '../app.js';
import ExpenseService from '../services/ExpenseService.js';

describe('Expense Management API', () => {
  const sampleExpense = {
    description: 'Test Expense',
    amount: 100,
    payer_id: 1,
    split_type: 'equal',
    category: 'Utilities',
    splits: [
      { user_id: 1, contributed_amount: 50 },
      { user_id: 2, contributed_amount: 50 }
    ]
  };

  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send(sampleExpense);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Expense created successfully');
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/expenses')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/expenses', () => {
    it('should get all expenses', async () => {
      const response = await request(app).get('/api/expenses');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense by id', async () => {
      const response = await request(app)
        .delete('/api/expenses/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Expense deleted successfully');
    });

    it('should fail if expense id is invalid', async () => {
      const response = await request(app)
        .delete('/api/expenses/999');

      expect(response.status).toBe(404);
    });
  });
});