import express from 'express';
import GroceryController from '../controllers/GroceryController.js';

const router = express.Router();

// CRUD routes
router.post('/', GroceryController.createItem);
router.get('/', GroceryController.getAllItems);
router.get('/:id', GroceryController.getItemById);
router.put('/:id', GroceryController.updateItem);
router.delete('/:id', GroceryController.deleteItem);

// Quantity management
router.post('/:id/quantity', GroceryController.updateQuantity);

// History and filters
router.get('/:id/history', GroceryController.getPurchaseHistory);
router.get('/category/:category', GroceryController.getByCategory);
router.get('/status/low', GroceryController.getLowStockItems);

export default router;