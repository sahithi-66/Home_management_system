import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar, message } from 'antd';
import { 
  LogoutOutlined,
  DollarOutlined,
  NotificationOutlined,
  CheckSquareOutlined,
  UserOutlined,
  ShoppingCartOutlined  
} from '@ant-design/icons';
import Login from './components/Login';
import ExpenditureSplit from './components/ExpenditureSplit';
import NoticeBoard from './components/NoticeBoard';
import ChoresManagement from './components/ChoresManagement';
import GroceryManagement from './components/GroceryManagement'; 
import 'antd/dist/reset.css';
import './App.css';

const { Header, Content } = Layout;
const { Text } = Typography;

const App = () => {
  const savedUsername = localStorage.getItem('username');
  const savedRoomId = localStorage.getItem('roomid');
  const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  const [isLoggedIn, setIsLoggedIn] = useState(savedIsLoggedIn || false);
  const [username, setUsername] = useState(savedUsername || '');
  const [roomid, setRoomId] = useState(setRoomId || '');
  const [activeTab, setActiveTab] = useState('ExpenditureSplit');

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('username', username);
    localStorage.setItem('roomid', roomid)
  }, [isLoggedIn, username, roomid]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setRoomId('');
    localStorage.clear();
  };

  const handleUserDelete = async (values) => {
    try {
        const response = await fetch(`http://localhost:3000/api/delete/user/`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              roomid: values.roomid,
              username: values.username,
              
          }),
        });
        
        if (!response.ok) throw new Error('Failed to delete user');
        
        message.success('User deleted successfully');
        fetchChores();
    } catch (error) {
        message.error('Failed to delete user');
    }
};

  const menuItems = [
    {
      key: 'ExpenditureSplit',
      icon: <DollarOutlined />,
      label: 'Expenditure Split'
    },
    {
      key: 'NoticeBoard',
      icon: <NotificationOutlined />,
      label: 'Notice Board'
    },
    {
      key: 'ChoresManagement',
      icon: <CheckSquareOutlined />,
      label: 'Chores Management'
    },
    {
      key: 'GroceryManagement',  
      icon: <ShoppingCartOutlined />,
      label: 'Grocery Management'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ExpenditureSplit':
        return <ExpenditureSplit />;
      case 'NoticeBoard':
        return <NoticeBoard />;
      case 'ChoresManagement':
        return <ChoresManagement />;
      case 'GroceryManagement':
        return <GroceryManagement />;
      default:
        return <ExpenditureSplit />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} setUsername={setUsername} setRoomId={setRoomId} />;
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="header-content">
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[activeTab]}
            onClick={({ key }) => setActiveTab(key)}
            items={menuItems}
          />
          <Space className="user-section">
            <Avatar icon={<UserOutlined />} />
            <Text className="welcome-text">Welcome, {username}!</Text>
            <Button 
              type="text" 
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </Button>
          </Space>
        </div>
      </Header>
      <Content className="app-content">
        {renderTabContent()}
      </Content>
    </Layout>
  );
};

export default App;