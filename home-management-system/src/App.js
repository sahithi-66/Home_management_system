import React, { useState, useEffect } from 'react';
import { Layout, Menu, Typography, Button, Space, Avatar, message, Dropdown, Modal, List, Checkbox } from 'antd';
import { 
  LogoutOutlined,
  DollarOutlined,
  NotificationOutlined,
  CheckSquareOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  DeleteOutlined
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
  const [roomid, setRoomId] = useState(savedRoomId || '');
  const [activeTab, setActiveTab] = useState('ExpenditureSplit');
  const [roomcode, setRoomCode] = useState([]);
  const [roommates, setRoommates] = useState([]);
  const [roommatesModalVisible, setRoommatesModalVisible] = useState(false);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
    localStorage.setItem('username', username);
    localStorage.setItem('roomid', roomid)
  }, [isLoggedIn, username, roomid]);

  useEffect(() => {
    if (roomid){ fetchRoomCode(); fetchRoommates();}
  }, [roomid]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setRoomId('');
    setRoomCode('');
    localStorage.clear();
  };

  const fetchRoommates = async () => {
    try {
        
        const response = await fetch(`http://localhost:3000/api/auth/${roomid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
           

        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        console.log('Fetched roommates:', data);
        setRoommates(data);
    } catch (error) {
        message.error('Failed to fetch users');
    }
};

  const fetchRoomCode = async (values) => {
    
    try {
        const response = await fetch(`http://localhost:3000/api/auth/fetchcode/${roomid}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
          },
      });
        if (!response.ok) throw new Error('Failed to fetch code');
        const data = await response.json();
        setRoomCode(data);
    } catch (error) {
        message.error('Failed to fetch room code');
    }
};


const handleDeleteRoommate = async () => {
  if (!selectedRoommate) {
    message.error('Please select a roommate to delete.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/delete/user/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomid,
        username: selectedRoommate,
      }),
    });

    if (!response.ok) throw new Error('Failed to delete user');
    message.success('Roommate deleted successfully');
    fetchRoommates();
    setDeleteMode(false);
    setSelectedRoommate(null);
  } catch (error) {
    message.error('Failed to delete roommate');
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

  const userMenu = (
    <Menu>
      <Menu.Item key="roomCode" >
        Room Code: {roomcode}
      </Menu.Item>
      <Menu.Item
        key="roommates"
        icon={<TeamOutlined />}
        onClick={() => setRoommatesModalVisible(true)}
      >
        Roommates
      </Menu.Item>
    </Menu>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ExpenditureSplit':
        return <ExpenditureSplit roomid={roomid}/>;
      case 'NoticeBoard':
        return <NoticeBoard />;
      case 'ChoresManagement':
        return <ChoresManagement roomid={roomid} />;
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
            <Dropdown overlay={userMenu} trigger={['click']}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ cursor: 'pointer' }} 
                />
              </Dropdown>
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
      <Modal
        title="Roommates"
        visible={roommatesModalVisible}
        onCancel={() => {
          setRoommatesModalVisible(false);
          setDeleteMode(false);
        }}
        footer={[
          deleteMode && (
            <Button key="delete" type="danger" onClick={handleDeleteRoommate}>
              Confirm Delete
            </Button>
          ),
          <Button key="close" onClick={() => setRoommatesModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        {/* <Button
          type="primary"
          icon={<DeleteOutlined />}
          onClick={() => setDeleteMode(!deleteMode)}
        >
          {deleteMode ? 'Cancel Delete' : 'Delete Users'}
        </Button> */}
        <List
          dataSource={roommates}
          renderItem={(roommate) => (
            <List.Item>
              {deleteMode && (
                <Checkbox
                  checked={selectedRoommate === roommate.username}
                  onChange={() =>
                    setSelectedRoommate(
                      selectedRoommate === roommate.username ? null : roommate.username
                    )
                  }
                />
              )}
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={roommate.name}
              />
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default App;