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
    DatePicker,
    Switch
} from 'antd';
import {
    PlusOutlined,
    ReloadOutlined,
    DeleteOutlined,
    ScheduleOutlined,
    SwapOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './ChoresManagement.css';

const { Title } = Typography;
const { Option } = Select;

const ChoresManagement = ( {roomid} ) => {
    const [form] = Form.useForm();
    const [chores, setChores] = useState([]);
    const [roommates, setRoommates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [selectedChore, setSelectedChore] = useState(null);
    const [schedule, setSchedule] = useState([]);
    const [swapMode, setSwapMode] = useState(false);
    const [selectedSchedules, setSelectedSchedules] = useState([]);

    const API_URL = 'http://localhost:3000/api';

    useEffect(() => {
        fetchChores();
        fetchRoommates();
    }, []);

    const fetchRoommates = async () => {
        try {
            console.log(roomid);
            console.log(JSON.stringify({
                roomid: roomid,
            }));
            const response = await fetch(`${API_URL}/auth/${roomid}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
               

            });
            console.log(response);
            if (!response.ok) throw new Error('Failed to fetch users');
            const data = await response.json();
            console.log('Fetched roommates:', data);
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
                    start_date: values.due_date.format('YYYY-MM-DD')
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create chore');
            
            message.success('Chore created successfully');
            form.resetFields();
            fetchChores();
        } catch (error) {
            message.error(error.message || 'Failed to create chore');
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

    const handleSwapSchedules = async () => {
        if (selectedSchedules.length !== 2) {
            message.error('Please select exactly two schedules to swap');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/chores/swapSchedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstScheduleId: selectedSchedules[0],
                    secondScheduleId: selectedSchedules[1]
                }),
            });

            if (!response.ok) throw new Error('Failed to swap schedules');
            
            message.success('Schedules swapped successfully');
            showSchedule(selectedChore);
            setSwapMode(false);
            setSelectedSchedules([]);
        } catch (error) {
            message.error('Failed to swap schedules');
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'choreName',
            key: 'choreName',
            sorter: (a, b) => a.choreName.localeCompare(b.choreName),
        },
        {
            title: 'Assigned To',
            dataIndex: 'roommates',
            key: 'roommates',
            render: (roommateIds, record) => {
                try {
                    // Parse the roommate IDs if it's a string
                    const assigneeList = Array.isArray(roommateIds) ? roommateIds : JSON.parse(roommateIds);
                    
                    return (
                        <Space wrap>
                            {assigneeList.map((assigneeId) => {
                                // Use the roommates state to find the user
                                const roommate = roommates.find(r => r.id === Number(assigneeId));
                                return (
                                    <Tag key={assigneeId} color="blue">
                                        {roommate ? roommate.name : `User ${assigneeId}`}
                                    </Tag>
                                );
                            })}
                        </Space>
                    );
                } catch (error) {
                    console.error('Error parsing roommates:', error, roommateIds);
                    return <Tag color="red">Invalid Assignment</Tag>;
                }
            }
        },
        {
            title: 'Frequency',
            dataIndex: 'scheduleType',
            key: 'scheduleType',
            render: (type) => <Tag color="purple">{type}</Tag>
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
            render: (date) => dayjs(date).format('YYYY-MM-DD')
        },
        {
            title: 'Assigned To',
            dataIndex: 'assigned_to',
            key: 'assigned_to',
            render: (assignedTo) => {
                const roommate = roommates.find(r => r.id === Number(assignedTo));
                return <Tag color="blue">{roommate ? roommate.name : 'Unknown User'}</Tag>;
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
        optionLabelProp="label"
    >
        {roommates.map(roommate => (
            <Option 
                key={roommate.id} 
                value={roommate.id} 
                label={roommate.name}
            >
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

            <Card 
                title={<Title level={3}>Chore List</Title>} 
                className="chores-list-card"
            >
                <Table
                    columns={columns}
                    dataSource={chores}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Modal
                title={
                    <Space>
                        <span>Schedule for {selectedChore?.choreName}</span>
                        {swapMode && (
                            <Tag color="orange">
                                Select two schedules to swap
                            </Tag>
                        )}
                    </Space>
                }
                open={scheduleModalVisible}
                onCancel={() => {
                    setScheduleModalVisible(false);
                    setSwapMode(false);
                    setSelectedSchedules([]);
                }}
                footer={[
                    <Button 
                        key="swap" 
                        icon={<SwapOutlined />}
                        onClick={() => setSwapMode(!swapMode)}
                    >
                        {swapMode ? 'Cancel Swap' : 'Swap Schedules'}
                    </Button>,
                    swapMode && selectedSchedules.length === 2 && (
                        <Button 
                            key="confirm" 
                            type="primary"
                            onClick={handleSwapSchedules}
                        >
                            Confirm Swap
                        </Button>
                    )
                ]}
                width={600}
            >
                <Table
                    dataSource={schedule}
                    columns={scheduleColumns}
                    rowKey="id"
                    pagination={false}
                    rowSelection={swapMode ? {
                        type: 'checkbox',
                        selectedRowKeys: selectedSchedules,
                        onChange: (selectedRowKeys) => {
                            if (selectedRowKeys.length > 2) {
                                message.warning('You can only select two schedules to swap');
                                return;
                            }
                            setSelectedSchedules(selectedRowKeys);
                        },
                    } : undefined}
                />
            </Modal>
        </div>
    );
};

export default ChoresManagement;