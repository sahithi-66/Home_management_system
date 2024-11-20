import React, { useState } from 'react';
import './ChoresManagement.css';

const ChoresManagement = () => {
    const roommates = ['John', 'Alex', 'Emily', 'Sarah']; // Predefined list of roommates
    const [choreName, setChoreName] = useState('');
    const [assignees, setAssignees] = useState([]); // State for multiple assignees
    const [frequency, setFrequency] = useState('Daily');
    const [chores, setChores] = useState([]);

    const handleAddChore = (e) => {
        e.preventDefault();
        const newChore = { choreName, assignees, frequency };
        setChores([...chores, newChore]);
        setChoreName('');
        setAssignees([]); // Reset assignees
        setFrequency('Daily');
    };

    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setAssignees((prevAssignees) =>
            checked ? [...prevAssignees, value] : prevAssignees.filter((assignee) => assignee !== value)
        );
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
                        <label>Assignees</label>
                        <div className="checkbox-group">
                            {roommates.map((roommate, index) => (
                                <label key={index} className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        value={roommate} 
                                        checked={assignees.includes(roommate)}
                                        onChange={handleCheckboxChange} 
                                    />
                                    {roommate}
                                </label>
                            ))}
                        </div>
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
                                <strong>{chore.choreName}</strong> - {chore.assignees.join(', ')} ({chore.frequency})
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ChoresManagement;
