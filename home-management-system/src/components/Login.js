import React, { useState } from 'react';
import { 
    Card, 
    Form, 
    Input, 
    Button, 
    Typography, 
    message, 
    Space 
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
                    roomid : values.roomid,
                    username: values.username, 
                    password: values.password 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                message.success('Room creation successful!');
            }
        } catch (error) {
            console.error('Room creation failed:', error);
            message.error(error.message || 'Failed to create room');
        } 
    };

    const handleCreateUser = async (values) => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/userregistration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    roomid : values.roomid,
                    username: values.username, 
                    password: values.password,
                    roomcode: values.roomcode

                }),
            });

            if (response.ok) {
                const data = await response.json();
                message.success('User creation successful!');
            }
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
                        <Title level={2}>Welcome to Home Management</Title>
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

                    <div style={{ textAlign: 'center' }}>
                        
                        <Space direction="horizontal" size="large">
                            <Button 
                                type="default" 
                                onClick={() => onSignup('room')} 
                                block
                            >
                                Create Room
                            </Button>
                            <Button 
                                type="default" 
                                onClick={() => onSignup('user')} 
                                block
                            >
                                Create User
                            </Button>
                        </Space>
                    </div>
                </Space>
            </Card>
        </div>
    );
};

export default Login;
