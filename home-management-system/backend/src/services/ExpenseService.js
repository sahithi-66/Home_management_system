// import express from 'express';
// import cors from 'cors';
// import mysql from 'mysql2/promise';

// const app = express();
// app.use(cors());
// app.use(express.json());

// const dbConfig = {
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'home_management',
// };

// app.get('/api/users', async (req, res) => {
//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);
//         const [rows] = await connection.query('SELECT id, name FROM users');
//         console.log('rows: ',rows);
//         res.json(rows);
//     } catch (error) {
//         console.error('Error fetching users:', error.message);
//         res.status(500).json({ error: 'Error fetching users' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });

// app.get('/api/getClearedSplits',async(req,res) =>{
//     let connection;
//     try {
//         // Establish a database connection
//         connection = await mysql.createConnection(dbConfig);

//         // Fetch total_paid and total_owed for each user
//         const [results] = await connection.query(
//             `SELECT 
//                 id AS split_id,
//                 debtor,
//                 creditor,
//                 CAST(amount AS DECIMAL(10,2)) AS amount,
//                 cleared_at
//             FROM 
//                 cleared_splits;`);
//         res.json({
//             success: true,
//             message: 'Cleared splits retrieved successfully.',
//             data: results,
//         });
//     }catch (error) {
//         console.error('Error in /api/getClearedSplits:', error);
//         res.status(500).json({ success: false, message: 'Error in getting cleared splits.', error });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });
// app.get('/api/getSplits', async (req, res) => {
//     let connection;
//     try {
//         // Establish a database connection
//         connection = await mysql.createConnection(dbConfig);

//         // Fetch total_paid and total_owed for each user
//         const [results] = await connection.query(`
//             SELECT 
//                 u.id AS user_id, 
//                 u.name AS user_name,  
//                 COALESCE(e.total_paid, 0) AS total_paid, 
//                 COALESCE(es.total_owed, 0) AS total_owed,
//                 COALESCE(cs.debtor_cleared, 0) AS debtor_cleared,
//                 COALESCE(cs.creditor_cleared, 0) AS creditor_cleared
//             FROM 
//                 users u
//             LEFT JOIN 
//                 (SELECT payer_id, SUM(amount) AS total_paid FROM expenses GROUP BY payer_id) e 
//             ON 
//                 u.id = e.payer_id
//             LEFT JOIN 
//                 (SELECT user_id, SUM(amount) AS total_owed FROM expense_splits GROUP BY user_id) es 
//             ON 
//                 u.id = es.user_id
//             LEFT JOIN 
//                 (SELECT 
//                     debtor AS user_name, 
//                     SUM(amount) AS debtor_cleared, 
//                     0 AS creditor_cleared
//                 FROM cleared_splits 
//                 GROUP BY debtor
//                 UNION ALL
//                 SELECT 
//                     creditor AS user_name, 
//                     0 AS debtor_cleared, 
//                     SUM(amount) AS creditor_cleared
//                 FROM cleared_splits 
//                 GROUP BY creditor) cs
//             ON 
//                 u.name = cs.user_name;

//         `);

//         // Update each user's `is_debitor` and `net_amount`
//         console.log("results: ",results);
//         const updatePromises = results.map((user) => {
//             const totalCleared = user.creditor_cleared - user.debtor_cleared;
//             const net = user.total_paid - user.total_owed-totalCleared;
//             const isDebitor = net < 0;
//             console.log("Net: ",net);
//             return connection.query(
//                 'UPDATE users SET is_debitor = ?, net_amount = ? WHERE id = ?',
//                 [isDebitor, net, user.user_id]
//             );
//         });

//         // Wait for all updates to complete
//         await Promise.all(updatePromises);

//         // Send response with results
//         res.json({
//             success: true,
//             message: 'User debt status and net amount updated successfully.',
//             data: results.map((user) => ({
//                 user_id: user.user_id,
//                 user_name: user.user_name,
//                 total_paid: user.total_paid,
//                 total_owed: user.total_owed,
//                 net_amount: user.total_paid - user.total_owed-(user.creditor_cleared - user.debtor_cleared),
//                 is_debitor: user.total_paid - user.total_owed - (user.creditor_cleared - user.debtor_cleared)< 0
//             }))
//         });

