import React, { useState } from 'react';
import { 
    Card, 
    Form, 
    Input, 
    Button, 
    Typography, 
    message, 
    Space, 
    Modal 
} from 'antd';
import { 
    UserOutlined, 
    LockOutlined, 
    LoginOutlined 
} from '@ant-design/icons';
import './Login.css';

const { Title } = Typography;

const Login = ({ onLoginSuccess, setUsername, setRoomId, onSignup }) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [isCreateRoomVisible, setIsCreateRoomVisible] = useState(false);
    const [isJoinRoomVisible, setIsJoinRoomVisible] = useState(false);

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    roomid: values.roomid,
                    username: values.username, 
                    password: values.password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setRoomId(values.roomid);
                setUsername(values.username);
                message.success('Login successful!');
                onLoginSuccess();
            } else {
                message.error('Invalid username or password');
            }
        } catch (error) {
            console.error('Login failed:', error);
            message.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (values) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/roomregistration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    roomid: values.roomid,
                    username: values.username, 
                    password: values.password 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                message.success('Room creation successful!');
                setIsCreateRoomVisible(false); // Close the modal on success
            }
            if (!response.ok) throw new Error(response.message);
        } catch (error) {
            console.error('Room creation failed:', error);
            message.error(error.message || 'Failed to create room');
        } 
    };

    const handleJoinRoom = async (values) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/userregistration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    roomid: values.roomid,
                    username: values.username, 
                    password: values.password,
                    roomcode: values.roomcode
                }),
            });

            console.log("Response", response)
            if (response.ok) {
                const data = await response.json();
                message.success('User creation successful!');
                setIsJoinRoomVisible(false); // Close the modal on success
            }
            if (!response.ok) throw new Error(response.message);
        } catch (error) {
            console.error('User creation failed:', error);
            message.error(error.message || 'Failed to create user');
        } 
    };

    return (
<div className="login-container">
    <Card className="login-card">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
                <Title level={2}>Welcome to Home Management System</Title>
                <Title level={4}>Login</Title>
            </div>

            <Form
                form={form}
                name="login"
                onFinish={handleLogin}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="roomid"
                    rules={[
                        { 
                            required: true, 
                            message: 'Please input your roomid!' 
                        }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Room Id"
                    />
                </Form.Item>

                <Form.Item
                    name="username"
                    rules={[
                        { 
                            required: true, 
                            message: 'Please input your username!' 
                        }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Username"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { 
                            required: true, 
                            message: 'Please input your password!' 
                        }
                    ]}
                >
                    <Input.Password 
                        prefix={<LockOutlined />} 
                        placeholder="Password"
                    />
                </Form.Item>

                <Form.Item>
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        icon={<LoginOutlined />}
                        loading={loading}
                        block
                    >
                        Log in
                    </Button>
                </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Space size="middle">
                    <Button 
                        type="default" 
                        onClick={() => setIsCreateRoomVisible(true)}
                        style={{ width: '150px' }}
                    >
                        Create Room
                    </Button>
                    <Button 
                        type="default" 
                        onClick={() => setIsJoinRoomVisible(true)}
                        style={{ width: '150px' }}
                    >
                        Join Room
                    </Button>
                </Space>
            </div>
        </Space>
    </Card>

    {/* Create Room Modal */}
    <Modal
        title="Create Room"
        visible={isCreateRoomVisible}
        onCancel={() => setIsCreateRoomVisible(false)}
        footer={null}
    >
        <Form
            name="createRoom"
            onFinish={handleCreateRoom}
            layout="vertical"
        >
            <Form.Item
                name="roomid"
                label="Room ID"
                rules={[{ required: true, message: 'Please input a room ID!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please input a password!' }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block>
                    Create Room
                </Button>
            </Form.Item>
        </Form>
    </Modal>

    {/* Join Room Modal */}
    <Modal
        title="Join Room"
        visible={isJoinRoomVisible}
        onCancel={() => setIsJoinRoomVisible(false)}
        footer={null}
    >
        <Form
            name="joinRoom"
            onFinish={handleJoinRoom}
            layout="vertical"
        >
            <Form.Item
                name="roomid"
                label="Room ID"
                rules={[{ required: true, message: 'Please input a room ID!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please input a password!' }]}
            >
                <Input.Password />
            </Form.Item>
            <Form.Item
                name="roomcode"
                label="Room Code"
                rules={[{ required: true, message: 'Please input the room code!' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" block>
                    Join Room
                </Button>
            </Form.Item>
        </Form>
    </Modal>
</div>
    );
};

export default Login;
