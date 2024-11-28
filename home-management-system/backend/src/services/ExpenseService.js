import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
app.use(cors());
app.use(express.json());
//Uncomment to connect to the DB 
// const dbConfig = {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'home_management',
// };

// Endpoint to fetch all users (participants)
app.get('/api/users', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query('SELECT id, name FROM users');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ error: 'Error fetching users' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// // Endpoint to fetch all expenses
// app.get('/api/expenses', async (req, res) => {
//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);
//         const [expenses] = await connection.query('SELECT * FROM expenses');
//         res.json(expenses);
//     } catch (error) {
//         console.error('Error fetching expenses:', error.message);
//         res.status(500).json({ error: 'Error fetching expenses' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });
// Endpoint to fetch all expenses along with their splits (contributors)
app.get('/api/expenses', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Fetch all expenses with the payer information
        const [expenses] = await connection.query(`
            SELECT e.id, e.description, e.amount, e.payer_id, u.name AS payer_name
            FROM expenses e
            JOIN users u ON e.payer_id = u.id
        `);

        // Fetch the splits for each expense (user contributions)
        const expensesWithSplits = await Promise.all(
            expenses.map(async (expense) => {
                console.log(`Processing expense with id: ${expense.id}`);
                const [splits] = await connection.query(`
                    SELECT us.name AS user_name, es.amount AS contributed_amount
                    FROM expense_splits es
                    JOIN users us ON es.user_id = us.id
                    WHERE es.expense_id = ?
                `, [expense.id]);
                splits.forEach(split =>{
                    console.log(`User Name - Updated: ${split.user_name}`);
                    console.log(`Amount - Updated: ${split.contributed_amount}`);
                });
                // Adding the splits to the expense object
                expense.splits = splits;
                return expense;
            })
        );

        res.json(expensesWithSplits);
    } catch (error) {
        console.error('Error fetching expenses:', error.message);
        res.status(500).json({ error: 'Error fetching expenses' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Endpoint to fetch expenses by category
app.get('/api/expenses/category/:category', async (req, res) => {
    const { category } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [expenses] = await connection.query(
            'SELECT * FROM expenses WHERE category = ?',
            [category]
        );
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses by category:', error.message);
        res.status(500).json({ error: 'Error fetching expenses by category' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Endpoint to add an expense
app.post('/api/expenses', async (req, res) => {
    const { description, amount, payer_id, split_type, participantShares, category } = req.body;

    // Input validation
    console.log(`Description: ${!description}`);
    console.log(`Description: ${!amount}`);
    console.log(`Description: ${!payer_id}`);
    console.log(`Description: ${!split_type}`);
    console.log(`participantShares: ${!participantShares}`);
    console.log(`category: ${!category}`);
    if (!description || !amount || !payer_id || !split_type || !participantShares || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Insert expense into the `expenses` table
        const [expenseResult] = await connection.query(
            'INSERT INTO expenses (description, amount, payer_id, split_type, date, category) VALUES (?, ?, ?, ?, CURDATE(), ?)',
            [description, amount, payer_id, split_type, category]
        );

        const expenseId = expenseResult.insertId;

        // Insert splits into the `expense_splits` table
        const splitPromises = Object.entries(participantShares).map(([userId, share]) =>
            connection.query(
                'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
                [expenseId, userId, Number(share)]
            )
        );

        await Promise.all(splitPromises);

        // Fetch the newly added expense along with splits
        const [newExpense] = await connection.query(
            'SELECT * FROM expenses WHERE id = ?',
            [expenseId]
        );

        const [splits] = await connection.query(
            'SELECT * FROM expense_splits WHERE expense_id = ?',
            [expenseId]
        );

        newExpense[0].splits = splits; // Adding splits to the expense data

        res.status(201).json({ message: 'Expense added successfully!', expense: newExpense[0] });
    } catch (error) {
        console.error('Error adding expense:', error.message);
        res.status(500).json({ error: 'Failed to add expense' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Endpoint to update an expense
app.put('/api/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    const { description, amount, payer_id, split_type, participantShares, category } = req.body;

    if (!description || !amount || !payer_id || !split_type || !participantShares || !category) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Update expense
        await connection.query(
            'UPDATE expenses SET description = ?, amount = ?, payer_id = ?, split_type = ?, category = ? WHERE id = ?',
            [description, amount, payer_id, split_type, category, expenseId]
        );

        // Update splits
        await connection.query('DELETE FROM expense_splits WHERE expense_id = ?', [expenseId]);

        const splitPromises = Object.entries(participantShares).map(([userId, share]) =>
            connection.query(
                'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
                [expenseId, userId, Number(share)]
            )
        );

        await Promise.all(splitPromises);

        res.status(200).json({ message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Error updating expense:', error.message);
        res.status(500).json({ error: 'Failed to update expense' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

// Endpoint to delete an expense
app.delete('/api/expenses/:expenseId', async (req, res) => {
    const { expenseId } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // Delete splits associated with the expense
        await connection.query('DELETE FROM expense_splits WHERE expense_id = ?', [expenseId]);

        // Delete the expense
        await connection.query('DELETE FROM expenses WHERE id = ?', [expenseId]);

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error.message);
        res.status(500).json({ error: 'Failed to delete expense' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});




const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
