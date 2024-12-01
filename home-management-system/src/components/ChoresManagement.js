import React, { useState } from 'react';
import './ChoresManagement.css';

const ChoresManagement = () => {
    const roommates = ['John', 'Alex', 'Emily', 'Sarah']; // Predefined list of roommates
    const [choreName, setChoreName] = useState('');
    const [assignees, setAssignees] = useState([]); // State for multiple assignees
    const [frequency, setFrequency] = useState('Daily');
    const [chores, setChores] = useState([]);
    const [selectedChoreId, setSelectedChoreId] = useState('');
    const [choreSchedule, setChoreSchedule] = useState([]);
    const [showChores, setShowChores] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false); // Tracks button click state


    // Handles adding a new chore
    const handleAddChore = (e) => {
        e.preventDefault();
        const newChore = { choreName, assignees, frequency };
        setChores([...chores, newChore]);
        setChoreName('');
        setAssignees([]);
        setFrequency('Daily');
    };

    // Handles the checkbox selection for assignees
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        setAssignees((prevAssignees) =>
            checked ? [...prevAssignees, value] : prevAssignees.filter((assignee) => assignee !== value)
        );
    };

    // Simulate fetching all chores
    const fetchAllChores = () => {
        console.log(chores); // Log the chores array for debugging
        setShowChores((prev) => !prev); // Toggle chore visibility
        setButtonClicked((prev) => !prev); // Toggle button state
    };

    // Simulate fetching a chore's schedule
    const fetchChoreSchedule = () => {
        if (!selectedChoreId) {
            alert('Please enter a chore ID.');
            return;
        }

        const schedule = chores
            .filter((chore) => chore.choreName === selectedChoreId)
            .map((chore) => ({
                date: '2024-11-27',
                assignee: chore.assignees.join(', ') || 'N/A',
            }));

        if (schedule.length === 0) {
            alert('Chore not found!');
        } else {
            setChoreSchedule(schedule);
        }
    };

    return (
        <div className="root-wrapper">
            <div class="title-box">
                <h2>Roommate Chores Management</h2>
            </div>
            <div className="chores-wrapper">
            <div className="chores-container">
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
            </div>

            <div className="chores-container">
                <div className="actions">
                <button
                    onClick={fetchAllChores}
                    className={buttonClicked ? "clicked-button" : "default-button"}
                >Get Chores
                </button>
                </div>

                {showChores && (
                <div className="chore-list">
                    <h3>Chore List</h3>
                    <ul>
                        {chores.map((chore, index) => (
                            <li key={index}>
                                <h4>{chore.choreName || `Chore ID: ${index + 1}`}</h4>
                                <p>
                                    <strong>Assigned to:</strong> {chore.assignees?.join(", ") || "N/A"} <br />
                                    <strong>Frequency:</strong> {chore.frequency || "N/A"}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            </div>
            <div className="chores-container">
                <div className="chore-schedule">
                    <h3>Get Chore Schedule</h3>
                    <div className="input-field">
                        <label>Enter Chore Name</label>
                        <input
                            type="text"
                            value={selectedChoreId}
                            onChange={(e) => setSelectedChoreId(e.target.value)}
                        />
                    </div>
                    <button onClick={fetchChoreSchedule}>Get Schedule</button>

                    <div className="schedule-list">
                        <h4>Schedule:</h4>
                        <ul>
                            {choreSchedule.map((entry, index) => (
                                <li key={index}>
                                    <p>
                                        <strong>Date:</strong> {entry.date} <br />
                                        <strong>Assigned to:</strong> {entry.assignee}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default ChoresManagement;
