import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    List,
    Typography,
    Spin,
    Alert,
    Switch,
    Space,
    message,
    Tag
} from 'antd';
import {
    NotificationOutlined,
    MailOutlined,
    DeleteOutlined,
    EditOutlined
} from '@ant-design/icons';
import './NoticeBoard.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

const NoticeBoard = () => {
    const [form] = Form.useForm();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isParcel, setIsParcel] = useState(false);

    const API_URL = 'http://localhost:3000/api';

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/notices`);
            if (!response.ok) throw new Error('Failed to fetch notices');
            const data = await response.json();
            setAnnouncements(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAnnouncement = async (values) => {
        try {
            const response = await fetch(`${API_URL}/notices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: values.title,
                    content: values.content,
                    author_id: 1,
                    is_parcel: isParcel
                }),
            });

            if (!response.ok) throw new Error('Failed to add notice');

            message.success('Announcement posted successfully');
            form.resetFields();
            setIsParcel(false);
            fetchAnnouncements();
        } catch (err) {
            message.error(err.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/notices/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete notice');

            message.success('Announcement deleted successfully');
            fetchAnnouncements();
        } catch (err) {
            message.error(err.message);
        }
    };

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ maxWidth: 800, margin: '20px auto' }}
            />
        );
    }

    return (
        <div className="notice-board-container">
            <Card className="notice-form-card">
                <Title level={2}>
                    <NotificationOutlined /> Common Notice Board
                </Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddAnnouncement}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter title' }]}
                    >
                        <Input placeholder="Enter announcement title" />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Message"
                        rules={[{ required: true, message: 'Please enter message' }]}
                    >
                        <TextArea 
                            rows={4} 
                            placeholder="Enter your announcement" 
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Switch
                                checked={isParcel}
                                onChange={setIsParcel}
                            />
                            <Text>This is a parcel notification</Text>
                        </Space>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<MailOutlined />}>
                            Post Announcement
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card 
                title={<Title level={3}>Announcements</Title>} 
                className="announcements-card"
            >
                <Spin spinning={loading}>
                    <List
                        itemLayout="vertical"
                        dataSource={announcements}
                        renderItem={announcement => (
                            <List.Item
                                actions={[
                                    <Button 
                                        type="text" 
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(announcement.id)}
                                        danger
                                    >
                                        Delete
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    title={
                                        <Space>
                                            {announcement.title}
                                            {announcement.is_parcel && 
                                                <Tag color="blue">Parcel</Tag>
                                            }
                                        </Space>
                                    }
                                    description={
                                        <Text type="secondary">
                                            Posted on: {new Date(announcement.created_at).toLocaleString()}
                                        </Text>
                                    }
                                />
                                {announcement.content}
                            </List.Item>
                        )}
                    />
                </Spin>
            </Card>
        </div>
    );
};

export default NoticeBoard;