import React, { useState } from 'react';
import './NoticeBoard.css';

const NoticeBoard = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [announcements, setAnnouncements] = useState([]);

    const handleAddAnnouncement = (e) => {
        e.preventDefault();
        const newAnnouncement = { title, message };
        setAnnouncements([...announcements, newAnnouncement]);
        setTitle('');
        setMessage('');
    };

    return (
        <div className="noticeboard-wrapper">
            <div className="noticeboard-container">
                <h2>Common Notice Board</h2>
                <form onSubmit={handleAddAnnouncement}>
                    <div className="input-field">
                        <label>Title</label>
                        <input 
                            type="text" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-field">
                        <label>Message</label>
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            required 
                            rows="4"
                        />
                    </div>
                    <button type="submit">Post Announcement</button>
                </form>

                <div className="announcement-list">
                    <h3>Announcements</h3>
                    <ul>
                        {announcements.map((announcement, index) => (
                            <li key={index}>
                                <h4>{announcement.title}</h4>
                                <p>{announcement.message}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NoticeBoard;
