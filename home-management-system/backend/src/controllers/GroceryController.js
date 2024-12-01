import GroceryService from '../services/GroceryService.js';

class GroceryController {
    async createItem(req, res, next) {
        try {
            const itemId = await GroceryService.createItem(req.body);
            res.status(201).json({
                id: itemId,
                message: 'Item created successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllItems(req, res, next) {
        try {
            const items = await GroceryService.getAllItems();
            res.json(items);
        } catch (error) {
            next(error);
        }
    }

    async getItemById(req, res, next) {
        try {
            const item = await GroceryService.getItemById(req.params.id);
            res.json(item);
        } catch (error) {
            next(error);
        }
    }

    async updateItem(req, res, next) {
        try {
            const item = await GroceryService.updateItem(req.params.id, req.body);
            res.json({
                item,
                message: 'Item updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteItem(req, res, next) {
        try {
            await GroceryService.deleteItem(req.params.id);
            res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async updateQuantity(req, res, next) {
        try {
            const { quantity } = req.body;
            await GroceryService.updateQuantity(req.params.id, quantity, 5);
            res.json({ message: 'Quantity updated successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getPurchaseHistory(req, res, next) {
        try {
            const history = await GroceryService.getPurchaseHistory(req.params.id);
            res.json(history);
        } catch (error) {
            next(error);
        }
    }

    async getByCategory(req, res, next) {
        try {
            const items = await GroceryService.getByCategory(req.params.category);
            res.json(items);
        } catch (error) {
            next(error);
        }
    }

    async getLowStockItems(req, res, next) {
        try {
            const items = await GroceryService.getLowStockItems();
            res.json(items);
        } catch (error) {
            next(error);
        }
    }
}

export default new GroceryController();