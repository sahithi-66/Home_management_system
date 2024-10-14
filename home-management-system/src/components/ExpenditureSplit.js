import React, { useState } from 'react';
import './ExpenditureSplit.css';

const ExpenditureSplit = () => {
    const [expenseName, setExpenseName] = useState('');
    const [amount, setAmount] = useState('');
    const [participants, setParticipants] = useState([]);
    const [expenses, setExpenses] = useState([]);

    const handleAddExpense = (e) => {
        e.preventDefault();
        const newExpense = { expenseName, amount, participants };
        setExpenses([...expenses, newExpense]);
        setExpenseName('');
        setAmount('');
        setParticipants([]);
    };

    return (
        <div className="expenditure-container">
            <h2>Expenditure Split</h2>
            <form onSubmit={handleAddExpense}>
                <div className="input-field">
                    <label>Expense Name</label>
                    <input 
                        type="text" 
                        value={expenseName} 
                        onChange={(e) => setExpenseName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="input-field">
                    <label>Amount</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        required 
                    />
                </div>
                <div className="input-field">
                    <label>Participants (comma-separated)</label>
                    <input 
                        type="text" 
                        value={participants} 
                        onChange={(e) => setParticipants(e.target.value.split(','))} 
                        placeholder="e.g., John, Jane, Alex" 
                        required 
                    />
                </div>
                <button type="submit">Add Expense</button>
            </form>

            <div className="expense-list">
                <h3>Expense List</h3>
                <ul>
                    {expenses.map((expense, index) => (
                        <li key={index}>
                            {expense.expenseName}: ${expense.amount} - Shared by: {expense.participants.join(', ')}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExpenditureSplit;