//     } catch (error) {
//         console.error('Error in /api/getSplits:', error);
//         res.status(500).json({ success: false, message: 'Error calculating or updating splits.', error });
//     } finally {
//         // Ensure the database connection is closed
//         if (connection) {
//             await connection.end();
//         }
//     }
// });
// // // Endpoint to fetch all expenses
// // app.get('/api/expenses', async (req, res) => {
// //     let connection;
// //     try {
// //         connection = await mysql.createConnection(dbConfig);
// //         const [expenses] = await connection.query('SELECT * FROM expenses');
// //         res.json(expenses);
// //     } catch (error) {
// //         console.error('Error fetching expenses:', error.message);
// //         res.status(500).json({ error: 'Error fetching expenses' });
// //     } finally {
// //         if (connection) {
// //             await connection.end();
// //         }
// //     }
// // });
// // Endpoint to fetch all expenses along with their splits (contributors)
// app.get('/api/expenses', async (req, res) => {
//     console.log("Here1");
//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);

//         // Fetch all expenses with the payer information
//         const [expenses] = await connection.query(`
//             SELECT e.id, e.description, e.amount, e.payer_id, u.name AS payer_name
//             FROM expenses e
//             JOIN users u ON e.payer_id = u.id
//         `);
            
//         // Fetch the splits for each expense (user contributions)
//         const expensesWithSplits = await Promise.all(
//             expenses.map(async (expense) => {
//                 console.log(`Processing expense with id: ${expense.id}`);
//                 const [splits] = await connection.query(`
//                     SELECT us.name AS user_name, es.amount AS contributed_amount
//                     FROM expense_splits es
//                     JOIN users us ON es.user_id = us.id
//                     WHERE es.expense_id = ?
//                 `, [expense.id]);
                
//                 // Adding the splits to the expense object
//                 expense.splits = splits;
//                 return expense;
//             })
//         );
//         console.log("expensesWithSplits:",expensesWithSplits);
//         res.json(expensesWithSplits);
//     } catch (error) {
//         console.error('Error fetching expenses:', error.message);
//         res.status(500).json({ error: 'Error fetching expenses' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });
// app.post("/api/clearSplit/:id", async (req, res) => {
//     const splitId = parseInt(req.params.id);
//     const { amount, splits } = req.body;
//     let connection;
//     connection = await mysql.createConnection(dbConfig);

//     try {
//         const split = splits.find((s) => s.id === splitId);
//         console.log("SplitId: ", splitId);
//         console.log("amount", amount);

//         if (!split) {
//             return res.status(404).json({
//                 message: "Split not found",
//                 updatedSplits: splits,
//             });
//         }

//         if (amount > split.amount) {
//             return res.status(400).json({
//                 message: "Amount exceeds the outstanding balance",
//                 updatedSplits: splits,
//             });
//         }

//         // Update split amount
//         split.amount -= amount;
//         const index = splits.indexOf(split);

//         // Remove split if cleared completely
//         if (split.amount === 0) {
//             splits.splice(index, 1);
//         } else {
//             splits[index].amount = split.amount;
//         }

//         // Retrieve and update user balances
//         const [debtorResult] = await connection.query(
//             "SELECT net_amount FROM users WHERE name = ?",
//             [split.debtor]
//         );
//         const [creditorResult] = await connection.query(
//             "SELECT net_amount FROM users WHERE name = ?",
//             [split.creditor]
//         );

//         const numericAmount = parseFloat(amount);
//         const debtorNetAmount = parseFloat(debtorResult[0].net_amount) + numericAmount;
//         const creditorNetAmount = parseFloat(creditorResult[0].net_amount) - numericAmount;

//         await connection.query(
//             "UPDATE users SET net_amount = ?, is_debitor = ? WHERE name = ?",
//             [debtorNetAmount, debtorNetAmount < 0, split.debtor]
//         );
//         await connection.query(
//             "UPDATE users SET net_amount = ?, is_debitor = ? WHERE name = ?",
//             [creditorNetAmount, creditorNetAmount < 0, split.creditor]
//         );

//         // Insert into cleared_splits
//         await connection.query(
//             "INSERT INTO cleared_splits (debtor, creditor, amount) VALUES (?, ?, ?)",
//             [split.debtor, split.creditor, numericAmount]
//         );

