import db from '../config/database.js';

class Expense {
    static async create(expense, splits) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Create expense
            const [result] = await connection.execute(
                'INSERT INTO expenses (description, amount, payer_id, split_type, date, category) VALUES (?, ?, ?, ?, CURDATE(), ?)',
                [expense.description, expense.amount, expense.payer_id, expense.split_type, expense.category]
            );
            const expenseId = result.insertId;

            // Create splits
            for (const split of splits) {
                await connection.execute(
                    'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
                    [expenseId, split.user_id, split.contributed_amount]
                );
            }

            await connection.commit();
            return expenseId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async findAll() {
        const [expenses] = await db.execute(`
            SELECT e.*, u.username as payer_name
            FROM expenses e
            JOIN users u ON e.payer_id = u.id
            ORDER BY e.date DESC
        `);

        // Get splits for each expense
        for (let expense of expenses) {
            const [splits] = await db.execute(`
                SELECT es.*, u.username as user_name
                FROM expense_splits es
                JOIN users u ON es.user_id = u.id
                WHERE es.expense_id = ?
            `, [expense.id]);
            expense.splits = splits;
        }

        return expenses;
    }

    static async findById(id) {
        const [expenses] = await db.execute(
            'SELECT * FROM expenses WHERE id = ?',
            [id]
        );
        if (expenses.length === 0) return null;

        const expense = expenses[0];
        const [splits] = await db.execute(
            'SELECT * FROM expense_splits WHERE expense_id = ?',
            [id]
        );
        expense.splits = splits;
        return expense;
    }

    static async update(id, expense, splits) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Update expense
            await connection.execute(
                'UPDATE expenses SET description = ?, amount = ?, payer_id = ?, split_type = ?, category = ? WHERE id = ?',
                [expense.description, expense.amount, expense.payer_id, expense.split_type, expense.category, id]
            );

            // Delete old splits
            await connection.execute('DELETE FROM expense_splits WHERE expense_id = ?', [id]);

            // Create new splits
            for (const split of splits) {
                await connection.execute(
                    'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
                    [id, split.user_id, split.amount]
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

    static async delete(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Delete splits first due to foreign key constraint
            await connection.execute('DELETE FROM expense_splits WHERE expense_id = ?', [id]);
            
            // Then delete expense
            await connection.execute('DELETE FROM expenses WHERE id = ?', [id]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getByCategory(category) {
        const [rows] = await db.execute(
            'SELECT * FROM expenses WHERE category = ?',
            [category]
        );
        return rows;
    }

    static async getSummaryByUser(userId) {
        const [rows] = await db.execute(`
            SELECT 
                u.username,
                SUM(CASE WHEN e.payer_id = ? THEN e.amount ELSE 0 END) as total_paid,
                SUM(es.amount) as total_owed
            FROM users u
            LEFT JOIN expense_splits es ON u.id = es.user_id
            LEFT JOIN expenses e ON es.expense_id = e.id
            WHERE u.id = ?
            GROUP BY u.id, u.username
        `, [userId, userId]);
        return rows[0];
    }
}

export default Expense;