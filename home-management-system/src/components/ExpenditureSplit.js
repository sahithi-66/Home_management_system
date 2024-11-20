import React, { useState } from 'react';
import './ExpenditureSplit.css';

const ExpenditureSplit = () => {
    const fixedParticipants = ['John', 'Jane', 'Alex', 'Emily'];
    const [expenseName, setExpenseName] = useState('');
    const [amount, setAmount] = useState('');
    const [participantShares, setParticipantShares] = useState(
        fixedParticipants.reduce((acc, participant) => {
            acc[participant] = ''; // Initialize with empty values
            return acc;
        }, {})
    );
    const [expenses, setExpenses] = useState([]);

    // Handle change in individual participant share
    const handleShareChange = (participant, value) => {
        setParticipantShares({
            ...participantShares,
            [participant]: value,
        });
    };

    // Handle form submission
    const handleAddExpense = (e) => {
        e.preventDefault();
        const totalShares = Object.values(participantShares)
            .map(Number)
            .reduce((sum, val) => sum + val, 0);

        if (totalShares !== Number(amount)) {
            alert('The total shares do not match the total amount!');
            return;
        }

        const newExpense = {
            expenseName,
            amount,
            participantShares: { ...participantShares },
        };

        setExpenses([...expenses, newExpense]);
        setExpenseName('');
        setAmount('');
        setParticipantShares(
            fixedParticipants.reduce((acc, participant) => {
                acc[participant] = '';
                return acc;
            }, {})
        );
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
                    <label>Total Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="input-field">
                    <label>Distribute Amount Among Participants</label>
                    <div className="participant-shares">
                        {fixedParticipants.map((participant) => (
                            <div key={participant} className="participant-share">
                                <label>{participant}</label>
                                <input
                                    type="number"
                                    value={participantShares[participant]}
                                    onChange={(e) =>
                                        handleShareChange(participant, e.target.value)
                                    }
                                    required
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit">Add Expense</button>
            </form>

            <div className="expense-list">
                <h3>Expense List</h3>
                {expenses.length > 0 ? (
                    <ul>
                        {expenses.map((expense, index) => (
                            <li key={index}>
                                <strong>{expense.expenseName}</strong>: ${expense.amount}
                                <ul>
                                    {Object.entries(expense.participantShares).map(
                                        ([participant, share]) => (
                                            <li key={participant}>
                                                {participant}: ${share}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No expenses added yet.</p>
                )}
            </div>
        </div>
    );
};

export default ExpenditureSplit;
