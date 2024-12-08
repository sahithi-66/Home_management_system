import request from 'supertest';
import express from 'express';
import router from '../routes/grocery.routes';
import GroceryController from '../controllers/GroceryController';

jest.mock('../controllers/GroceryController');

const app = express();
app.use(express.json());
app.use('/grocery', router);

describe('Grocery Routes', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /grocery', () => {
        it('should call GroceryController.createItem', async () => {
            // Arrange
            GroceryController.createItem.mockImplementation((req, res) => res.status(201).json({ message: 'Item created successfully' }));

            // Act
            const response = await request(app).post('/grocery').send({ name: 'Milk', quantity: 2 });

            // Assert
            expect(GroceryController.createItem).toHaveBeenCalled();
            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Item created successfully');
        });
    });

    describe('GET /grocery', () => {
        it('should call GroceryController.getAllItems', async () => {
            // Arrange
            GroceryController.getAllItems.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched all items' }));

            // Act
            const response = await request(app).get('/grocery');

            // Assert
            expect(GroceryController.getAllItems).toHaveBeenCalled();
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched all items');
        });
    });

    describe('GET /grocery/:id', () => {
        it('should call GroceryController.getItemById', async () => {
            // Arrange
            const itemId = 1;
            GroceryController.getItemById.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched item by ID' }));

            // Act
            const response = await request(app).get(`/grocery/${itemId}`);

            // Assert
            expect(GroceryController.getItemById).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched item by ID');
        });
    });

    describe('PUT /grocery/:id', () => {
        it('should call GroceryController.updateItem', async () => {
            // Arrange
            const itemId = 1;
            GroceryController.updateItem.mockImplementation((req, res) => res.status(200).json({ message: 'Item updated successfully' }));

            // Act
            const response = await request(app).put(`/grocery/${itemId}`).send({ name: 'Milk', quantity: 3 });

            // Assert
            expect(GroceryController.updateItem).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Item updated successfully');
        });
    });

    describe('DELETE /grocery/:id', () => {
        it('should call GroceryController.deleteItem', async () => {
            // Arrange
            const itemId = 1;
            GroceryController.deleteItem.mockImplementation((req, res) => res.status(200).json({ message: 'Item deleted successfully' }));

            // Act
            const response = await request(app).delete(`/grocery/${itemId}`);

            // Assert
            expect(GroceryController.deleteItem).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Item deleted successfully');
        });
    });

    describe('POST /grocery/:id/quantity', () => {
        it('should call GroceryController.updateQuantity', async () => {
            // Arrange
            const itemId = 1;
            GroceryController.updateQuantity.mockImplementation((req, res) => res.status(200).json({ message: 'Quantity updated successfully' }));

            // Act
            const response = await request(app).post(`/grocery/${itemId}/quantity`).send({ quantity: 5 });

            // Assert
            expect(GroceryController.updateQuantity).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Quantity updated successfully');
        });
    });

    describe('GET /grocery/:id/history', () => {
        it('should call GroceryController.getPurchaseHistory', async () => {
            // Arrange
            const itemId = 1;
            GroceryController.getPurchaseHistory.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched purchase history' }));

            // Act
            const response = await request(app).get(`/grocery/${itemId}/history`);

            // Assert
            expect(GroceryController.getPurchaseHistory).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched purchase history');
        });
    });

    describe('GET /grocery/category/:category', () => {
        it('should call GroceryController.getByCategory', async () => {
            // Arrange
            const category = 'Dairy';
            GroceryController.getByCategory.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched items by category' }));

            // Act
            const response = await request(app).get(`/grocery/category/${category}`);

            // Assert
            expect(GroceryController.getByCategory).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched items by category');
        });
    });

    describe('GET /grocery/status/low', () => {
        it('should call GroceryController.getLowStockItems', async () => {
            // Arrange
            GroceryController.getLowStockItems.mockImplementation((req, res) => res.status(200).json({ message: 'Fetched low stock items' }));

            // Act
            const response = await request(app).get('/grocery/status/low');

            // Assert
            expect(GroceryController.getLowStockItems).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Fetched low stock items');
        });
    });
});