//         // Create clearedSplit object
//         const clearedSplit = {
//             id: splitId,
//             debtor: split.debtor,
//             creditor: split.creditor,
//             amount: numericAmount,
//         };

//         res.json({
//             message: split.amount === 0 ? "Split cleared successfully" : "Partial split cleared successfully",
//             updatedSplits: splits,
//             clearedSplit,
//         });
//     } catch (error) {
//         console.error("Error processing split:", error.message);
//         res.status(500).json({ error: "Failed to process split" });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });

// // app.post("/api/clearSplit/:id", async (req, res) => {
// //     const splitId = parseInt(req.params.id);
// //     const { amount, splits } = req.body;
// //     let connection;
// //     connection = await mysql.createConnection(dbConfig);
// //     try{
// //         const split = splits.find((s) => s.id === splitId);
// //         console.log("SplitId: ",splitId);
// //         console.log("amount",amount);
        
        
// //         if (!split) {
// //             return res.status(404).json({ message: "Split not found",updatedSplits: splits  });
// //         }

// //         if (amount > split.amount) {
// //             return res.status(400).json({ message: "Amount exceeds the outstanding balance",updatedSplits: splits  });
// //         }
// //         split.amount -= amount;
// //         const index = splits.indexOf(split);
// //         if (split.amount === 0) {
// //             splits.splice(index, 1);
// //         }
// //         else if(amount!==0 && split.amount!==0){
// //             splits[index].amount=split.amount;
// //         }
// //         const [debtorResult] = await connection.query(
// //             'SELECT net_amount FROM users WHERE name = ?',
// //             [split.debtor]
// //         );
// //         const [creditorResult] = await connection.query(
// //             'SELECT net_amount FROM users WHERE name = ?',
// //             [split.creditor]
// //         );
        
// //         console.log("amount:",amount);
// //         const numericAmount = parseFloat(amount);
// //         const debtorNetAmount = parseFloat(debtorResult[0].net_amount) + numericAmount;
// //         const creditorNetAmount = parseFloat(creditorResult[0].net_amount) - numericAmount;
// //         console.log("Debitor Net Amount: ",debtorResult[0].net_amount);
// //         console.log("Creditor Net Amount: ",creditorResult[0].net_amount);
// //         console.log("Debitor Net Amount: ",debtorNetAmount);
// //         console.log("Creditor Net Amount: ",creditorNetAmount);
// //         await connection.query(
// //             'UPDATE users SET net_amount = ?, is_debitor = ? WHERE name = ?',
// //             [debtorNetAmount, debtorNetAmount < 0, split.debtor]
// //         );
// //         await connection.query(
// //             'UPDATE users SET net_amount = ?, is_debitor = ? WHERE name = ?',
// //             [creditorNetAmount, creditorNetAmount < 0, split.creditor]
// //         );
// //         await connection.query(
// //             'INSERT INTO cleared_splits (debtor, creditor, amount) VALUES (?, ?, ?)',
// //             [split.debtor, split.creditor, numericAmount]
// //         );

// //         res.json({
// //             message: split.amount === 0 ? "Split cleared successfully" : "Partial split cleared successfully",
// //             updatedSplits: splits,
// //         });
// //     }
// //     catch (error) {
// //         console.error("Error processing split:", error.message);
// //         res.status(500).json({ error: "Failed to process split" });
// //     } finally {
// //         if (connection) {
// //             await connection.end();
// //         }
// //     }

// // });
// // Endpoint to fetch expenses by category
// app.get('/api/expenses/category/:category', async (req, res) => {
//     const { category } = req.params;
//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);
//         const [expenses] = await connection.query(
//             'SELECT * FROM expenses WHERE category = ?',
//             [category]
//         );
//         res.json(expenses);
//     } catch (error) {
//         console.error('Error fetching expenses by category:', error.message);
//         res.status(500).json({ error: 'Error fetching expenses by category' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });

