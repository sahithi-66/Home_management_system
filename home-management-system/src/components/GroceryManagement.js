import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Table,
    Space,
    Select,
    InputNumber,
    Tag,
    Popconfirm,
    Typography,
    message,
    Drawer,
    List,
    Empty,
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    HistoryOutlined,
    ShoppingCartOutlined,
    WarningOutlined
} from '@ant-design/icons';
import './GroceryManagement.css';

const { Option } = Select;
const { Title, Text } = Typography;

const GroceryManagement = () => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historyDrawer, setHistoryDrawer] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [purchaseHistory, setPurchaseHistory] = useState([]);
    const [showLowStock, setShowLowStock] = useState(false);

    const API_URL = 'http://localhost:3000/api/groceries';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch items');
            const data = await response.json();
            setItems(data);
        } catch (error) {
            message.error('Failed to fetch grocery items');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!response.ok) throw new Error('Failed to add item');
            
            message.success('Item added successfully');
            form.resetFields();
            fetchItems();
        } catch (error) {
            message.error('Failed to add item');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete item');
            
            message.success('Item deleted successfully');
            fetchItems();
        } catch (error) {
            message.error('Failed to delete item');
        }
    };

    const updateQuantity = async (id, quantity) => {
        try {
            const response = await fetch(`${API_URL}/${id}/quantity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            });

            if (!response.ok) throw new Error('Failed to update quantity');
            
            message.success('Quantity updated successfully');
            fetchItems();
        } catch (error) {
            message.error('Failed to update quantity');
        }
    };

    const showHistory = async (item) => {
        setSelectedItem(item);
        try {
            const response = await fetch(`${API_URL}/${item.id}/history`);
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            setPurchaseHistory(data);
            setHistoryDrawer(true);
        } catch (error) {
            message.error('Failed to fetch purchase history');
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <Space>
                    {quantity} {record.unit}
                    <Button.Group>
                        <Button 
                            onClick={() => updateQuantity(record.id, -1)}
                            disabled={quantity <= 0}
                        >
                            -
                        </Button>
                        <Button 
                            onClick={() => updateQuantity(record.id, 1)}
                        >
                            +
                        </Button>
                    </Button.Group>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    'IN_STOCK': 'green',
                    'LOW': 'orange',
                    'OUT_OF_STOCK': 'red'
                };
                return <Tag color={colors[status]}>{status.replace(/_/g, ' ')}</Tag>;
            },
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button 
                        icon={<HistoryOutlined />}
                        onClick={() => showHistory(record)}
                        title="View History"
                    />
                    <Popconfirm
                        title="Are you sure you want to delete this item?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button 
                            danger 
                            icon={<DeleteOutlined />}
                            title="Delete"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="grocery-container">
            <Card className="grocery-form-card">
                <Title level={2}>
                    <ShoppingCartOutlined /> Grocery Management
                </Title>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="Item Name"
                        rules={[{ required: true, message: 'Please enter item name' }]}
                    >
                        <Input placeholder="Enter item name" />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size="large">
                        <Form.Item
                            name="quantity"
                            label="Quantity"
                            rules={[{ required: true, message: 'Please enter quantity' }]}
                        >
                            <InputNumber min={0} placeholder="0" />
                        </Form.Item>

                        <Form.Item
                            name="unit"
                            label="Unit"
                            rules={[{ required: true, message: 'Please select unit' }]}
                        >
                            <Select placeholder="Select unit" style={{ width: 120 }}>
                                <Option value="pieces">Pieces</Option>
                                <Option value="kg">Kg</Option>
                                <Option value="g">g</Option>
                                <Option value="l">L</Option>
                                <Option value="ml">mL</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="category"
                            label="Category"
                            rules={[{ required: true, message: 'Please select category' }]}
                        >
                            <Select placeholder="Select category" style={{ width: 120 }}>
                                <Option value="Produce">Produce</Option>
                                <Option value="Dairy">Dairy</Option>
                                <Option value="Meat">Meat</Option>
                                <Option value="Pantry">Pantry</Option>
                                <Option value="Beverages">Beverages</Option>
                                <Option value="Snacks">Snacks</Option>
                            </Select>
                        </Form.Item>
                    </Space>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                            Add Item
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            <Card 
                title={<Title level={3}>Grocery Items</Title>}
                className="grocery-list-card"
                extra={
                    <Button 
                        type="primary" 
                        danger 
                        icon={<WarningOutlined />}
                        onClick={() => setShowLowStock(true)}
                    >
                        Low Stock Items
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="id"
                    loading={loading}
                />
            </Card>

            <Drawer
                title={`Purchase History - ${selectedItem?.name}`}
                placement="right"
                onClose={() => setHistoryDrawer(false)}
                open={historyDrawer}
                width={400}
            >
                <List
                    dataSource={purchaseHistory}
                    renderItem={item => (
                        <List.Item>
                            <List.Item.Meta
                                title={`${item.quantity} ${selectedItem?.unit}`}
                                description={`Purchased by ${item.purchaser_name} on ${new Date(item.purchased_at).toLocaleString()}`}
                            />
                        </List.Item>
                    )}
                />
            </Drawer>

<Drawer
    title="Low Stock Items"
    placement="right"
    onClose={() => setShowLowStock(false)}
    open={showLowStock}
    width={400}
>
    <List
        dataSource={items.filter(item => item.status === 'LOW' || item.status === 'OUT_OF_STOCK')}
        renderItem={item => (
            <List.Item>
                <List.Item.Meta
                    title={item.name}
                    description={
                        <Space direction="vertical">
                            <Tag color={item.status === 'LOW' ? 'orange' : 'red'}>
                                {item.status.replace(/_/g, ' ')}
                            </Tag>
                            <Text>
                                Quantity: {item.quantity} {item.unit}
                            </Text>
                        </Space>
                    }
                />
            </List.Item>
        )}
        empty={<Empty description="No low stock items" />}
    />
</Drawer>
        </div>
    );
};

export default GroceryManagement;