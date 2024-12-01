import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ExpenditureSplit from './components/ExpenditureSplit';
import NoticeBoard from './components/NoticeBoard';
import ChoresManagement from './components/ChoresManagement';

const App = () => {
  const savedUsername = localStorage.getItem('username');
  const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const [isLoggedIn, setIsLoggedIn] = useState(savedIsLoggedIn || false);
  const [username, setUsername] = useState(savedUsername || '');
  const [activeTab, setActiveTab] = useState('ExpenditureSplit');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('username', username);
  }, [isLoggedIn, username]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.clear();
  };

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
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} setUsername={setUsername} />
      ) : (
        <>
      <div className="logout-container" style={{
  position: 'fixed',      // Fix the position at the top right
  top: '10px',            // Set the distance from the top of the screen
  right: '10px',          // Set the distance from the right side of the screen
  zIndex: 1000,           // Ensure it's above other elements
  padding: '10px',        // Padding around the text
}}>
  <span
    onClick={handleLogout}
    style={{
      fontSize: '16px',         // Adjust font size as needed
      color: '#6b46c1',         // Color for the text
      fontWeight: 'bold',       // Bold text for visibility
      cursor: 'pointer',       // Make it look clickable
      textDecoration: 'underline', // Underline the text
    }}
  >
    Logout
  </span>
</div>


          {/* Header */}
          <header className="header bg-purple-700 text-white shadow-md">
  <div style={{ display: 'inline-flex', gap: '10px', padding: '10px' }}>
    {['Expenditure Split', 'Notice Board', 'Chores Management'].map((tab) => (
      <button
        key={tab}
        style={{
          padding: '10px 20px',
          border: 'none',
          borderRadius: '5px',
          backgroundColor: activeTab === tab.replace(/\s/g, '') ? 'white' : '#6b46c1',
          color: activeTab === tab.replace(/\s/g, '') ? '#6b46c1' : 'white',
          fontWeight: activeTab === tab.replace(/\s/g, '') ? 'bold' : 'normal',
          cursor: 'pointer',
        }}
        onClick={() => setActiveTab(tab.replace(/\s/g, ''))}
      >
        {tab}
      </button>
    ))}
  </div>
  {/* Move the logout button to the top-right */}
  <div style={{
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '10px',
  }}>
   
  </div>
</header>



          {/* Logout button at the top-right */}
          <div className="logout-container">
            {/*<span>Welcome, {username}!</span>*/}
            
          </div>

          {/* Tab content */}
          <div className="tab-content">{renderTabContent()}</div>
        </>
      )}
    </div>
  );
};

export default App;
