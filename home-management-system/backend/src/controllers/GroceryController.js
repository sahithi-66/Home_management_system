import Grocery from '../models/Grocery.js';

class GroceryController {
    getAllItems(req, res) {
        const items = Grocery.getItems();
        res.json(items);
    }

    addItem(req, res) {
        const { name, quantity } = req.body;
        Grocery.addItem(name, quantity);
        res.status(201).json({ message: 'Item added successfully' });
    }

    subtractItem(req, res) {
        const { name, quantity } = req.body;
        Grocery.subtractItem(name, quantity);
        res.status(200).json({ message: 'Item subtracted successfully' });
    }
}

export default new GroceryController();