import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Table,
    Space,
    Tag,
    Modal,
    message,
    Typography,
    DatePicker
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    DeleteOutlined,
    ScheduleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './ChoresManagement.css';

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ChoresManagement = () => {
    const [form] = Form.useForm();
    const [chores, setChores] = useState([]);
    const [roommates, setRoommates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [selectedChore, setSelectedChore] = useState(null);
    const [schedule, setSchedule] = useState([]);

    const API_URL = 'http://localhost:3000/api';

    useEffect(() => {
        fetchChores();
        fetchRoommates();
    }, []);

    const fetchRoommates = async () => {
        try {
            const response = await fetch(`${API_URL}/auth`);
            console.log(response);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            setRoommates(data);
        } catch (error) {
            message.error('Failed to fetch users');
        }
    };

    const fetchChores = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/chores/fetchAll`);
            if (!response.ok) throw new Error('Failed to fetch chores');
            const data = await response.json();
            setChores(data);
        } catch (error) {
            message.error('Failed to fetch chores');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            const response = await fetch(`${API_URL}/chores/addChore`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    
                        choreName: values.title,
                        assignees: values.assignees,
                        frequency: values.frequency,
                        start_date: values.due_date.format('YYYY-MM-DD'),
                    
                }),
            });

            if (!response.ok) throw new Error('Failed to create chore');
            
            message.success('Chore created successfully');
            form.resetFields();
            fetchChores();
        } catch (error) {
            message.error('Failed to create chore');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/chores/deleteChore/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete chore');
            
            message.success('Chore deleted successfully');
            fetchChores();
        } catch (error) {
            message.error('Failed to delete chore');
        }
    };

    const showSchedule = async (chore) => {
        setSelectedChore(chore);
        try {
            const response = await fetch(`${API_URL}/chores/schedule/${chore.id}`);
            if (!response.ok) throw new Error('Failed to fetch schedule');
            const data = await response.json();
            setSchedule(data);
            setScheduleModalVisible(true);
        } catch (error) {
            message.error('Failed to fetch schedule');
        }
    };

    const rotateAssignment = async (id) => {
        try {
            const response = await fetch(`${API_URL}/chores/${id}/rotate`, {
                method: 'POST'
            });
            
            if (!response.ok) throw new Error('Failed to rotate assignment');
            
            message.success('Assignment rotated successfully');
            fetchChores();
        } catch (error) {
            message.error('Failed to rotate assignment');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'choreName',
            key: 'choreName',
        },
        
        {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
            render: (_, record) => {
                // Convert IDs to names
                const assigneeNames = JSON.parse(record.roommates || "[]")
                    .map((id) => {
                        const roommate = roommates.find((r) => r.id === id);
                        return roommate ? roommate.name : `Unknown (ID: ${id})`;
                    })
                    .join(", ");
                return assigneeNames ? <Tag color="blue">{assigneeNames}</Tag> : <Tag color="red">Unassigned</Tag>;
            },
        },
        {
            title: 'Frequency',
            dataIndex: 'scheduleType',
            key: 'scheduleType',
            
        },
        
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<ScheduleOutlined />}
                        onClick={() => showSchedule(record)}
                        title="View Schedule"
                    />
                    <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={() => rotateAssignment(record.id)}
                        title="Rotate Assignment"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.id)}
                        title="Delete"
                    />
                </Space>
            ),
        },
    ];

    const scheduleColumns = [
        {
            title: 'Date',
            dataIndex: 'scheduled_date',
            key: 'scheduled_date',
            render: (date) => dayjs(date).format('YYYY-MM-DD') // Format the date
        },
        {
            title: 'Assigned To',
            dataIndex: 'assigned_to',
            key: 'assigned_to',
            render: (assigneeId) => {
                // Find the name corresponding to the assignee ID
                const roommate = roommates.find((r) => r.id.toString() === assigneeId);
                return roommate ? <Tag color="blue">{roommate.name}</Tag> : <Tag color="red">Unknown</Tag>;
            }
        }
    ];

    return (
        <div className="chores-container">
            <Card className="chores-form-card">
                <Title level={2}>Add New Chore</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter title' }]}
                    >
                        <Input placeholder="Enter chore title" />
                    </Form.Item>

                    <Form.Item
                        name="assignees"
                        label="Assignees"
                        rules={[{ required: true, message: 'Please select assignees' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select assignees"
                            style={{ width: '100%' }}
                        >
                            {roommates.map(roommate => (
                                <Option key={roommate.id} value={roommate.id}>
                                    {roommate.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="frequency"
                        label="Frequency"
                        rules={[{ required: true, message: 'Please select frequency' }]}
                    >
                        <Select placeholder="Select frequency">
                            <Option value="DAILY">Daily</Option>
                            <Option value="WEEKLY">Weekly</Option>
                            <Option value="MONTHLY">Monthly</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="due_date"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date' }]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                            Add Chore
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="Chore List" className="chores-list-card">
                <Table
                    columns={columns}
                    dataSource={chores}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={`Schedule for ${selectedChore?.choreName}`}
                open={scheduleModalVisible}
                onCancel={() => setScheduleModalVisible(false)}
                footer={null}
                width={600}
            >
                <Table
                    dataSource={schedule}
                    columns={scheduleColumns}
                    rowKey="date"
                    pagination={false}
                />
            </Modal>
        </div>
    );
};

export default ChoresManagement;