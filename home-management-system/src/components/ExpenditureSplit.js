import React, { useState, useEffect } from 'react';
import './ExpenditureSplit.css';

const ExpenditureSplit = () => {
    const [participants, setParticipants] = useState([]);
    const [expenseName, setExpenseName] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState('');
    const [category, setCategory] = useState('General');
    const [participantShares, setParticipantShares] = useState({});
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState(['General', 'Food', 'Utility', 'Miscellaneous']);  // Add categories here

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/users');
                const data = await response.json();
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

        fetchParticipants();
        fetchExpenses();
    }, []);

    const handleShareChange = (participant, value) => {
        setParticipantShares({
            ...participantShares,
            [participant]: value,
        });
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
                const participant = participants.find((p) => p.id === participantId);
                return {
                    user_id: participantId,
                    user_name: participant?.name || 'UnKnown',
                    contributed_amount: Number(share),
                };
            });
            
    
        const expenseData = {
            description: expenseName,
            amount: Number(amount),
            payer_id: payerId,
            split_type: 'custom',
            splits,
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
    
            // Update state with the new expense
            setExpenses([...expenses, { ...data.expense, splits }]);
            setExpenseName('');
            setAmount('');
            setPayerId('');
            setParticipantShares({});
            setCategory('General');
            setError(''); // Clear any previous errors
        } catch (error) {
            setError(error.message || 'Error adding expense');
            console.error(error);
        }
    };
    
    
    const handleDeleteExpense = async (expenseId) => {
        try {
            await fetch(`http://localhost:5000/api/expenses/${expenseId}`, { method: 'DELETE' });
            setExpenses(expenses.filter(exp => exp.id !== expenseId));
        } catch (error) {
            setError('Error deleting expense');
            console.error(error);
        }
    };

    const handleUpdateExpense = async (expenseId, updatedData) => {
        try {
            await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            setExpenses(expenses.map(exp => exp.id === expenseId ? { ...exp, ...updatedData } : exp));
        } catch (error) {
            setError('Error updating expense');
            console.error(error);
        }
    };

    return (
        <div className="root-wrapper">
        <div class="title-box">
            <h2>Expense Split</h2>
        </div>
        <div className="expense-wrapper">
            <div className="expense-container">
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
                                <h3>{expense.description}</h3>
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
        </div>
        </div>
    );
};

export default ExpenditureSplit;
