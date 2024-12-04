import request from 'supertest';
import app from '../app.js';
import GroceryService from '../services/GroceryService.js';

describe('Grocery Management API', () => {
  const sampleItem = {
    name: 'Test Item',
    quantity: 10,
    unit: 'kg',
    status: 'IN_STOCK',
    threshold_quantity: 2,
    category: 'Produce'
  };

  describe('POST /api/grocery', () => {
    it('should create a new grocery item', async () => {
      const response = await request(app)
        .post('/api/grocery')
        .send(sampleItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Item created successfully');
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/grocery')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/grocery', () => {
    it('should get all grocery items', async () => {
      const response = await request(app).get('/api/grocery');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('DELETE /api/grocery/:id', () => {
    it('should delete a grocery item by id', async () => {
      const response = await request(app)
        .delete('/api/grocery/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');
    });

    it('should fail if grocery item id is invalid', async () => {
      const response = await request(app)
        .delete('/api/grocery/999');

      expect(response.status).toBe(404);
    });
  });
});