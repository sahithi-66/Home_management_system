import express from 'express';
import GroceryController from '../controllers/GroceryController.js';

const router = express.Router();

router.get('/', GroceryController.getAllItems);
router.post('/add', GroceryController.addItem);
router.post('/subtract', GroceryController.subtractItem);

export default router;