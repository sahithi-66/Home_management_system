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

const Login = ({ onLoginSuccess, setUsername }) => {
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
                    username: values.username, 
                    password: values.password 
                }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
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
                </Space>
            </Card>
        </div>
    );
};

export default Login;