// // Endpoint to add an expense
// app.post('/api/expenses', async (req, res) => {
//     const { description, amount, payer_id, split_type, participantShares, category } = req.body;
//     console.log("Here2");
//     // Input validation
//     console.log(`Description: ${!description}`);
//     console.log(`Description: ${!amount}`);
//     console.log(`Description: ${!payer_id}`);
//     console.log(`Description: ${!split_type}`);
//     console.log(`participantShares: ${!participantShares}`);
//     console.log(`category: ${!category}`);
//     console.log("Participant Shares: ",participantShares);
//     if (!description || !amount || !payer_id || !split_type || !participantShares || !category) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);
//         console.log("line-159");
//         // Insert expense into the `expenses` table
//         const [expenseResult] = await connection.query(
//             'INSERT INTO expenses (description, amount, payer_id, split_type, date, category) VALUES (?, ?, ?, ?, CURDATE(), ?)',
//             [description, amount, payer_id, split_type, category]
//         );
//         console.log("line-165");
//         const expenseId = expenseResult.insertId;
//         console.log("participants shares:",participantShares);
//         const ps = Object.entries(participantShares)
//             .map((share) => ({
//                 user_id: Number(share.userId),
//                 contributed_amount: Number(share.contributed_amount),
//             }));
//         console.log("pspspsps: ",ps);
//         // Insert splits into the `expense_splits` table
//         const splitPromises = participantShares.map((split) =>
//             connection.query(
//                 'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
//                 [expenseId, Number(split.user_id), Number(split.contributed_amount)],            
//                 (err, result) => {
//                     if (err) {
//                         console.error(`Error inserting split for user_id=${split.user_id}:`, err);
//                         return;
//                     }
//                     console.log(`Insert successful for user_id=${split.user_id}, result:`, result);
//                 }
//             )
//         );
//         console.log(`Inserting split: expenseId=${expenseId}, amount=${amount}`);
//         console.log("line-175");
//         await Promise.all(splitPromises);

//         // Fetch the newly added expense along with splits
//         const [newExpense] = await connection.query(
//             'SELECT * FROM expenses WHERE id = ?',
//             [expenseId]
//         );
//         console.log("line-183");
//         const [splits] = await connection.query(
//             'SELECT * FROM expense_splits WHERE expense_id = ?',
//             [expenseId]
//         );
//         console.log("line-188");
//         newExpense[0].splits = splits; // Adding splits to the expense data

//         res.status(201).json({ message: 'Expense added successfully!', expense: newExpense[0] });
//     } catch (error) {
//         console.error('Error adding expense:', error);
//         res.status(500).json({ error: 'Failed to add expense' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });

// // Endpoint to update an expense
// app.put('/api/expenses/:expenseId', async (req, res) => {
//     const { expenseId } = req.params;
//     const { description, amount, payer_id, split_type, participantShares, category } = req.body;

//     if (!description || !amount || !payer_id || !split_type || !participantShares || !category) {
//         return res.status(400).json({ error: 'All fields are required' });
//     }

//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);

//         // Update expense
//         await connection.query(
//             'UPDATE expenses SET description = ?, amount = ?, payer_id = ?, split_type = ?, category = ? WHERE id = ?',
//             [description, amount, payer_id, split_type, category, expenseId]
//         );

//         // Update splits
//         await connection.query('DELETE FROM expense_splits WHERE expense_id = ?', [expenseId]);

//         const splitPromises = Object.entries(participantShares).map(([userId, share]) =>
//             connection.query(
//                 'INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (?, ?, ?)',
//                 [expenseId, userId, Number(share)]
//             )
//         );

//         await Promise.all(splitPromises);

//         res.status(200).json({ message: 'Expense updated successfully' });
//     } catch (error) {
//         console.error('Error updating expense:', error.message);
//         res.status(500).json({ error: 'Failed to update expense' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });

// // Endpoint to delete an expense
// app.delete('/api/expenses/:expenseId', async (req, res) => {
//     const { expenseId } = req.params;
//     let connection;
//     try {
//         connection = await mysql.createConnection(dbConfig);

//         // Delete splits associated with the expense
//         await connection.query('DELETE FROM expense_splits WHERE expense_id = ?', [expenseId]);

//         // Delete the expense
//         await connection.query('DELETE FROM expenses WHERE id = ?', [expenseId]);

//         res.status(200).json({ message: 'Expense deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting expense:', error.message);
//         res.status(500).json({ error: 'Failed to delete expense' });
//     } finally {
//         if (connection) {
//             await connection.end();
//         }
//     }
// });




// const PORT = 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
