import Grocery from '../models/Grocery';
import db from '../config/database';

jest.mock('../config/database');

describe('Grocery Model', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });

    describe('create', () => {
        it('should insert a grocery item into the database and return the insertId', async () => {
            // Arrange
            const mockInsertId = 1;
            const item = {
                name: 'Test Item',
                quantity: 10,
                unit: 'kg',
                status: 'IN_STOCK',
                threshold_quantity: 2,
                category: 'Produce'
            };
            db.execute.mockResolvedValue([{ insertId: mockInsertId }]);

            // Act
            const result = await Grocery.create(item);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                'INSERT INTO grocery_items (name, quantity, unit, status, threshold_quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
                [item.name, item.quantity, item.unit, item.status, item.threshold_quantity, item.category]
            );
            expect(result).toBe(mockInsertId);
        });
    });

    describe('findAll', () => {
        it('should fetch all grocery items from the database', async () => {
            // Arrange
            const mockItems = [
                { id: 1, name: 'Test Item', quantity: 10, unit: 'kg', status: 'IN_STOCK', threshold_quantity: 2, category: 'Produce' }
            ];
            db.execute.mockResolvedValue([mockItems]);

            // Act
            const result = await Grocery.findAll();

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM grocery_items ORDER BY name');
            expect(result).toEqual(mockItems);
        });
    });

    describe('findById', () => {
        it('should fetch a grocery item by its ID', async () => {
            // Arrange
            const itemId = 1;
            const mockItem = { id: 1, name: 'Test Item', quantity: 10, unit: 'kg', status: 'IN_STOCK', threshold_quantity: 2, category: 'Produce' };
            db.execute.mockResolvedValue([[mockItem]]);

            // Act
            const result = await Grocery.findById(itemId);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM grocery_items WHERE id = ?', [itemId]);
            expect(result).toEqual(mockItem);
        });
    });

    describe('update', () => {
        it('should update a grocery item in the database', async () => {
            // Arrange
            const itemId = 1;
            const item = {
                name: 'Updated Item',
                quantity: 20,
                unit: 'kg',
                status: 'IN_STOCK',
                threshold_quantity: 5,
                category: 'Produce'
            };
            db.execute.mockResolvedValue([{ affectedRows: 1 }]);

            // Act
            const result = await Grocery.update(itemId, item);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(
                'UPDATE grocery_items SET name = ?, quantity = ?, unit = ?, status = ?, threshold_quantity = ?, category = ? WHERE id = ?',
                [item.name, item.quantity, item.unit, item.status, item.threshold_quantity, item.category, itemId]
            );
            expect(result).toBe(true);
        });
    });

    describe('delete', () => {
        it('should delete a grocery item from the database', async () => {
            // Arrange
            const itemId = 1;
            db.execute.mockResolvedValue([{ affectedRows: 1 }]);

            // Act
            const result = await Grocery.delete(itemId);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('DELETE FROM grocery_items WHERE id = ?', [itemId]);
            expect(result).toBe(true);
        });
    });

    describe('updateQuantity', () => {
        it('should update the quantity of a grocery item in the database and record the purchase', async () => {
            // Arrange
            const itemId = 1;
            const quantity = 5;
            const userId = 1;
            const mockItem = { id: 1, quantity: 10, status: 'IN_STOCK', threshold_quantity: 2 };
            const connection = {
                beginTransaction: jest.fn(),
                execute: jest.fn()
                    .mockResolvedValueOnce([[mockItem]])
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true)
                    .mockResolvedValueOnce(true),
                commit: jest.fn(),
                rollback: jest.fn(),
                release: jest.fn()
            };
            db.getConnection.mockResolvedValue(connection);

            // Act
            const result = await Grocery.updateQuantity(itemId, quantity, userId);

            // Assert
            expect(db.getConnection).toHaveBeenCalled();
            expect(connection.beginTransaction).toHaveBeenCalled();
            expect(connection.execute).toHaveBeenCalledWith('SELECT * FROM grocery_items WHERE id = ?', [itemId]);
            expect(connection.execute).toHaveBeenCalledWith(
                'UPDATE grocery_items SET quantity = ?, status = ?, last_purchased = ? WHERE id = ?',
                [15, 'IN_STOCK', expect.any(Date), itemId]
            );
            expect(connection.execute).toHaveBeenCalledWith(
                'INSERT INTO grocery_history (item_id, quantity, purchased_by) VALUES (?, ?, ?)',
                [itemId, quantity, userId]
            );
            expect(connection.commit).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('getPurchaseHistory', () => {
        it('should fetch purchase history of a grocery item', async () => {
            // Arrange
            const mockHistory = [
                { item_id: 1, quantity: 5, purchaser_name: 'John' }
            ];
            db.execute.mockResolvedValue([mockHistory]);

            // Act
            const result = await Grocery.getPurchaseHistory(1);

            // Assert
            expect(db.execute).toHaveBeenCalledWith(expect.any(String), [1]);
            expect(result).toEqual(mockHistory);
        });
    });

    describe('getByCategory', () => {
        it('should fetch grocery items by category', async () => {
            // Arrange
            const category = 'Produce';
            const mockItems = [
                { id: 1, name: 'Test Item', quantity: 10, unit: 'kg', status: 'IN_STOCK', threshold_quantity: 2, category: 'Produce' }
            ];
            db.execute.mockResolvedValue([mockItems]);

            // Act
            const result = await Grocery.getByCategory(category);

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM grocery_items WHERE category = ?', [category]);
            expect(result).toEqual(mockItems);
        });
    });

    describe('getLowStockItems', () => {
        it('should fetch grocery items with low stock or out of stock', async () => {
            // Arrange
            const mockItems = [
                { id: 1, name: 'Test Item', quantity: 1, unit: 'kg', status: 'LOW', threshold_quantity: 2, category: 'Produce' }
            ];
            db.execute.mockResolvedValue([mockItems]);

            // Act
            const result = await Grocery.getLowStockItems();

            // Assert
            expect(db.execute).toHaveBeenCalledWith('SELECT * FROM grocery_items WHERE status IN ("LOW", "OUT_OF_STOCK")');
            expect(result).toEqual(mockItems);
        });
    });
});