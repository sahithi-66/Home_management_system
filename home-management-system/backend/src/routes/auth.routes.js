import express from 'express';
import AuthController from '../controllers/AuthController.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', AuthController.login);

router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const userId = await User.create(username, password);
        res.status(201).json({ id: userId, message: 'User created successfully' });
    } catch (error) {
        next(error);
    }
});

router.get('/', AuthController.getAllUsers);

export default router;