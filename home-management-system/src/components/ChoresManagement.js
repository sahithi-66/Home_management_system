import React, { useState, useEffect } from 'react';
import './ChoresManagement.css';

function Toast({ message, type, onClose }) {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3000); // Auto-close after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`toast ${type}`}>
            {message}
        </div>
    );
}

const ChoresManagement = () => {
    const [roommates, setRoommates] = useState([]); // Dynamic roommates list with id and name
    const [choreName, setChoreName] = useState('');
    const [assignees, setAssignees] = useState([]); // Store ids of assignees
    const [frequency, setFrequency] = useState('Daily');
    const [chores, setChores] = useState([]);
    const [selectedChoreId, setSelectedChoreId] = useState('');
    const [choreSchedule, setChoreSchedule] = useState([]);
    const [showChores, setShowChores] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false); // Tracks button click state
    const [statusMessage, setStatusMessage] = useState("");
    const [selectedFirstSchedule, setSelectedFirstSchedule] = useState(null); // for first schedule
    const [selectedSecondSchedule, setSelectedSecondSchedule] = useState(null);

    const [toasts, setToasts] = useState([]);

    const showToast = (message, type) => {
        setToasts((prevToasts) => [...prevToasts, { message, type }]);
    };

    const removeToast = (index) => {
        setToasts((prevToasts) => prevToasts.filter((_, i) => i !== index));
    };

    // Fetch roommates from the backend API
    useEffect(() => {
        const fetchRoommates = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch roommates');
                }
                const data = await response.json();
                setRoommates(data); // Assumes the API returns an array of roommates { id, name }
            } catch (error) {
                console.error('Error fetching roommates:', error);
            }
        };

        fetchRoommates();
    }, []);

    // Handles adding a new chore
    const handleAddChore = async (e) => {
        e.preventDefault();
    
        const newChore = { choreName, assignees, frequency };
        
    
        try {
            // Make the API call to save the chore in the backend
            const response = await fetch('http://localhost:5001/api/chores/addChore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newChore),
            });

            const savedChore = await response.json();
    
            if (!response.ok) {
                showToast(savedChore.message || "An error occurred!", "error");
                return;
            }
    
            
            setChoreName('');
            setAssignees([]);
            setFrequency('Daily');
            showToast("Chore added successfully!", "success");
        } catch (error) {
            showToast("An unexpected error occurred!", "error");
        }
    };

    // Handles the checkbox selection for assignees (stores their ids)
    const handleCheckboxChange = (e) => {
        const { value, checked } = e.target;
        const id = Number(value); // Ensure the value is a number
        setAssignees((prevAssignees) =>
            checked ? [...prevAssignees, id] : prevAssignees.filter((assignee) => assignee !== id)
        );
    };

    // Simulate fetching all chores
    const fetchAllChores = async () => {
        const response = await fetch('http://localhost:5001/api/chores/fetchAll', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log("reached here");
        if (!response.ok) {
            throw new Error('Failed to fetch chores');
        }
        
        const data = await response.json();

        if (Array.isArray(data)) {
            const parsedData = data.map(chore => ({
                ...chore,
                roommates: typeof chore.roommates === 'string' 
                    ? JSON.parse(chore.roommates) 
                    : chore.roommates,
            }));
            setChores(parsedData);
        } else {
            console.error('Invalid response format: Expected an array');
            setChores([]); // Fallback to an empty array
        }
        setShowChores((prev) => !prev); // Toggle chore visibility
        setButtonClicked((prev) => !prev); // Toggle button state
    };

    const handleDeleteChore = async (choreId, choreName) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the chore "${choreName}"?`
        );
    
        if (!confirmDelete) return;
    
        try {
            const response = await fetch(`http://localhost:5001/api/chores/deleteChore/${choreId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete chore');
            }
    
            showToast(`Chore "${choreName}" deleted successfully!`, "success");
    
            // Remove the deleted chore from the UI
            setChores((prevChores) => prevChores.filter((chore) => chore.id !== choreId));
        } catch (error) {
            console.error('Error deleting chore:', error);
            showToast('An error occurred while deleting the chore.', "error");
        }
    };

    const handleSwapSchedules = async () => {
        if (!selectedFirstSchedule || !selectedSecondSchedule) {
            showToast("Please select two schedules to swap.", "error");
            return;
        }
        console.log(selectedFirstSchedule.id);
        console.log(selectedSecondSchedule.id);

        const response = await fetch('http://localhost:5001/api/chores/swapSchedules', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstScheduleId: selectedFirstSchedule.id,
                secondScheduleId: selectedSecondSchedule.id,
            }),
        });

        if (!response.ok) {
            showToast("Failed to swap schedules.", "error");
        } else {
            showToast("Schedules swapped successfully!", "success");
            fetchChoreSchedule(); // Refresh the schedule after swap
        }
    };

    // Simulate fetching a chore's schedule
    const fetchChoreSchedule = async () => {
        if (!selectedChoreId) {
            alert('Please enter a chore name.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/chores/schedule/${selectedChoreId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch chore schedule');
            }
            
            //(roommates);
            const schedule = await response.json();
    
            if (Array.isArray(schedule) && schedule.length > 0) {
                setChoreSchedule(schedule); // Schedule should contain 10 rows
            } else {
                setChoreSchedule([]);
                alert('No schedule found for the given chore name.');
            }
        } catch (error) {
            console.error('Error fetching chore schedule:', error);
            alert('Error fetching chore schedule.');
        }
    };

    return (
        <div className="chores-wrapper">
            <div className="chores-container">
                <h2>Roommate Chores Management</h2>
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
                            {roommates.length > 0 ? (
                                roommates.map((roommate) => (
                                    <label key={roommate.id} className="checkbox-label" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <span style={{width:'50%'}}> {roommate.name} </span> {/* Display the name of the roommate */}
                                        <input
                                            type="checkbox"
                                            value={roommate.id}  // Store the id of the roommate
                                            checked={assignees.includes(roommate.id)} // Check if the roommate's id is in assignees
                                            onChange={handleCheckboxChange}
                                        />
                                    </label>
                                ))
                            ) : (
                                <p>Loading roommates...</p>
                            )}
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
                <div className="toast-container">
                    {toasts.map((toast, index) => (
                        <Toast
                            key={index}
                            message={toast.message}
                            type={toast.type}
                            onClose={() => removeToast(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="chores-content">
                <div className="actions">
                    <button
                        onClick={fetchAllChores}
                        className={buttonClicked ? 'clicked-button' : 'default-button'}
                    >
                        Get Chores
                    </button>
                </div>

                {showChores && (
                    <div className="chore-list">
                        <h3>Chore List</h3>
                        <ul>
                            {Array.isArray(chores) && chores.length > 0 ? (
                                chores.map((chore, index) => (
                                    
                                    <li key={index}>
                                        <div className="chore-header">
                                            <h4>{chore.choreName || `Chore ID: ${index + 1}`}</h4>
                                            <button
                                                className="delete-icon"
                                                onClick={() => handleDeleteChore(chore.id, chore.choreName)}
                                            >
                                                ❌
                                            </button>
                                        </div>
                                        <p>
                                            <strong>Assigned to:</strong> 
                                            {chore.roommates?.map(id => roommates.find(r => r.id === id)?.name).join(', ')} <br />
                                            <strong>Frequency:</strong> {chore.scheduleType}
                                        </p>
                                    </li>
                                ))
                            ) : (
                                <p>No chores available</p>
                            )}
                        </ul>
                    </div>
                )}

                <div className="chore-schedule">
                    <div style={{width:"80%",margin:'auto'}}>
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
                    </div>
                    <div className="schedule-list">
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h4>Schedule:</h4>
                        <button onClick={handleSwapSchedules} style={{ width: 'auto' }}>Swap</button>
                    </div>
                    <ul>
                        {choreSchedule.length > 0 ? (
                            choreSchedule.map((entry, index) => (
                                <li key={index} >
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedFirstSchedule?.id === entry.id ||
                                            selectedSecondSchedule?.id === entry.id
                                        }
                                        onChange={(e) => {
                                            const { checked } = e.target;

                                            if (checked) {
                                                if (!selectedFirstSchedule) {
                                                    setSelectedFirstSchedule(entry);
                                                } else if (!selectedSecondSchedule) {
                                                    setSelectedSecondSchedule(entry);
                                                } else {
                                                    showToast("You can select only two schedules.", "error");
                                                    e.target.checked = false; // Revert checkbox state
                                                }
                                            } else {
                                                if (selectedFirstSchedule?.id === entry.id) {
                                                    setSelectedFirstSchedule(null);
                                                } else if (selectedSecondSchedule?.id === entry.id) {
                                                    setSelectedSecondSchedule(null);
                                                }
                                            }
                                        }}
                                        style={{ marginRight: '10px' }} // Adds spacing between the checkbox and content
                                    />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0 }}>
                                            <strong>Date:</strong> {new Date(entry.scheduled_date).toISOString().slice(0, 10)}
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            <strong>Assigned to:</strong> {roommates.find(r => r.id === parseInt(entry.assigned_to))?.name || 'N/A'}
                                        </p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p>No schedule available</p>
                        )}
                    </ul>

                </div>


                </div>
            </div>
        </div>
    );
};

export default ChoresManagement;
