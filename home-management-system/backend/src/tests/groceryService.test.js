import app from '../app.js';
import GroceryService from '../services/GroceryService.js';

describe('Grocery Management API', () => {
  const sampleItem = {
    name: 'Test Item',
    quantity: 10,
describe('Grocery Management API', () => {
    category: 'Produce'
  };

  describe('POST /api/groceries', () => {
    it('should create a new grocery item', async () => {
      const response = await request(app)
        .post('/api/groceries')
        .send(sampleItem);
describe('Grocery Management API', () => {
    });

    it('should fail if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/groceries')
        .send({
          "quantity": 2,
          "unit": "gallons",
          "category": "Dairy",
          "threshold_quantity": 1
      });

      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/groceries', () => {
    it('should get all grocery items', async () => {
      const response = await request(app).get('/api/groceries');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
    });
  });

  describe('DELETE /api/groceries/:id', () => {
    it('should delete a grocery item by id', async () => {
      const response = await request(app)
        .delete('/api/groceries/13');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');
    });

    it('should fail if grocery item id is invalid', async () => {
      const response = await request(app)
        .delete('/api/groceries/999');

      expect(response.status).toBe(500);
    });
  });
});