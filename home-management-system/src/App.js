import React, { useState } from 'react';
import Login from './components/Login';
import ExpenditureSplit from './components/ExpenditureSplit';
import NoticeBoard from './components/NoticeBoard';
import ChoresManagement from './components/ChoresManagement';

const App = () => {
    // State to track login status
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('ExpenditureSplit'); // Active tab state

    // Function to handle successful login
    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    // Function to render active tab's component
    const renderTabContent = () => {
        switch (activeTab) {
            case 'ExpenditureSplit':
                return <ExpenditureSplit />;
            case 'NoticeBoard':
                return <NoticeBoard />;
            case 'ChoresManagement':
                return <ChoresManagement />;
            default:
                return <ExpenditureSplit />;
        }
    };

    return (
        <div className="App">
            {/* If not logged in, show Login component */}
            {!isLoggedIn ? (
                <Login onLoginSuccess={handleLoginSuccess} />
            ) : (
                // If logged in, show tabs and content
                <>
                    <div className="tabs">
                        <button onClick={() => setActiveTab('ExpenditureSplit')}>
                            Expenditure Split
                        </button>
                        <button onClick={() => setActiveTab('NoticeBoard')}>
                            Notice Board
                        </button>
                        <button onClick={() => setActiveTab('ChoresManagement')}>
                            Chores Management
                        </button>
                    </div>
                    <div className="tab-content">
                        {renderTabContent()}
                    </div>
                </>
            )}
        </div>
    );
};

export default App;
