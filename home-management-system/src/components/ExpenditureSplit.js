import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Select,
    InputNumber,
    Table,
    Space,
    Tag,
    message,
    Popconfirm,
    Typography,
    Divider
} from 'antd';
import {
    DollarCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    PlusOutlined
} from '@ant-design/icons';
import './ExpenditureSplit.css';

const { Title, Text } = Typography;
const { Option } = Select;

const ExpenditureSplit = () => {
    const [form] = Form.useForm();
    const [participants, setParticipants] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories] = useState(['General', 'Food', 'Utility', 'Miscellaneous']);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [participantsRes, expensesRes] = await Promise.all([
                fetch('http://localhost:3000/api/auth'),
                fetch('http://localhost:3000/api/expenses')
            ]);


            const participantsData = await participantsRes.json();
            const expensesData = await expensesRes.json();

            setParticipants(participantsData);
            setExpenses(expensesData);
        } catch (error) {
            message.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const participantShares = {};
            Object.entries(values.shares || {}).forEach(([id, amount]) => {
                if (amount) participantShares[id] = amount;
            });

            const totalShares = Object.values(participantShares)
                .reduce((sum, val) => sum + Number(val), 0);

            if (Math.abs(totalShares - values.amount) > 0.01) {
                message.error('Total shares must equal the expense amount');
                return;
            }

            const splits = Object.entries(participantShares).map(([userId, amount]) => ({
                user_id: userId,
                user_name: participants.find(p => p.id === userId)?.name || 'Unknown',
                contributed_amount: Number(amount)
            }));

            const response = await fetch('http://localhost:3000/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: values.description,
                    amount: values.amount,
                    payer_id: values.payer_id,
                    split_type: 'custom',
                    splits,
                    category: values.category
                })
            });

            if (!response.ok) throw new Error('Failed to add expense');

            message.success('Expense added successfully');
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/expenses/${id}`, {
                method: 'DELETE'
            });
            message.success('Expense deleted successfully');
            fetchData();
        } catch (error) {
            message.error('Failed to delete expense');
        }
    };

    const columns = [
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => `$${Number(amount).toFixed(2)}`  // Convert string to number
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            render: (category) => (
                <Tag color="blue">{category}</Tag>
            )
        },
        {
            title: 'Paid By',
            dataIndex: 'payer_name',
            key: 'payer_name',
        },
        {
            title: 'Splits',
            key: 'splits',
            render: (_, record) => (
                <Space direction="vertical">
                    {record.splits.map((split, index) => (
                        <Text key={index}>
                            {split.user_name}: ${Number(split.amount).toFixed(2)}  {/* Convert string to number */}
                        </Text>
                    ))}
                </Space>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Popconfirm
                        title="Are you sure you want to delete this expense?"
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="expense-split-container">
            <Card className="expense-form-card">
                <Title level={2}>
                    <DollarCircleOutlined /> Add New Expense
                </Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                    >
                        <Input placeholder="Enter expense description" />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Amount"
                        rules={[{ required: true, message: 'Please enter amount' }]}
                    >
                        <InputNumber 
                            style={{ width: '100%' }}
                            min={0}
                            precision={2}
                            placeholder="Enter amount"
                        />
                    </Form.Item>

                    <Form.Item
                        name="payer_id"
                        label="Paid By"
                        rules={[{ required: true, message: 'Please select payer' }]}
                    >
                        <Select placeholder="Select payer">
                            {participants.map(participant => (
                                <Option key={participant.id} value={participant.id}>
                                    {participant.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select category' }]}
                    >
                        <Select placeholder="Select category">
                            {categories.map(category => (
                                <Option key={category} value={category}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Divider>Split Shares</Divider>

                    {participants.map(participant => (
                        <Form.Item
                            key={participant.id}
                            name={['shares', participant.id]}
                            label={participant.name}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                precision={2}
                                placeholder="Enter share amount"
                            />
                        </Form.Item>
                    ))}

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            icon={<PlusOutlined />}
                        >
                            Add Expense
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card 
                title={<Title level={3}>Expense History</Title>}
                className="expense-list-card"
            >
                <Table
                    columns={columns}
                    dataSource={expenses}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default ExpenditureSplit;