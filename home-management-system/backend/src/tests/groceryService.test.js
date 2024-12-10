import request from 'supertest';
import app from '../app.js';
import GroceryService from '../services/GroceryService.js';

jest.mock('../services/GroceryService.js'); // Mock GroceryService

describe('GroceryService', () => {
  const sampleItem = {
    name: 'Test Item',
    quantity: 10,
    unit: 'kg',
    status: 'IN_STOCK',
    threshold_quantity: 2,
    category: 'Produce'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addNewGroceryItem', () => {
    it('should create a new grocery item successfully', async () => {
      GroceryService.addItem.mockResolvedValue({ id: 1, message: 'Item created successfully' });

      const response = await request(app)
        .post('/api/groceries')
        .send(sampleItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('message', 'Item created successfully');
    });

    it('should fail if required fields are missing', async () => {
      const invalidItem = { quantity: 2, unit: 'gallons', category: 'Dairy', threshold_quantity: 1 };
      GroceryService.addItem.mockRejectedValue(new Error('Required fields are missing'));

      const response = await request(app)
        .post('/api/groceries')
        .send(invalidItem);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Required fields are missing');
    });

    it('should fail if the item already exists', async () => {
      GroceryService.addItem.mockRejectedValue(new Error('Item already exists'));

      const response = await request(app)
        .post('/api/groceries')
        .send(sampleItem);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Item already exists');
    });
  });

  describe('getGroceryItems', () => {
    it('should get all grocery items', async () => {
      GroceryService.getItems.mockResolvedValue([sampleItem]);

      const response = await request(app).get('/api/groceries');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toEqual([sampleItem]);
    });

    it('should return an empty array if no items are found', async () => {
      GroceryService.getItems.mockResolvedValue([]);

      const response = await request(app).get('/api/groceries');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(0);
    });
  });

  describe('getGroceryItemById', () => {
    it('should return a single grocery item by id', async () => {
      GroceryService.getItemById.mockResolvedValue(sampleItem);

      const response = await request(app).get('/api/groceries/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(sampleItem);
    });

    it('should return 404 if the item is not found', async () => {
      GroceryService.getItemById.mockRejectedValue(new Error('Item not found'));

      const response = await request(app).get('/api/groceries/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Item not found');
    });
  });

  describe('updateGroceryItemById', () => {
    it('should update a grocery item by id', async () => {
      const updatedItem = { ...sampleItem, quantity: 20 };
      GroceryService.updateItem.mockResolvedValue(updatedItem);

      const response = await request(app)
        .put('/api/groceries/1')
        .send(updatedItem);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedItem);
    });

    it('should return 404 if the item is not found for update', async () => {
      GroceryService.updateItem.mockRejectedValue(new Error('Item not found'));

      const response = await request(app)
        .put('/api/groceries/999')
        .send(sampleItem);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Item not found');
    });
  });

  describe('deleteGroceryItemById', () => {
    it('should delete a grocery item by id', async () => {
      GroceryService.deleteItem.mockResolvedValue({ message: 'Item deleted successfully' });

      const response = await request(app)
        .delete('/api/groceries/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Item deleted successfully');
    });

    it('should fail if grocery item id is invalid', async () => {
      GroceryService.deleteItem.mockRejectedValue(new Error('Invalid item id'));

      const response = await request(app)
        .delete('/api/groceries/999');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Invalid item id');
    });
  });
});