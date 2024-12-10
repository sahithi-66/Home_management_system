import GroceryService from '../services/GroceryService.js';
import Grocery from '../models/Grocery.js';

jest.mock('../models/Grocery.js');

describe('GroceryService', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test to avoid interference
    });

    describe('createItem', () => {
        it('should create an item successfully', async () => {
            const itemData = { name: 'Apple', quantity: 10 };
            Grocery.create.mockResolvedValue(itemData);

            const result = await GroceryService.createItem(itemData);
            expect(result).toEqual(itemData);
            expect(Grocery.create).toHaveBeenCalledWith(itemData);
        });

        it('should throw an error if item name is missing', async () => {
            await expect(GroceryService.createItem({ quantity: 10 })).rejects.toThrow('Item name is required');
        });
    });

    describe('getAllItems', () => {
        it('should return all items', async () => {
            const items = [{ id: 1, name: 'Apple' }, { id: 2, name: 'Banana' }];
            Grocery.findAll.mockResolvedValue(items);

            const result = await GroceryService.getAllItems();
            expect(result).toEqual(items);
            expect(Grocery.findAll).toHaveBeenCalled();
        });
    });

    describe('getItemById', () => {
        it('should return an item by ID', async () => {
            const item = { id: 1, name: 'Apple' };
            Grocery.findById.mockResolvedValue(item);

            const result = await GroceryService.getItemById(1);
            expect(result).toEqual(item);
            expect(Grocery.findById).toHaveBeenCalledWith(1);
        });

        it('should throw an error if item not found', async () => {
            Grocery.findById.mockResolvedValue(null);

            await expect(GroceryService.getItemById(99)).rejects.toThrow('Item not found');
        });
    });

    describe('updateItem', () => {
        it('should update an item successfully', async () => {
            const item = { id: 1, name: 'Updated Apple' };
            Grocery.update.mockResolvedValue(true);
            Grocery.findById.mockResolvedValue(item);

            const result = await GroceryService.updateItem(1, item);
            expect(result).toEqual(item);
            expect(Grocery.update).toHaveBeenCalledWith(1, item);
            expect(Grocery.findById).toHaveBeenCalledWith(1);
        });

        it('should throw an error if update fails', async () => {
            Grocery.update.mockResolvedValue(false);

            await expect(GroceryService.updateItem(99, { name: 'Invalid' })).rejects.toThrow('Failed to update item');
        });
    });

    describe('deleteItem', () => {
        it('should delete an item successfully', async () => {
            Grocery.delete.mockResolvedValue(true);

            const result = await GroceryService.deleteItem(1);
            expect(result).toBe(true);
            expect(Grocery.delete).toHaveBeenCalledWith(1);
        });

        it('should throw an error if item not found', async () => {
            Grocery.delete.mockResolvedValue(false);

            await expect(GroceryService.deleteItem(99)).rejects.toThrow('Item not found');
        });
    });

    describe('updateQuantity', () => {
        it('should update the quantity of an item successfully', async () => {
            Grocery.updateQuantity.mockResolvedValue(true);

            const result = await GroceryService.updateQuantity(1, 15, 101);
            expect(result).toBe(true);
            expect(Grocery.updateQuantity).toHaveBeenCalledWith(1, 15, 101);
        });

        it('should throw an error if item ID is missing', async () => {
            await expect(GroceryService.updateQuantity(null, 10, 101)).rejects.toThrow('Item ID and user ID are required');
        });
    });

    describe('getPurchaseHistory', () => {
        it('should return purchase history for an item', async () => {
            const history = [{ id: 1, itemId: 1, quantity: 10 }];
            Grocery.getPurchaseHistory.mockResolvedValue(history);

            const result = await GroceryService.getPurchaseHistory(1);
            expect(result).toEqual(history);
            expect(Grocery.getPurchaseHistory).toHaveBeenCalledWith(1);
        });

        it('should return all purchase history if item ID is not provided', async () => {
            const history = [{ id: 1, itemId: 1, quantity: 10 }, { id: 2, itemId: 2, quantity: 5 }];
            Grocery.getPurchaseHistory.mockResolvedValue(history);

            const result = await GroceryService.getPurchaseHistory();
            expect(result).toEqual(history);
            expect(Grocery.getPurchaseHistory).toHaveBeenCalledWith(null);
        });
    });

    describe('getByCategory', () => {
        it('should return items by category', async () => {
            const items = [{ id: 1, name: 'Apple', category: 'Fruits' }];
            Grocery.getByCategory.mockResolvedValue(items);

            const result = await GroceryService.getByCategory('Fruits');
            expect(result).toEqual(items);
            expect(Grocery.getByCategory).toHaveBeenCalledWith('Fruits');
        });

        it('should throw an error if category is not provided', async () => {
            await expect(GroceryService.getByCategory(null)).rejects.toThrow('Category is required');
        });
    });

    describe('getLowStockItems', () => {
        it('should return low stock items', async () => {
            const items = [{ id: 1, name: 'Apple', quantity: 2 }];
            Grocery.getLowStockItems.mockResolvedValue(items);

            const result = await GroceryService.getLowStockItems();
            expect(result).toEqual(items);
            expect(Grocery.getLowStockItems).toHaveBeenCalled();
        });
    });
});
