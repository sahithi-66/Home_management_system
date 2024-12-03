import React, { useState, useEffect } from 'react';
import './ExpenditureSplit.css';
import { Helmet } from 'react-helmet';

const ExpenditureSplit = ({ splits: initialSplits}) => {
    const [splits, setSplits] = useState(initialSplits);
    const [paymentAmounts, setPaymentAmounts] = useState({});
    const [participants, setParticipants] = useState([]);
    const [expenseName, setExpenseName] = useState('');
    const [clearedSplits, setClearedSplits] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState('');
    const [category, setCategory] = useState('General');
    const [participantShares, setParticipantShares] = useState({});
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPendingSplits, setShowPendingSplits] = useState(false);
    const [showClearedSplits, setShowClearedSplits] = useState(false);
    const [showExpenses, setShowExpenses] = useState(false);
    const [categories, setCategories] = useState(['General', 'Food', 'Utility', 'Travel', 'Miscellaneous']);  // Add categories here
    useEffect(() => {
        console.log('Initial Splits:', splits);
    }, [splits]);
    useEffect(() => {
        console.log('Updated participants:', participants);
    }, [participants]);
    const calculateSplits = (users) => {
        console.log("Inside Calculate Splits: ",users);
        const creditors = users.filter(user => user.net_amount > 0).map(user => ({ ...user }));
        const debtors = users.filter(user => user.net_amount < 0).map(user => ({ ...user }));

        const splits = [];
        let splitId = 1;

        for (let debtor of debtors) {
            while (debtor.net_amount < 0) {
                const creditor = creditors.find(creditor => creditor.net_amount > 0);
                if (!creditor) {
                    console.error('No creditor with a positive balance found.');
                    break; // Exit the loop if no creditor is available
                }
                console.log("Creditors: ",creditor.user_name);
                console.log("Debtors: ",debtor.user_name);
                const settleAmount = Math.min(Math.abs(debtor.net_amount), creditor.net_amount);

                
                splits.push({
                    id: splitId++,
                    debtor: debtor.user_name,
                    creditor: creditor.user_name,
                    amount: settleAmount
                });

                debtor.net_amount += settleAmount;
                creditor.net_amount -= settleAmount;

                if (creditor.net_amount === 0) {
                    creditors.shift();
                }
            }
        }
        console.log("Splits Summary: ",splits);
        return splits;
    };
    const fetchExpenses = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/expenses');
            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            setError('Error fetching expenses');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchClearedSplits = async () =>{
        try {
            const response = await fetch('http://localhost:5000/api/getClearedSplits');
            const data = await response.json();
            setClearedSplits(data.data);
            console.log(data.data);
        } catch (error) {
            setError('Error fetching Cleared Splits');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const fetchSplits = async() =>{
        try{
            const response = await fetch('http://localhost:5000/api/getSplits');
            const data = await response.json();
            console.log("Data: ",data.data);
            const result = calculateSplits(data.data);
            setSplits(result);
        }
        catch(error){
            setError('Error fetching Pending Splits');
            console.error(error);
        }
        finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users');
                const data = await response.json();
                console.log('Fetched Participants:', data.participants);
                console.log("data: ",data);
                setParticipants(data);
                setParticipantShares(
                    data.reduce((acc, participant) => {
                        acc[participant.id] = '';  
                        return acc;
                    }, {})
                );
            } catch (error) {
                setError('Error fetching participants');
                console.error(error);
            }
        };
        
        fetchClearedSplits();
        fetchParticipants();
        fetchExpenses();
        fetchSplits();
    }, []);
    const handleShareChange = (participant, value) => {
        setParticipantShares({
            ...participantShares,
            [participant]: value,
        });
    };

    const handleInputChange = (splitId, amount) => {
        setPaymentAmounts({ ...paymentAmounts, [splitId]: amount });
    };

    // const clearSplit = async(splitId, remainingAmount) => {
    //     const amountToClear = paymentAmounts[splitId] || 0;
    //     console.log("----------------------------------------------");
    //     console.log("amount to clear: ",amountToClear);
    //     console.log("----------------------------------------------");
    //     if (amountToClear > 0) {
    //         // Call backend API to update the split
    //         fetch(`http://localhost:5000/api/clearSplit/${splitId}`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ amount: amountToClear,splits: splits }),
    //         })
    //             .then((response) => response.json())
    //             .then((data) => {
    //                 alert(data.message);
    //                 // Optionally refresh splits
    //                 setSplits(data.updatedSplits);
    //                 updateSummary(data.updatedSplits);
    //                 setClearedSplits((prevClearedSplits) => {
    //                     const clearedSplit = data.clearedSplit; // Assuming backend returns the cleared split
    //                     const existingIndex = prevClearedSplits.findIndex(
    //                         (split) => split.id === clearedSplit.id
    //                     );
    
    //                     if (existingIndex !== -1) {
    //                         // Update existing split
    //                         const updatedClearedSplits = [...prevClearedSplits];
    //                         updatedClearedSplits[existingIndex] = clearedSplit;
    //                         return updatedClearedSplits;
    //                     } else {
    //                         // Add new cleared split
    //                         return [...prevClearedSplits, clearedSplit];
    //                     }
    //                 });
    //             })
    //             .catch((error) => console.error("Error clearing split:", error));
    //     } else {
    //         alert("Enter a valid amount to clear!");
    //     }
        
    //     console.log("Cleared Splits: ",clearedSplits);
    // }
    const clearSplit = async (splitId, remainingAmount) => {
        const amountToClear = paymentAmounts[splitId] || 0;
    
        if (amountToClear > 0) {
            try {
                const response = await fetch(`http://localhost:5000/api/clearSplit/${splitId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: amountToClear, splits }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    alert(data.message);
    
                    // Update `splits`
                    setSplits(data.updatedSplits);
                    updateSummary(data.updatedSplits);
                    console.log("Cleared Split DATA:",data);
                    // Update `clearedSplits`
                    setClearedSplits((prevClearedSplits) => {
                        console.log("prevClearedSplits: ",prevClearedSplits);
                        const clearedSplit = data.clearedSplit;
                        console.log("clearedSplit: ",clearedSplit);
                        if (!clearedSplit || !clearedSplit.id) {
                            console.error("Invalid clearedSplit object:", clearedSplit);
                            return prevClearedSplits;
                        }
    
                        const existingIndex = prevClearedSplits.findIndex(
                            (split) => split.id === clearedSplit.id
                        );
    
                        if (existingIndex !== -1) {
                            const updatedClearedSplits = [...prevClearedSplits];
                            updatedClearedSplits[existingIndex] = clearedSplit;
                            return updatedClearedSplits;
                        } else {
                            return [...prevClearedSplits, clearedSplit];
                        }
                    });
                } else {
                    console.error("Error clearing split:", data.message);
                    alert(data.message || "Failed to clear split");
                }
            } catch (error) {
                console.error("Error clearing split:", error);
                alert("Failed to clear split");
            }
        } else {
            alert("Enter a valid amount to clear!");
        }
    };
    
    // const handleAddExpense = async (e) => {
    //     e.preventDefault();
    //     const totalShares = Object.values(participantShares)
    //         .map(Number)
    //         .reduce((sum, val) => sum + val, 0);

    //     if (totalShares !== Number(amount)) {
    //         setError('Total shares do not match the expense amount');
    //         return;
    //     }

    //     const expenseData = {
    //         description: expenseName,
    //         amount,
    //         payer_id: payerId,
    //         split_type: 'custom',
    //         participantShares,
    //         category,
    //     };

    //     try {
    //         const response = await fetch('http://localhost:5000/api/expenses', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(expenseData),
    //         });
    //         const data = await response.json();
    //         if (data.error) {
    //             setError(data.error);
    //         } else {
    //             setExpenses([...expenses, data.expense]);
    //             setExpenseName('');
    //             setAmount('');
    //             setPayerId('');
    //             setParticipantShares({});
    //             setCategory('General');
    //         }
    //     } catch (error) {
    //         setError('Error adding expense');
    //         console.error(error);
    //     }
    // };
    const updateSummary = (updatedSplits) => {
        const totalAmount = updatedSplits.reduce((acc, split) => acc + split.amount, 0);
        console.log("Total balance after update:", totalAmount);
        // You can store the total balance in state and update the summary UI accordingly
    };
    const handleAddExpense = async (e) => {
        e.preventDefault();
    
        // Validate the total shares match the expense amount
        const totalShares = Object.values(participantShares)
            .map((value) => Number(value))
            .reduce((sum, val) => sum + val, 0);
    
        if (totalShares !== Number(amount)) {
            setError('Total shares do not match the expense amount');
            return;
        }
    
        // Create splits array from participantShares
        console.log('Participants:', participants);
        const splits = Object.entries(participantShares)
            .filter(([_, share]) => share) // Only include non-zero shares
            .map(([participantId, share]) => {
                //console.log(`Participant ID: ${participantId}, Share: ${share}`);
                const participant = participants.find((p) => p.id === Number(participantId));
                return {
                    user_id: Number(participantId),
                    user_name: participant?.name || 'UnKnown',
                    contributed_amount: Number(share),
                };
            });
        console.log("Splits: ",splits);    
    
        const expenseData = {
            description: expenseName,
            amount: Number(amount),
            payer_id: payerId,
            split_type: 'custom',
            participantShares: splits,
            category,
        };
        
        console.log('Splits Array:', splits);

        console.log('Expense Data:', expenseData);


        try {
            // Submit to the API
            const response = await fetch('http://localhost:5000/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add expense');
            }
            await fetchSplits();

            const newExpense = { ...data.expense, splits };
            const updatedSplits = calculateSplits([...expenses, newExpense]);
            setSplits(updatedSplits);
            // Update state with the new expense
            setExpenses([...expenses, { ...data.expense, splits }]);
            setExpenseName('');
            setAmount('');
            setPayerId('');
            setParticipantShares({});
            setCategory('General');
            fetchSplits();
            setSplits()
            setError(''); // Clear any previous errors
        } catch (error) {
            setError(error.message || 'Error adding expense');
            console.error(error);
        }
    };
    
    
    const handleDeleteExpense = async (expenseId) => {
        try {
            // await fetch(`http://localhost:5000/api/expenses/${expenseId}`, { method: 'DELETE' });
            // setExpenses(expenses.filter(exp => exp.id !== expenseId));
            // await fetchSplits();
            // const updatedSplits = calculateSplits(expenses.filter(exp => exp.id !== expenseId));
            // console.log("Updated Splits",updatedSplits);
            // setSplits(updatedSplits);
            // Delete the expense from the server
            await fetch(`http://localhost:5000/api/expenses/${expenseId}`, { method: 'DELETE' });

            const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
            setExpenses(updatedExpenses); 
            console.log("Updated Expenses:", updatedExpenses);

                await fetchSplits();

                const updatedSplits = calculateSplits(updatedExpenses);
                setSplits(updatedSplits);

        } catch (error) {
            setError('Error deleting expense');
            console.error(error);
        }
    };
    
    const handleUpdateExpense = async (expenseId, updatedData) => {
        try {
            // Send PUT request to update the expense
            await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
    
            // After updating, fetch the updated list of all expenses
            const response = await fetch('http://localhost:5000/api/expenses');
            const updatedExpenses = await response.json();
    
            // Update the state with the new list of expenses
            setExpenses(updatedExpenses);
            console.log("Updated Expenses: ",updatedExpenses);
        } catch (error) {
            setError('Error updating expense');
            console.error(error);
        }
    };
    
    if (!splits || !Array.isArray(splits)) {
        return (
            (<>
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
            </Helmet>
        <div className="expenditure-split">
            <h2>Expense Split</h2>
            <form onSubmit={handleAddExpense}>
                <div>
                    <label>Expense Name</label>
                    <input
                        type="text"
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Payer</label>
                    <select
                        value={payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                        required
                    >
                        <option value="">Select Payer</option>
                        {participants && participants.length > 0 && participants.map((participant) => (
                            <option key={participant.id} value={participant.id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    {participants && participants.length > 0 && participants.map((participant) => (
                        <div key={participant.id}>
                            <label>{participant.name}</label>
                            <input
                                type="number"
                                value={participantShares[participant.id] || ''}
                                onChange={(e) =>
                                    handleShareChange(participant.id, e.target.value)
                                }
                                placeholder="Enter share"
                                required
                            />
                        </div>
                    ))}
                </div>
                <button type="submit">Add Expense</button>
            </form>

            {error && <div className="error">{error}</div>}
            <div className="split-payments">
                <h3>Pending Splits: </h3>
                <p>All payments are settled!</p>
            </div>
            <div className="recorded-payments">
                <h3>Payment Summary: </h3>
                {clearedSplits.length > 0 ? (
                    clearedSplits.map((clearedSplit) => (
                        <div key={clearedSplit} className="split-item">
                            <p>
                                {clearedSplit.debtor} Paid ${parseFloat(clearedSplit.amount).toFixed(2)} to {clearedSplit.creditor} !!
                            </p>
                        </div>
                    ))
                ) : (
                    <p>No Payments are recorded Yet!</p>
                )}
            </div>

            

            <h3>Expenses</h3>
            {loading ? (
                <p>Loading expenses...</p>
            ) : (
                // <ul>
                //     {expenses.map((expense) => (
                //         <li key={expense.id}>
                //             <p><span>{expense.description}</span></p>
                //             <p><span>Expense Amount: {expense.amount}</span></p>
                //             {expense.splits.map((split, index) => (
                //                 <p key={index}><span>{split.user_name} - {split.contributed_amount}</span></p>
                //             ))}
                            
                //             <button onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
                //             <button
                //                 onClick={() =>
                //                     handleUpdateExpense(expense.id, {
                //                         description: 'Updated Expense',
                //                         amount: 100,
                //                         payer_id: expense.payer_id,
                //                         split_type: 'custom',
                //                         participantShares: expense.splits,
                //                         category: expense.category,
                //                     })
                //                 }
                //             >
                //                 Update
                //             </button>
                //         </li>
                //     ))}
                // </ul>
                <ul className="expense-list">
                    {expenses.map((expense) => (
                        <li key={expense.id} className="expense-card">
                            <div className="expense-header">
                                <h3>{expense.description} - Paid by {expense.payer_name}</h3>
                                <p className="expense-amount">${expense.amount}</p>
                            </div>
                            <p className="expense-category">{expense.category}</p>
                            <table className="splits-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expense.splits.map((split, index) => (
                                        <tr key={index}>
                                            <td>{split.user_name}</td>
                                            <td>${split.contributed_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="expense-actions">
                                <button className="delete-btn" onClick={() => handleDeleteExpense(expense.id)}>
                                    🗑 Delete
                                </button>
                                <button
                                    className="update-btn"
                                    onClick={() =>
                                        handleUpdateExpense(expense.id, {
                                            description: 'Updated Expense',
                                            amount: 100,
                                            payer_id: expense.payer_id,
                                            split_type: 'custom',
                                            participantShares: expense.splits,
                                            category: expense.category,
                                        })
                                    }
                                >
                                    ✏️ Update
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </>));
    }
    return (
        // <div className="expenditure-split">
        //     <h2>Expense Split</h2>
        //     <form onSubmit={handleAddExpense}>
        //         <div>
        //             <label>Expense Name</label>
        //             <input
        //                 type="text"
        //                 value={expenseName}
        //                 onChange={(e) => setExpenseName(e.target.value)}
        //                 required
        //             />
        //         </div>
        //         <div>
        //             <label>Amount</label>
        //             <input
        //                 type="number"
        //                 value={amount}
        //                 onChange={(e) => setAmount(e.target.value)}
        //                 required
        //             />
        //         </div>
        //         <div>
        //             <label>Payer</label>
        //             <select
        //                 value={payerId}
        //                 onChange={(e) => setPayerId(e.target.value)}
        //                 required
        //             >
        //                 <option value="">Select Payer</option>
        //                 {participants && participants.length > 0 && participants.map((participant) => (
        //                     <option key={participant.id} value={participant.id}>
        //                         {participant.name}
        //                     </option>
        //                 ))}
        //             </select>
        //         </div>
        //         <div>
        //             <label>Category</label>
        //             <select
        //                 value={category}
        //                 onChange={(e) => setCategory(e.target.value)}
        //                 required
        //             >
        //                 {categories.map((cat) => (
        //                     <option key={cat} value={cat}>
        //                         {cat}
        //                     </option>
        //                 ))}
        //             </select>
        //         </div>
        //         <div>
        //             {participants && participants.length > 0 && participants.map((participant) => (
        //                 <div key={participant.id}>
        //                     <label>{participant.name}</label>
        //                     <input
        //                         type="number"
        //                         value={participantShares[participant.id] || ''}
        //                         onChange={(e) =>
        //                             handleShareChange(participant.id, e.target.value)
        //                         }
        //                         placeholder="Enter share"
        //                         required
        //                     />
        //                 </div>
        //             ))}
        //         </div>
        //         <button type="submit">Add Expense</button>
        //     </form>

        //     {error && <div className="error">{error}</div>}
        //     <div className="split-payments">
        //         <h3>Pending Splits: </h3>
        //         {splits.length > 0 ? (
        //             splits.map((split) => (
        //                 // <div key={split.id} className="split-item">
        //                 //     <p>
        //                 //         {split.debtor} owes ${split.amount.toFixed(2)} to {split.creditor}
        //                 //     </p>
        //                 //     <input
        //                 //         type="number"
        //                 //         placeholder="Enter amount"
        //                 //         value={paymentAmounts[split.id] || 0}
        //                 //         onChange={(e) => handleInputChange(split.id, parseFloat(e.target.value)||0)}
        //                 //     />
        //                 //     <button onClick={() => clearSplit(split.id, paymentAmounts[split.id]||0)}>
        //                 //         Clear Split
        //                 //     </button>
        //                 // </div>
        //                 <div key={split.id} className="split-item">
        //                     <p className="split-info">
        //                         {split.debtor} owes <span>${split.amount.toFixed(2)}</span> to {split.creditor}
        //                     </p>
        //                     <div className="action-row">
        //                         <input
        //                             type="number"
        //                             placeholder="Enter amount"
        //                             value={paymentAmounts[split.id] || 0}
        //                             onChange={(e) => handleInputChange(split.id, parseFloat(e.target.value) || 0)}
        //                         />
        //                         <button onClick={() => clearSplit(split.id, paymentAmounts[split.id] || 0)}>
        //                             Clear Split
        //                         </button>
        //                     </div>
        //                 </div>
        //             ))
        //         ) : (
        //             <p>All payments are settled!</p>
        //         )}
        //     </div>
        //     <div className="recorded-payments">
        //         <h3>Payment Summary: </h3>
        //         {clearedSplits.length > 0 ? (
        //             clearedSplits.map((clearedSplit) => (
        //                 <div key={clearedSplit} className="split-item">
        //                     <p>
        //                         {clearedSplit.debtor} Paid ${parseFloat(clearedSplit.amount).toFixed(2)} to {clearedSplit.creditor} !!
        //                     </p>
        //                 </div>
        //             ))
        //         ) : (
        //             <p>No Payments are recorded Yet!</p>
        //         )}
        //     </div>

        //     <h3>Expenses</h3>
        //     {loading ? (
        //         <p>Loading expenses...</p>
        //     ) : (
        //         // <ul>
        //         //     {expenses.map((expense) => (
        //         //         <li key={expense.id}>
        //         //             <p><span>{expense.description}</span></p>
        //         //             <p><span>Expense Amount: {expense.amount}</span></p>
        //         //             {expense.splits.map((split, index) => (
        //         //                 <p key={index}><span>{split.user_name} - {split.contributed_amount}</span></p>
        //         //             ))}
                            
        //         //             <button onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
        //         //             <button
        //         //                 onClick={() =>
        //         //                     handleUpdateExpense(expense.id, {
        //         //                         description: 'Updated Expense',
        //         //                         amount: 100,
        //         //                         payer_id: expense.payer_id,
        //         //                         split_type: 'custom',
        //         //                         participantShares: expense.splits,
        //         //                         category: expense.category,
        //         //                     })
        //         //                 }
        //         //             >
        //         //                 Update
        //         //             </button>
        //         //         </li>
        //         //     ))}
        //         // </ul>
        //         <ul className="expense-list">
        //             {expenses.reverse().map((expense) => (
        //                 <li key={expense.id} className="expense-card">
        //                     <div className="expense-header">
        //                         <h3>{expense.description} - Paid by {expense.payer_name}</h3>
        //                         <p className="expense-amount">${expense.amount}</p>
        //                     </div>
        //                     <p className="expense-category">{expense.category}</p>
        //                     <table className="splits-table">
        //                         <thead>
        //                             <tr>
        //                                 <th>User</th>
        //                                 <th>Amount</th>
        //                             </tr>
        //                         </thead>
        //                         <tbody>
        //                             {expense.splits.map((split, index) => (
        //                                 <tr key={index}>
        //                                     <td>{split.user_name}</td>
        //                                     <td>${split.contributed_amount}</td>
        //                                 </tr>
        //                             ))}
        //                         </tbody>
        //                     </table>
        //                     <div className="expense-actions">
        //                         <button className="delete-btn" onClick={() => handleDeleteExpense(expense.id)}>
        //                             🗑 Delete
        //                         </button>
        //                         <button
        //                             className="update-btn"
        //                             onClick={() =>
        //                                 handleUpdateExpense(expense.id, {
        //                                     description: 'Updated Expense',
        //                                     amount: 100,
        //                                     payer_id: expense.payer_id,
        //                                     split_type: 'custom',
        //                                     participantShares: expense.splits,
        //                                     category: expense.category,
        //                                 })
        //                             }
        //                         >
        //                             ✏️ Update
        //                         </button>
        //                     </div>
        //                 </li>
        //             ))}
        //         </ul>
        //     )}
        // </div>
        // -------------------------
        //--------------------------
        (<>
            <Helmet>
                <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
            </Helmet>
        <div className="expenditure-split">
            <h2>Expense Split</h2>
            <form onSubmit={handleAddExpense}>
            <div>
                     <label>Expense Name</label>
                     <input
                        type="text"
                        value={expenseName}
                        onChange={(e) => setExpenseName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Payer</label>
                    <select
                        value={payerId}
                        onChange={(e) => setPayerId(e.target.value)}
                        required
                    >
                        <option value="">Select Payer</option>
                        {participants && participants.length > 0 && participants.map((participant) => (
                            <option key={participant.id} value={participant.id}>
                                {participant.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    {participants && participants.length > 0 && participants.map((participant) => (
                        <div key={participant.id}>
                            <label>{participant.name}</label>
                            <input
                                type="number"
                                value={participantShares[participant.id] || ''}
                                onChange={(e) =>
                                    handleShareChange(participant.id, e.target.value)
                                }
                                placeholder="Enter share"
                                required
                            />
                        </div>
                    ))}
                </div>
                <button type="submit">Add Expense</button>
            </form>
            {error && <div className="error">{error}</div>}

            {/* Toggle Buttons */}
            <div className="toggle-buttons">
                <button onClick={() => setShowPendingSplits(!showPendingSplits)}>
                    {showPendingSplits ? 'Hide Pending Splits' : 'Show Pending Splits'}
                </button>
                <button onClick={() => setShowClearedSplits(!showClearedSplits)}>
                    {showClearedSplits ? 'Hide Cleared Splits' : 'Show Cleared Splits'}
                </button>
                <button onClick={() => setShowExpenses(!showExpenses)}>
                    {showExpenses ? 'Hide Expenses' : 'Show Expenses'}
                </button>
            </div>

            {/* Pending Splits Section */}
            {showPendingSplits && (
                <div className="split-payments">
                    
                    {splits.length > 0 ? (
                        splits.map((split) => (
                            <div key={split.id} className="split-item">
                                <p className="split-info">
                                    {split.debtor} owes <span>${split.amount.toFixed(2)}</span> to {split.creditor}
                                </p>
                                <div className="action-row">
                                    <input
                                        type="number"
                                        placeholder="Enter amount"
                                        value={paymentAmounts[split.id] || 0}
                                        onChange={(e) => handleInputChange(split.id, parseFloat(e.target.value) || 0)}
                                    />
                                    <button onClick={() => clearSplit(split.id, paymentAmounts[split.id] || 0)}>
                                        Clear Split
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>All payments are settled!</p>
                    )}
                </div>
            )}

            {/* Cleared Splits Section */}
            {showClearedSplits && (
                <div>
                    <h3>Payment Summary: </h3>
                <div className="recorded-payments">
                    
                    {clearedSplits.length > 0 ? (
                        clearedSplits.map((clearedSplit) => (
                            <div key={clearedSplit} className="split-item">
                                <p>
                                    {clearedSplit.debtor} Paid ${parseFloat(clearedSplit.amount).toFixed(2)} to {clearedSplit.creditor} !!
                                </p>
                            </div>
                        ))
                    ) : (
                        <p>No Payments are recorded Yet!</p>
                    )}
                </div>
                </div>
            )}

            {/* Expenses Section */}
            {showExpenses && (
                <div>
                    <h3>Expenses</h3>
                    {loading ? (
                        <p>Loading expenses...</p>
                    ) : (
                        <ul className="expense-list">
                            {expenses.reverse().map((expense) => (
                                <li key={expense.id} className="expense-card">
                                    <div className="expense-header">
                                        <h3>{expense.description} - Paid by {expense.payer_name}</h3>
                                        <p className="expense-amount">${expense.amount}</p>
                                    </div>
                                    <p className="expense-category">{expense.category}</p>
                                    <table className="splits-table">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expense.splits.map((split, index) => (
                                                <tr key={index}>
                                                    <td>{split.user_name}</td>
                                                    <td>${split.contributed_amount}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="expense-actions">
                                        <button className="delete-btn" onClick={() => handleDeleteExpense(expense.id)}>
                                            🗑 Delete
                                        </button>
                                        <button
                                            className="update-btn"
                                            onClick={() =>
                                                handleUpdateExpense(expense.id, {
                                                    description: 'Updated Expense',
                                                    amount: 100,
                                                    payer_id: expense.payer_id,
                                                    split_type: 'custom',
                                                    participantShares: expense.splits,
                                                    category: expense.category,
                                                })
                                            }
                                        >
                                            ✏️ Update
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
        </>)
//         <div className="container">
//     {/* Left Column: Expense Form */}
//     <div className="left-column">
//         <h2>Expense Split</h2>
//         <form onSubmit={handleAddExpense}>
//             <div>
//                 <label>Expense Name</label>
//                 <input
//                     type="text"
//                     value={expenseName}
//                     onChange={(e) => setExpenseName(e.target.value)}
//                     required
//                 />
//             </div>
//             <div>
//                 <label>Amount</label>
//                 <input
//                     type="number"
//                     value={amount}
//                     onChange={(e) => setAmount(e.target.value)}
//                     required
//                 />
//             </div>
//             <div>
//                 <label>Payer</label>
//                 <select
//                     value={payerId}
//                     onChange={(e) => setPayerId(e.target.value)}
//                     required
//                 >
//                     <option value="">Select Payer</option>
//                     {participants && participants.length > 0 && participants.map((participant) => (
//                         <option key={participant.id} value={participant.id}>
//                             {participant.name}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//             <div>
//                 <label>Category</label>
//                 <select
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     required
//                 >
//                     {categories.map((cat) => (
//                         <option key={cat} value={cat}>
//                             {cat}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//             <div>
//                 {participants && participants.length > 0 && participants.map((participant) => (
//                     <div key={participant.id}>
//                         <label>{participant.name}</label>
//                         <input
//                             type="number"
//                             value={participantShares[participant.id] || ''}
//                             onChange={(e) =>
//                                 handleShareChange(participant.id, e.target.value)
//                             }
//                             placeholder="Enter share"
//                             required
//                         />
//                     </div>
//                 ))}
//             </div>
//             <button type="submit">Add Expense</button>
//         </form>
//     </div>

//     {/* Right Column: Expenses, Pending Splits, and Cleared Splits */}
//     <div className="right-column">
//         <h3>Expense Summary</h3>

//         {/* Expenses Section */}
//         <div className="section expense-section">
//             <h4>Expenses</h4>
//             <div className="scrollable-section">
//                 {loading ? (
//                     <p>Loading expenses...</p>
//                 ) : (
//                     <ul className="expense-list">
//                         {expenses.reverse().map((expense) => (
//                             <li key={expense.id} className="expense-card">
//                                 <div className="expense-header">
//                                     <h3>{expense.description} - Paid by {expense.payer_name}</h3>
//                                     <p className="expense-amount">${expense.amount}</p>
//                                 </div>
//                                 <p className="expense-category">{expense.category}</p>
//                                 <table className="splits-table">
//                                     <thead>
//                                         <tr>
//                                             <th>User</th>
//                                             <th>Amount</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {expense.splits.map((split, index) => (
//                                             <tr key={index}>
//                                                 <td>{split.user_name}</td>
//                                                 <td>${split.contributed_amount}</td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                                 <div className="expense-actions">
//                                     <button className="delete-btn" onClick={() => handleDeleteExpense(expense.id)}>
//                                         🗑 Delete
//                                     </button>
//                                     <button
//                                         className="update-btn"
//                                         onClick={() =>
//                                             handleUpdateExpense(expense.id, {
//                                                 description: 'Updated Expense',
//                                                 amount: 100,
//                                                 payer_id: expense.payer_id,
//                                                 split_type: 'custom',
//                                                 participantShares: expense.splits,
//                                                 category: expense.category,
//                                             })
//                                         }
//                                     >
//                                         ✏️ Update
//                                     </button>
//                                 </div>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>
//         </div>

//         {/* Pending Splits Section */}
//         <div className="section pending-splits-section">
//             <h4>Pending Splits</h4>
//             <div className="scrollable-section">
//                 {splits.length > 0 ? (
//                     splits.map((split) => (
//                         <div key={split.id} className="split-item">
//                             <p className="split-info">
//                                 {split.debtor} owes <span>${split.amount.toFixed(2)}</span> to {split.creditor}
//                             </p>
//                             <div className="action-row">
//                                 <input
//                                     type="number"
//                                     placeholder="Enter amount"
//                                     value={paymentAmounts[split.id] || 0}
//                                     onChange={(e) => handleInputChange(split.id, parseFloat(e.target.value) || 0)}
//                                 />
//                                 <button onClick={() => clearSplit(split.id, paymentAmounts[split.id] || 0)}>
//                                     Clear Split
//                                 </button>
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p>All payments are settled!</p>
//                 )}
//             </div>
//         </div>

//         {/* Cleared Splits Section */}
//         <div className="section cleared-splits-section">
//             <h4>Cleared Splits</h4>
//             <div className="scrollable-section">
//                 {clearedSplits.length > 0 ? (
//                     clearedSplits.map((clearedSplit) => (
//                         <div key={clearedSplit.id} className="split-item">
//                             <p>
//                                 {clearedSplit.debtor} Paid ${parseFloat(clearedSplit.amount).toFixed(2)} to {clearedSplit.creditor} on: 
//                                 <span className="date">{new Date(clearedSplit.cleared_at).toLocaleString('en-US', { 
//                                     weekday: 'long', // "Monday"
//                                     year: 'numeric', // "2024"
//                                     month: 'long', // "December"
//                                     day: 'numeric', // "1"
//                                     hour: '2-digit', // "01"
//                                     minute: '2-digit', // "28"
//                                     second: '2-digit', // "31"
//                                     hour12: true // "AM/PM"
//                                 })}</span>
//                             </p>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No Payments are recorded Yet!</p>
//                 )}
//             </div>
//         </div>
//     </div>
// </div>

    );
};

export default ExpenditureSplit;
