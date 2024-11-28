import React, { useState, useEffect } from 'react';
import './Grocery.css';

const Grocery = () => {
    const [items, setItems] = useState([]);
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const response = await fetch('/api/groceries');
        const data = await response.json();
        setItems(data);
    };

    const handleAddItem = async () => {
        await fetch('/api/groceries/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: itemName, quantity: itemQuantity }),
        });
        setItemName('');
        setItemQuantity(1);
        fetchItems();
    };

    const handleSubtractItem = async (name) => {
        await fetch('/api/groceries/subtract', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, quantity: itemQuantity }),
        });
        fetchItems();
    };

    return (
        <div className="grocery-container">
            <h2>Grocery List</h2>
            <div>
                <input
                    type="text"
                   