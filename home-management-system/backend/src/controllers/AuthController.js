import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from "bcryptjs"

class AuthController {
    async login(req, res, next) {
        const { roomid, username, password } = req.body;

        try {
            const user = await User.findByUsername(username, roomid);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const { roomid } = req.params;
            const users = await User.findAll(roomid);
            res.json(users);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();