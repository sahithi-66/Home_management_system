import Grocery from '../models/Grocery.js';

class GroceryService {
    async createItem(itemData) {
        if (!itemData.name) {
            throw new Error('Item name is required');
        }
        return await Grocery.create(itemData);
    }

    async getAllItems() {
        return await Grocery.findAll();
    }

    async getItemById(id) {
        const item = await Grocery.findById(id);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    }

    async updateItem(id, itemData) {
        const success = await Grocery.update(id, itemData);
        if (!success) {
            throw new Error('Failed to update item');
        }
        return await this.getItemById(id);
    }

    async deleteItem(id) {
        const success = await Grocery.delete(id);
        if (!success) {
            throw new Error('Item not found');
        }
        return true;
    }

    async updateQuantity(id, quantity, userId) {
        if (!id) {
            throw new Error('Item ID and user ID are required');
        }
        return await Grocery.updateQuantity(id, quantity, userId);
    }

    async getPurchaseHistory(itemId = null) {
        return await Grocery.getPurchaseHistory(itemId);
    }

    async getByCategory(category) {
        if (!category) {
            throw new Error('Category is required');
        }
        return await Grocery.getByCategory(category);
    }

    async getLowStockItems() {
        return await Grocery.getLowStockItems();
    }
}

export default new GroceryService();