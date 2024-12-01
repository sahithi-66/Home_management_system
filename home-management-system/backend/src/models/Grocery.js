import db from '../config/database.js';

class Grocery {
    static async create(item) {
        const [result] = await db.execute(
            'INSERT INTO grocery_items (name, quantity, unit, status, threshold_quantity, category) VALUES (?, ?, ?, ?, ?, ?)',
            [item.name, item.quantity, item.unit, item.status || 'IN_STOCK', item.threshold_quantity || 1, item.category]
        );
        return result.insertId;
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM grocery_items ORDER BY name');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM grocery_items WHERE id = ?', [id]);
        return rows[0];
    }

    static async update(id, item) {
        const [result] = await db.execute(
            'UPDATE grocery_items SET name = ?, quantity = ?, unit = ?, status = ?, threshold_quantity = ?, category = ? WHERE id = ?',
            [item.name, item.quantity, item.unit, item.status, item.threshold_quantity, item.category, id]
        );
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM grocery_items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async updateQuantity(id, quantity, userId) {
        // Input validation
        if (!id || quantity === undefined) {
            throw new Error('Item ID and quantity are required');
        }
    
        // Ensure userId is provided for positive quantities
        if (quantity > 0 && !userId) {
            throw new Error('User ID is required for purchases');
        }
    
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
    
            // Get current item
            const [items] = await connection.execute('SELECT * FROM grocery_items WHERE id = ?', [id]);
            if (!items.length) throw new Error('Item not found');
    
            const item = items[0];
            const newQuantity = item.quantity + quantity;
            let status = item.status;
    
            // Update status based on quantity and threshold
            if (newQuantity <= 0) {
                status = 'OUT_OF_STOCK';
            } else if (newQuantity <= item.threshold_quantity) {
                status = 'LOW';
            } else {
                status = 'IN_STOCK';
            }
    
            // For positive quantities, record purchase date
            const purchaseDate = quantity > 0 ? new Date() : null;
    
            // Update item quantity and status
            await connection.execute(
                'UPDATE grocery_items SET quantity = ?, status = ?, last_purchased = ? WHERE id = ?',
                [newQuantity, status, purchaseDate, id]
            );
    
            // Record in purchase history only if it's a purchase and userId is provided
            if (quantity > 0 && userId) {
                await connection.execute(
                    'INSERT INTO grocery_history (item_id, quantity, purchased_by) VALUES (?, ?, ?)',
                    [id, quantity, userId]
                );
            }
    
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getPurchaseHistory(itemId = null) {
        let query = `
            SELECT gh.*, gi.name as item_name, u.username as purchaser_name
            FROM grocery_history gh
            JOIN grocery_items gi ON gh.item_id = gi.id
            JOIN users u ON gh.purchased_by = u.id
            ${itemId ? 'WHERE gh.item_id = ?' : ''}
            ORDER BY gh.purchased_at DESC
        `;
        
        const [rows] = await db.execute(query, itemId ? [itemId] : []);
        return rows;
    }

    static async getByCategory(category) {
        const [rows] = await db.execute('SELECT * FROM grocery_items WHERE category = ?', [category]);
        return rows;
    }

    static async getLowStockItems() {
        const [rows] = await db.execute('SELECT * FROM grocery_items WHERE status IN ("LOW", "OUT_OF_STOCK")');
        return rows;
    }
}

export default Grocery;