import request from 'supertest';
import express from 'express';
import GroceryController from '../controllers/GroceryController.js';
import GroceryService from '../services/GroceryService.js';

// Initialize Express app and use the GroceryController router
const app = express();
app.use(express.json());
app.use('/grocery', GroceryController);

// Mock the GroceryService
jest.mock('../services/GroceryService.js');

describe('GroceryController', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mock calls and instances
    });

    it('should create an item successfully', async () => {
        GroceryService.createItem.mockResolvedValue(1);

        const response = await request(app)
            .post('/grocery')
            .send({ name: 'Milk', quantity: 2 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({
            id: 1,
            message: 'Item created successfully',
        });
    });

    it('should get all items', async () => {
        const items = [{ id: 1, name: 'Milk', quantity: 2 }];
        GroceryService.getAllItems.mockResolvedValue(items);

        const response = await request(app).get('/grocery');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(items);
    });

    it('should get an item by id', async () => {
        const item = { id: 1, name: 'Milk', quantity: 2 };
        GroceryService.getItemById.mockResolvedValue(item);

        const response = await request(app).get('/grocery/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(item);
    });

    it('should update an item successfully', async () => {
        const item = { id: 1, name: 'Milk', quantity: 5 };
        GroceryService.updateItem.mockResolvedValue(item);

        const response = await request(app)
            .put('/grocery/1')
            .send({ name: 'Milk', quantity: 5 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            item,
            message: 'Item updated successfully',
        });
    });

    it('should delete an item successfully', async () => {
        GroceryService.deleteItem.mockResolvedValue();

        const response = await request(app).delete('/grocery/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Item deleted successfully',
        });
    });

    it('should update quantity successfully', async () => {
        GroceryService.updateQuantity.mockResolvedValue();

        const response = await request(app)
            .patch('/grocery/1/quantity')
            .send({ quantity: 10 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            message: 'Quantity updated successfully',
        });
    });

    it('should get purchase history', async () => {
        const history = [{ id: 1, date: '2024-01-01', itemId: 1, quantity: 2 }];
        GroceryService.getPurchaseHistory.mockResolvedValue(history);

        const response = await request(app).get('/grocery/1/history');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(history);
    });

    it('should get items by category', async () => {
        const items = [{ id: 1, name: 'Milk', category: 'Dairy' }];
        GroceryService.getByCategory.mockResolvedValue(items);

        const response = await request(app).get('/grocery/category/Dairy');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(items);
    });

    it('should get low stock items', async () => {
        const items = [{ id: 1, name: 'Milk', quantity: 2 }];
        GroceryService.getLowStockItems.mockResolvedValue(items);

        const response = await request(app).get('/grocery/low-stock');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(items);
    });

    it('should handle errors gracefully', async () => {
        GroceryService.createItem.mockRejectedValue(new Error('Failed to create item'));

        const response = await request(app)
            .post('/grocery')
            .send({ name: 'Milk', quantity: 2 });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
            error: 'Failed to create item',
        });
    });
});