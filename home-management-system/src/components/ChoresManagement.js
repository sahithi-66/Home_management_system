import React, { useState } from 'react';
import './ChoresManagement.css';

const ChoresManagement = () => {
    const [choreName, setChoreName] = useState('');
    const [assignee, setAssignee] = useState('');
    const [frequency, setFrequency] = useState('Daily');
    const [chores, setChores] = useState([]);

    const handleAddChore = (e) => {
        e.preventDefault();
        const newChore = { choreName, assignee, frequency };
        setChores([...chores, newChore]);
        setChoreName('');
        setAssignee('');
        setFrequency('Daily');
    };

    return (
        <div className="chores-wrapper">
            <div className="chores-container">
                <h2>Chores Management</h2>
                <form onSubmit={handleAddChore}>
                    <div className="input-field">
                        <label>Chore Name</label>
                        <input 
                            type="text" 
                            value={choreName} 
                            onChange={(e) => setChoreName(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label>Assignee</label>
                        <input 
                            type="text" 
                            value={assignee} 
                            onChange={(e) => setAssignee(e.target.value)} 
                            required 
                            placeholder="e.g., John, Alex"
                        />
                    </div>
                    <div className="input-field">
                        <label>Frequency</label>
                        <select 
                            value={frequency} 
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                    <button type="submit">Add Chore</button>
                </form>

                <div className="chore-list">
                    <h3>Chore List</h3>
                    <ul>
                        {chores.map((chore, index) => (
                            <li key={index}>
                                <strong>{chore.choreName}</strong> - {chore.assignee} ({chore.frequency})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChoresManagement;
