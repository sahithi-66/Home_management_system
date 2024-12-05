import React, { useState, useEffect } from 'react';
import {
    Layout,
    Card,
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Table,
    Tag,
    Space,
    Divider,
    Typography,
    Modal,
    message,
    Row,
    Col,
    Tabs,
    Alert,
    Empty,
    Spin
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    DollarOutlined,
    UserOutlined,
    ScheduleOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import './ExpenditureSplit.css';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ExpenditureSplit = ({ splits: initialSplits = [], roomid }) => {
    const [form] = Form.useForm();
    const [splits, setSplits] = useState(initialSplits);
    const [editMode, setEditMode] = useState(null);
    const [editedExpense, setEditedExpense] = useState({});
    const [paymentAmounts, setPaymentAmounts] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [expenseName, setExpenseName] = useState('');
    const [clearedSplits, setClearedSplits] = useState('');
    const [amount, setAmount] = useState('');
    const [payerId, setPayerId] = useState('');
    const [category, setCategory] = useState('General');
    const [participantShares, setParticipantShares] = useState({});
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [showPendingSplits, setShowPendingSplits] = useState(true);
    const [showClearedSplits, setShowClearedSplits] = useState(true);
    const [showExpenses, setShowExpenses] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [categories] = useState(['General', 'Food', 'Utility', 'Travel', 'Miscellaneous']);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        const ordinal = (n) => {
            const suffixes = ["th", "st", "nd", "rd"];
            const value = n % 100;
            return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
        };
        console.log("Final Date", `${day}${ordinal(day)} ${month} ${year}`)
        return `${day}${ordinal(day)} ${month} ${year}`;
    };

    const calculateSplits = (users) => {
        const creditors = users.filter(user => user.net_amount > 0).map(user => ({ ...user }));
        const debtors = users.filter(user => user.net_amount < 0).map(user => ({ ...user }));
        const splits = [];
        let splitId = 1;

        for (let debtor of debtors) {
            while (debtor.net_amount < 0) {
                const creditor = creditors.find(creditor => creditor.net_amount > 0);
                if (!creditor) break;
                const settleAmount = Math.min(Math.abs(debtor.net_amount), creditor.net_amount);
                splits.push({
                    id: splitId++,
                    debtor: debtor.username,
                    creditor: creditor.username,
                    amount: settleAmount
                });
                debtor.net_amount += settleAmount;
                creditor.net_amount -= settleAmount;
                if (creditor.net_amount === 0) {
                    creditors.shift();
                }
            }
        }
        return splits;
    };

    const fetchExpenses = async () => {
        try {
            const response = await fetch('http://localhost:3004/api/expenses');
            const data = await response.json();
            setExpenses(data);
        } catch (error) {
            message.error('Error fetching expenses');
        } finally {
            setLoading(false);
        }
    };

    const fetchClearedSplits = async () => {
        try {
            const response = await fetch('http://localhost:3004/api/getClearedSplits');
            const data = await response.json();
            setClearedSplits(data.data);
        } catch (error) {
            message.error('Error fetching cleared splits');
        }
    };

    const fetchSplits = async () => {
        try {
            const response = await fetch('http://localhost:3004/api/getSplits');
            const data = await response.json();
            const result = calculateSplits(data.data);
            setSplits(result);
        } catch (error) {
            message.error('Error fetching pending splits');
        }
    };

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/auth/${roomid}`);
                const data = await response.json();
                setParticipants(data);
                setParticipantShares(
                    data.reduce((acc, participant) => {
                        acc[participant.id] = '';
                        return acc;
                    }, {})
                );
            } catch (error) {
                message.error('Error fetching participants');
            }
        };
        
        fetchClearedSplits();
        fetchParticipants();
        fetchExpenses();
        fetchSplits();
    }, []);

    const handleShareChange = (participant, value) => {
        setParticipantShares({
            ...participantShares,
            [participant]: value,
        });
    };

    // Add this with your other function definitions
const handleChange = (field, value) => {
    setEditedExpense(prev => ({
        ...prev,
        [field]: value
    }));
};

    const handleInputChange = (splitId, amount) => {
        setPaymentAmounts({ ...paymentAmounts, [splitId]: amount });
    };

    const showModal = (msg) => {
        setModalMessage(msg);
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const clearSplit = async (splitId, remainingAmount) => {
        const amountToClear = paymentAmounts[splitId] || 0;
    
        if (amountToClear > 0) {
            try {
                const response = await fetch(`http://localhost:3004/api/clearSplit/${splitId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: amountToClear, splits }),
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    showModal(data.message || "Split cleared successfully!");
                    setSplits(data.updatedSplits);
                    updateSummary(data.updatedSplits);
                    
                    setClearedSplits((prevClearedSplits) => {
                        const clearedSplit = data.clearedSplit;
                        if (!clearedSplit || !clearedSplit.id) {
                            return prevClearedSplits;
                        }
    
                        const existingIndex = prevClearedSplits.findIndex(
                            (split) => split.id === clearedSplit.id
                        );
    
                        if (existingIndex !== -1) {
                            const updatedClearedSplits = [...prevClearedSplits];
                            updatedClearedSplits[existingIndex] = clearedSplit;
                            return updatedClearedSplits;
                        } else {
                            return [...prevClearedSplits, clearedSplit];
                        }
                    });
                    fetchClearedSplits();
                } else {
                    message.error(data.message || "Failed to clear split");
                }
            } catch (error) {
                message.error("Failed to clear split");
            }
        } else {
            message.warning("Enter a valid amount to clear!");
        }
    };

    const updateSummary = (updatedSplits) => {
        const totalAmount = updatedSplits.reduce((acc, split) => acc + split.amount, 0);
    };

    const handleSplitChange = (index, field, value) => {
        const updatedSplits = [...editedExpense.splits];
        updatedSplits[index][field] = value;
        setEditedExpense(prev => ({
            ...prev,
            splits: updatedSplits,
        }));
    };

    const handleAddExpense = async (values) => {
        const totalShares = Object.values(participantShares)
            .map((value) => Number(value))
            .reduce((sum, val) => sum + val, 0);
    
        if (totalShares !== Number(amount)) {
            message.error('Total shares do not match the expense amount');
            return;
        }
    
        const splits = Object.entries(participantShares)
            .filter(([_, share]) => share)
            .map(([participantId, share]) => ({
                user_id: Number(participantId),
                username: participants.find((p) => p.id === Number(participantId))?.username || 'Unknown',
                contributed_amount: Number(share),
            }));
    
        const expenseData = {
            description: expenseName,
            amount: Number(amount),
            payer_id: payerId,
            split_type: 'custom',
            participantShares: splits,
            category,
        };
    
        try {
            const response = await fetch('http://localhost:3004/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expenseData),
            });
    
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add expense');
            }
            
            await fetchSplits();
            setExpenses(prev => [...prev, { ...data.expense, splits }]);
            await fetchExpenses();
            form.resetFields();
            setExpenseName('');
            setAmount('');
            setPayerId('');
            setParticipantShares({});
            setCategory('General');
            message.success('Expense added successfully');
            
        } catch (error) {
            message.error(error.message || 'Error adding expense');
        }
    };

    const handleDeleteExpense = async (expenseId) => {
        try {
            await fetch(`http://localhost:3004/api/expenses/${expenseId}`, { 
                method: 'DELETE' 
            });
            setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
            message.success('Expense deleted successfully');
            await fetchSplits();
        } catch (error) {
            message.error('Error deleting expense');
        }
    };

    const handleEditClick = (expense) => {
        setEditMode(expense.id);
        setEditedExpense({ ...expense });
    };

    const handleSave = () => {
        const updatedData = editedExpense;
        const expenseId = editMode;
        
        const totalShares = updatedData.splits
            .map((split) => Number(split.contributed_amount))
            .reduce((sum, val) => sum + val, 0);
            
        if (totalShares !== Number(updatedData.amount)) {
            setErrors(prev => ({
                ...prev,
                [expenseId]: 'Total shares do not match the expense amount'
            }));
            return;
        }

        handleUpdateExpense(editMode, editedExpense);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[expenseId];
            return newErrors;
        });
        setEditMode(null);
    };

    const handleUpdateExpense = async (expenseId, updatedData) => {
        try {
            const response = await fetch('http://localhost:3004/api/updateexpenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenseId, updatedData }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update expense');
            }
            
            await fetchExpenses();
            await fetchSplits();
            message.success('Expense updated successfully');
            
        } catch (error) {
            message.error('Error updating expense');
        }
    };

    return (
        <Layout className="expense-split-layout">
            <Card className="expense-form-card">
                <Title level={2}>Add New Expense</Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddExpense}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Expense Name"
                                rules={[{ required: true, message: 'Please enter expense name' }]}
                            >
                                <Input 
                                    prefix={<DollarOutlined />}
                                    value={expenseName}
                                    onChange={(e) => setExpenseName(e.target.value)}
                                    placeholder="Enter expense name"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Amount"
                                rules={[{ required: true, message: 'Please enter amount' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    value={amount}
                                    onChange={(value) => setAmount(value)}
                                    placeholder="Enter amount"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Payer"
                                rules={[{ required: true, message: 'Please select payer' }]}
                            >
                                <Select
                                    value={payerId}
                                    onChange={(value) => setPayerId(value)}
                                    placeholder="Select payer"
                                >
                                    {participants.map((participant) => (
                                        <Option key={participant.id} value={participant.id}>
                                            {participant.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                rules={[{ required: true, message: 'Please select category' }]}
                            >
                                <Select
                                    value={category}
                                    onChange={(value) => setCategory(value)}
                                    placeholder="Select category"
                                >
                                    {categories.map((cat) => (
                                        <Option key={cat} value={cat}>{cat}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider>Share Details</Divider>

                    {participants.map((participant) => (
                        <Form.Item
                            key={participant.id}
                            label={participant.name}
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                value={participantShares[participant.id] || ''}
                                onChange={(value) => handleShareChange(participant.id, value)}
                                placeholder="Enter share amount"
                            />
                        </Form.Item>
                    ))}

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            icon={<PlusOutlined />}
                            block
                        >
                            Add Expense
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {error && (
                <Alert 
                    message={error} 
                    type="error" 
                    showIcon 
                    closable 
                    style={{ marginBottom: 16 }} 
                />
            )}

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card>
                    <Space className="toggle-buttons">
                        <Button 
                            type={showPendingSplits ? "primary" : "default"}
                            onClick={() => setShowPendingSplits(!showPendingSplits)}
                        >
                            {showPendingSplits ? 'Hide Pending Splits' : 'Show Pending Splits'}
                        </Button>
                        <Button 
                            type={showClearedSplits ? "primary" : "default"}
                            onClick={() => setShowClearedSplits(!showClearedSplits)}
                        >
                            {showClearedSplits ? 'Hide Cleared Splits' : 'Show Cleared Splits'}
                        </Button>
                        <Button 
                            type={showExpenses ? "primary" : "default"}
                            onClick={() => setShowExpenses(!showExpenses)}
                        >
                            {showExpenses ? 'Hide Expenses' : 'Show Expenses'}
                        </Button>
                    </Space>
                </Card>

                {showPendingSplits && (
                    <Card title={<Title level={4}>Pending Splits</Title>}>
                        <div className="split-payments">
                            {splits.length > 0 ? (
                                splits.map((split) => (
                                    <Card key={split.id} className="split-item">
                                        <div className="split-info">
                                            <Space>
                                                <UserOutlined />
                                                <span>{split.debtor} owes</span>
                                                <Tag color="blue">${split.amount.toFixed(2)}</Tag>
                                                <span>to {split.creditor}</span>
                                            </Space>
                                        </div>
                                        <div className="action-row">
                                            <InputNumber
                                                placeholder="Enter amount"
                                                value={paymentAmounts[split.id] || 0}
                                                onChange={(value) => handleInputChange(split.id, value)}
                                                style={{ width: 200 }}
                                            />
                                            <Button 
                                                type="primary"
                                                onClick={() => clearSplit(split.id, paymentAmounts[split.id] || 0)}
                                            >
                                                Clear Split
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Empty description="All payments are settled!" />
                            )}
                        </div>
                    </Card>
                )}

{showClearedSplits && (
    <Card 
        title={<Title level={4}>Payment Summary</Title>}
        bodyStyle={{ padding: 0, maxHeight: '500px', overflow: 'auto' }}
    >
        <div className="recorded-payments" style={{ padding: '16px' }}>
            {clearedSplits.length > 0 ? (
                clearedSplits.map((clearedSplit, index) => (
                    <Card 
                        key={index} 
                        className="split-item"
                        style={{ marginBottom: 16 }}
                    >
                        <Space size="middle" align="center">
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                            <Tag className="date-box">
                                {formatDate(clearedSplit.cleared_at)}
                            </Tag>
                            <span>{clearedSplit.debtor} Paid</span>
                            <Tag color="blue">
                                ${parseFloat(clearedSplit.amount).toFixed(2)}
                            </Tag>
                            <span>to {clearedSplit.creditor}</span>
                        </Space>
                    </Card>
                ))
            ) : (
                <Empty 
                    description="No Payments are recorded yet!" 
                    style={{ margin: '24px 0' }}
                />
            )}
        </div>
    </Card>
)}

{showExpenses && (
    <Card 
        title={<Title level={4}>Expenses</Title>}
        bodyStyle={{ padding: 0, maxHeight: '500px', overflow: 'auto' }}
    >
        {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin size="large" />
            </div>
        ) : expenses.length === 0 ? (
            <Empty description="No expenses yet!" />
        ) : (
            <div style={{ padding: '16px' }}>
                {expenses.reverse().map((expense) => (
                    <Card 
                        key={expense.id} 
                        className="expense-card"
                        style={{ marginBottom: 16 }}
                    >
                        {editMode === expense.id ? (
                            <div className="edit-mode">
                                <Form layout="vertical">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item label="Description">
                                                <Input
                                                    value={editedExpense.description}
                                                    onChange={(e) => handleChange('description', e.target.value)}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item label="Amount">
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    value={editedExpense.amount}
                                                    onChange={(value) => handleChange('amount', value)}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item label="Paid By">
                                        <Select
                                            value={payerId}
                                            onChange={(value) => setPayerId(value)}
                                        >
                                            {participants.map((participant) => (
                                                <Option key={participant.id} value={participant.id}>
                                                    {participant.name}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item label="Category">
                                        <Select
                                            value={category}
                                            onChange={(value) => setCategory(value)}
                                        >
                                            {categories.map((cat) => (
                                                <Option key={cat} value={cat}>{cat}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Table
                                        dataSource={editedExpense.splits}
                                        columns={[
                                            { title: 'User', dataIndex: 'username' },
                                            {
                                                title: 'Amount',
                                                dataIndex: 'contributed_amount',
                                                render: (_, record, index) => (
                                                    <InputNumber
                                                        value={record.contributed_amount}
                                                        onChange={(value) => 
                                                            handleSplitChange(index, 'contributed_amount', value)
                                                        }
                                                    />
                                                )
                                            }
                                        ]}
                                        pagination={false}
                                    />

                                    {errors[expense.id] && (
                                        <Alert 
                                            message={errors[expense.id]} 
                                            type="error" 
                                            showIcon 
                                            style={{ marginTop: 16 }} 
                                        />
                                    )}

                                    <Space style={{ marginTop: 16 }}>
                                        <Button type="primary" onClick={handleSave}>
                                            Save
                                        </Button>
                                        <Button onClick={() => setEditMode(null)}>
                                            Cancel
                                        </Button>
                                    </Space>
                                </Form>
                            </div>
                        ) : (
                            <>
                                <div className="expense-header">
                                    <Space>
                                        <DollarOutlined />
                                        <span>{expense.description} - Paid by {expense.payer_name}</span>
                                    </Space>
                                    <Tag color="blue" className="expense-amount">
                                        ${expense.amount}
                                    </Tag>
                                </div>
                                <Tag color="purple" style={{ margin: '8px 0' }}>
                                    {expense.category}
                                </Tag>
                                <Table
                                    dataSource={expense.splits}
                                    columns={[
                                        { title: 'User', dataIndex: 'username' },
                                        { 
                                            title: 'Amount', 
                                            dataIndex: 'contributed_amount',
                                            render: (amount) => `$${amount}`
                                        }
                                    ]}
                                    pagination={false}
                                />
                                <div className="expense-actions" style={{ marginTop: 16 }}>
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteExpense(expense.id)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditClick(expense)}
                                    >
                                        Update
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                ))}
            </div>
        )}
    </Card>
)}
            </Space>

            <Modal
                title="Notification"
                visible={isModalVisible}
                onOk={handleModalClose}
                onCancel={handleModalClose}
                footer={[
                    <Button key="close" type="primary" onClick={handleModalClose}>
                        Close
                    </Button>
                ]}
            >
                <p>{modalMessage}</p>
            </Modal>
        </Layout>
    );
};

export default ExpenditureSplit;